import nconf from 'nconf';
import { model as User } from '../../models/user';

import ChatReporter from './chatReporter';
import {
  NotFound,
} from '../errors';
import { getGroupUrl, sendTxn } from '../email';
import slack from '../slack';
import apiError from '../apiError';

import _find from 'lodash/find';
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

    const messages = await inboxLib.getUserInbox(this.inboxUser);

    const message = _find(messages, (m) => m.id === this.req.params.messageId);
    if (!message) throw new NotFound(this.res.t('messageGroupChatNotFound'));

    const userComment = this.req.body.comment;

    return {message, userComment};
  }

  async notify (message, userComment) {
    const group = {
      type: 'private messages',
    };

    await super.notify(group, message);

    const groupUrl = getGroupUrl(group);
    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods-with-comments', this.emailVariables.concat([
      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
      {name: 'REPORTER_COMMENT', content: userComment || ''},
    ]));

    slack.sendInboxFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      message,
      userComment,
    });
  }

  updateMessageAndSave (message, updateFunc) {
    updateFunc(message);

    return inboxLib.updateMessage(message);
  }

  flagInboxMessage (message) {
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.contributor.admin) {
      throw new NotFound(this.res.t('messageGroupChatFlagAlreadyReported'));
    }

    return this.updateMessageAndSave(message, (m) => {
      m.flags[this.user._id] = true;

      // Log total number of flags (publicly viewable)
      if (!m.flagCount) m.flagCount = 0;
      if (this.user.contributor.admin) {
        // Arbitrary amount, higher than 2
        m.flagCount = 5;
      } else {
        m.flagCount++;
      }
    });
  }

  async markMessageAsReported (message) {
    return this.updateMessageAndSave(message, (m) => {
      m.reported = true;
    });
  }

  async flag () {
    let {message, userComment} = await this.validate();
    await this.flagInboxMessage(message);
    await this.notify(message, userComment);
    await this.markMessageAsReported(message);
    return message;
  }
}
