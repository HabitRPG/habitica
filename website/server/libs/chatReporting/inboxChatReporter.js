import { model as User } from '../../models/user';

import ChatReporter from './chatReporter';
import {
  BadRequest,
} from '../errors';
import { getUserInfo } from '../email';
import * as slack from '../slack';
import { apiError } from '../apiError';

import * as inboxLib from '../inbox';
import { getAuthorEmailFromMessage } from '../chat';

export default class InboxChatReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);

    this.user = res.locals.user;
    this.inboxUser = res.locals.user;
  }

  async validate () {
    this.req.checkParams('messageId', apiError('messageIdRequired')).notEmpty();

    const validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (this.user.hasPermission('moderator') && this.req.query.userId) {
      this.inboxUser = await User.findOne({ _id: this.req.query.userId }).exec();
    }

    const message = await inboxLib.getUserInboxMessage(this.inboxUser, this.req.params.messageId);
    if (!message) throw new BadRequest(this.res.t('messageGroupChatNotFound'));

    const userComment = this.req.body.comment;

    return { message, userComment };
  }

  async notify (message, userComment) {
    slack.sendInboxFlagNotification({
      messageUserEmail: this.messageUserEmail,
      flagger: this.user,
      message,
      userComment,
    });
  }

  async getAuthorVariables (message) {
    const messageUser = {
      user: message.user,
      username: message.username,
      uuid: message.uuid,
      email: await getAuthorEmailFromMessage(message),
    };

    const reporter = {
      user: this.user.profile.name,
      username: this.user.auth.local.username,
      uuid: this.user._id,
      email: getUserInfo(this.user, ['email']).email,
    };

    // if message.sent, the reporter is the author of this message
    const sendingUser = message.sent ? reporter : messageUser;
    const recipient = message.sent ? messageUser : reporter;

    this.messageUserEmail = message.sent ? recipient.email : sendingUser.email;

    return [
      ...this.createGenericAuthorVariables('AUTHOR', sendingUser),
      ...this.createGenericAuthorVariables('RECIPIENT', recipient),
    ];
  }

  updateMessageAndSave (message, ...changedFields) { // eslint-disable-line class-methods-use-this
    for (const changedField of changedFields) {
      message.markModified(changedField);
    }

    return message.save();
  }

  flagInboxMessage (message) {
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.hasPermission('moderator')) {
      throw new BadRequest(this.res.t('messageGroupChatFlagAlreadyReported'));
    }

    message.flags[this.user._id] = true;
    message.flagCount = 1;

    return this.updateMessageAndSave(message, 'flags', 'flagCount');
  }

  async markMessageAsReported (message) {
    message.reported = true;

    return this.updateMessageAndSave(message, 'reported');
  }

  async flag () {
    const { message, userComment } = await this.validate();
    await this.flagInboxMessage(message);
    await this.notify(message, userComment);
    await this.markMessageAsReported(message);
    return message;
  }
}
