import nconf from 'nconf';

import ChatReporter from './chatReporter';
import {
  BadRequest,
  NotFound,
} from '../errors';
import { getGroupUrl, sendTxn } from '../email';
import slack from '../slack';
import { model as Group } from '../../models/group';
import { model as Chat } from '../../models/chat';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');
const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

export default class GroupChatReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);

    this.user = res.locals.user;
    this.groupId = req.params.groupId;
  }

  async validate () {
    this.req.checkParams('groupId', this.res.t('groupIdRequired')).notEmpty();
    this.req.checkParams('chatId', this.res.t('chatIdRequired')).notEmpty();

    let validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({
      user: this.user,
      groupId: this.groupId,
      optionalMembership: this.user.contributor.admin,
    });
    if (!group) throw new NotFound(this.res.t('groupNotFound'));

    let message = await Chat.findOne({id: this.req.params.chatId}).exec();
    if (!message) throw new NotFound(this.res.t('messageGroupChatNotFound'));
    if (message.uuid === 'system') throw new BadRequest(this.res.t('messageCannotFlagSystemMessages', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL}));

    return {message, group};
  }

  async notify (group, message) {
    await super.notify(group, message);

    const groupUrl = getGroupUrl(group);
    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', this.emailVariables.concat([
      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
    ]));

    slack.sendFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      group,
      message,
    });
  }

  async flagGroupMessage (group, message) {
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.contributor.admin) throw new NotFound(this.res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[this.user._id] = true;
    message.markModified('flags');

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (this.user.contributor.admin) {
      // Arbitrary amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++;
    }
    await message.save();
  }

  async flag () {
    let {message, group} = await this.validate();
    await this.flagGroupMessage(group, message);
    await this.notify(group, message);
    return message;
  }
}
