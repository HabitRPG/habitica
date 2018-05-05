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
import apiError from '../apiError';

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
    this.req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    this.req.checkParams('chatId', this.res.t('chatIdRequired')).notEmpty();

    let validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({
      user: this.user,
      groupId: this.groupId,
      optionalMembership: this.user.contributor.admin,
    });
    if (!group) throw new NotFound(this.res.t('groupNotFound'));

    const message = await Chat.findOne({_id: this.req.params.chatId}).exec();
    if (!message) throw new NotFound(this.res.t('messageGroupChatNotFound'));
    if (message.uuid === 'system') throw new BadRequest(this.res.t('messageCannotFlagSystemMessages', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL}));

    const userComment = this.req.body.comment;

    return {message, group, userComment};
  }

  async notify (group, message, userComment) {
    await super.notify(group, message);

    const groupUrl = getGroupUrl(group);
    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods-with-comments', this.emailVariables.concat([
      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
      {name: 'REPORTER_COMMENT', content: userComment || ''},
    ]));

    slack.sendFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      group,
      message,
      userComment,
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
    let {message, group, userComment} = await this.validate();
    await this.flagGroupMessage(group, message);
    await this.notify(group, message, userComment);
    return message;
  }
}
