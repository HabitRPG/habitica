import find from 'lodash/find';
import nconf from 'nconf';

import ChatReporter from './chatReporter';
import {
  NotFound,
} from '../errors';
import { sendTxn } from '../email';
import slack from '../slack';

const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

export default class InboxChatReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);
    this.user = res.locals.user;
  }

  async validate () {
    this.req.checkParams('chatId', this.res.t('chatIdRequired')).notEmpty();

    const validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    const message = find(this.user.inbox.messages, {id: this.req.params.chatId});
    if (!message) throw new NotFound(this.res.t('messageChatNotFound'));

    return {message};
  }

  async notify (group, message) {
    await super.notify(group, message);

    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', this.emailVariables);

    slack.sendInboxFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      message,
    });
  }

  async flagInboxMessage (message) {
    let update = {$set: {}};
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.contributor.admin) throw new NotFound(this.res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[this.user._id] = true;
    // update.$set[`inbox.messages.$.flags.${this.user._id}`] = true;

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (this.user.contributor.admin) {
      // Arbitrary amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++;
    }
    update.$set['inbox.messages.$.flagCount'] = message.flagCount;

    this.user.markModified('inbox.messages');
    await this.user.save();
  }

  async flag () {
    let {message} = await this.validate();
    await this.flagInboxMessage(message);
    await this.notify(null, message);
    return message;
  }
}
