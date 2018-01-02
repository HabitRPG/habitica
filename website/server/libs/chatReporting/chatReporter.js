import find from 'lodash/find';
import nconf from 'nconf';

import {
  BadRequest,
  NotFound,
} from '../errors';
import { getUserInfo, getGroupUrl, sendTxn } from '../email';
import { getAuthorEmailFromMessage } from '../chat';
import slack from '../slack';
import { model as Group } from '../../models/group';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');
const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

export default class ChatReporter {
  constructor (req, res) {
    this.req = req;
    this.res = res;

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

    let message = find(group.chat, {id: this.req.params.chatId});
    if (!message) throw new NotFound(this.res.t('messageGroupChatNotFound'));
    if (message.uuid === 'system') throw new BadRequest(this.res.t('messageCannotFlagSystemMessages', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL}));

    return {message, group};
  }

  async notify (group, message) {
    let reporterEmailContent = getUserInfo(this.user, ['email']).email;
    let authorEmail = await getAuthorEmailFromMessage(message);
    let groupUrl = getGroupUrl(group);

    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', [
      {name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString()},
      {name: 'MESSAGE_TEXT', content: message.text},

      {name: 'REPORTER_USERNAME', content: this.user.profile.name},
      {name: 'REPORTER_UUID', content: this.user._id},
      {name: 'REPORTER_EMAIL', content: reporterEmailContent},
      {name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${this.user._id}`},

      {name: 'AUTHOR_USERNAME', content: message.user},
      {name: 'AUTHOR_UUID', content: message.uuid},
      {name: 'AUTHOR_EMAIL', content: authorEmail},
      {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${message.uuid}`},

      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
    ]);

    slack.sendFlagNotification({
      authorEmail,
      flagger: this.user,
      group,
      message,
    });
  }

  async flagGroupMessage (group, message) {
    let update = {$set: {}};
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.contributor.admin) throw new NotFound(this.res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[this.user._id] = true;
    update.$set[`chat.$.flags.${this.user._id}`] = true;

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (this.user.contributor.admin) {
      // Arbitrary amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++;
    }
    update.$set['chat.$.flagCount'] = message.flagCount;

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      update
    ).exec();
  }

  async flag () {
    let {message, group} = await this.validate();
    await this.flagGroupMessage(group, message);
    await this.notify(group, message);
    return message;
  }
}
