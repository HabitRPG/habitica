import nconf from 'nconf';
import { model as User } from '../../models/user';

import ChatReporter from './chatReporter';
import {
  BadRequest,
} from '../errors';
import { getGroupUrl, sendTxn } from '../email';
import slack from '../slack';
import apiError from '../apiError';

import * as inboxLib from '../inbox';

const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

export default class InboxChatReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);

    this.user = res.locals.user;
    this.inboxUser = res.locals.user;
  }

  async validate () {
    this.req.checkParams('messageId', apiError('messageIdRequired')).notEmpty();

    let validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (this.user.contributor.admin && this.req.query.userId) {
      this.inboxUser = await User.findOne({_id: this.req.query.userId});
    }

    const message = await inboxLib.getUserInboxMessage(this.inboxUser, this.req.params.messageId);
    if (!message) throw new BadRequest(this.res.t('messageGroupChatNotFound'));

    const userComment = this.req.body.comment;

    return {message, userComment};
  }

  async notify (message, userComment) {
    const group = {
      type: 'private messages',
      name: 'N/A',
      _id: 'N/A',
    };

    await super.notify(group, message);

    const groupUrl = getGroupUrl(group);
    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods-with-comments', this.emailVariables.concat([
      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl || 'N/A'},
      {name: 'REPORTER_COMMENT', content: userComment || ''},
    ]));

    slack.sendInboxFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      message,
      userComment,
    });
  }

  updateMessageAndSave (message, ...changedFields) {
    for (const changedField of changedFields) {
      message.markModified(changedField);
    }

    return message.save();
  }

  flagInboxMessage (message) {
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.contributor.admin) {
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
    let {message, userComment} = await this.validate();
    await this.flagInboxMessage(message);
    await this.notify(message, userComment);
    await this.markMessageAsReported(message);
    return message;
  }
}
