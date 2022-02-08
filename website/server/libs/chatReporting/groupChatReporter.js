import nconf from 'nconf';
import moment from 'moment';

import ChatReporter from './chatReporter';
import {
  BadRequest,
  NotFound,
} from '../errors';
import { sendTxn } from '../email';
import * as slack from '../slack';
import { model as Group } from '../../models/group';
import { chatModel as Chat } from '../../models/message';
import apiError from '../apiError';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS_COMMUNITY_MANAGER_EMAIL');
const FLAG_REPORT_EMAILS = nconf
  .get('FLAG_REPORT_EMAIL')
  .split(',')
  .map(email => ({ email, canSend: true }));
const USER_AGE_FOR_FLAGGING = 3; // accounts less than this many days old don't increment flagCount

export default class GroupChatReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);

    this.user = res.locals.user;
    this.groupId = req.params.groupId;
  }

  async validate () {
    this.req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    this.req.checkParams('chatId', apiError('chatIdRequired')).notEmpty();

    const validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({
      user: this.user,
      groupId: this.groupId,
      optionalMembership: this.user.hasPermission('moderator'),
    });
    if (!group) throw new NotFound(this.res.t('groupNotFound'));

    const message = await Chat.findOne({ _id: this.req.params.chatId }).exec();
    if (!message) throw new NotFound(this.res.t('messageGroupChatNotFound'));
    if (message.uuid === 'system') throw new BadRequest(this.res.t('messageCannotFlagSystemMessages', { communityManagerEmail: COMMUNITY_MANAGER_EMAIL }));

    const userComment = this.req.body.comment;

    return { message, group, userComment };
  }

  async notify (group, message, userComment, automatedComment = '') {
    let emailVariables = await this.getMessageVariables(group, message);
    emailVariables = emailVariables.concat([
      { name: 'REPORTER_COMMENT', content: userComment || '' },
    ]);

    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods-with-comments', emailVariables);

    slack.sendFlagNotification({
      authorEmail: this.authorEmail,
      flagger: this.user,
      group,
      message,
      userComment,
      automatedComment,
    });
  }

  async flagGroupMessage (group, message, increaseFlagCount) {
    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[this.user._id] && !this.user.hasPermission('moderator')) throw new NotFound(this.res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[this.user._id] = true;
    message.markModified('flags');

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (this.user.hasPermission('moderator')) {
      // Arbitrary amount, higher than 2
      message.flagCount = 5;
    } else if (increaseFlagCount) {
      message.flagCount += 1;
    }

    await message.save();
  }

  async flag () {
    const { message, group, userComment } = await this.validate();

    let increaseFlagCount = true;
    let automatedComment = '';
    if (moment().diff(this.user.auth.timestamps.created, 'days') < USER_AGE_FOR_FLAGGING) {
      increaseFlagCount = false;
      automatedComment = `The post's flag count has not been increased because the flagger's account is less than ${USER_AGE_FOR_FLAGGING} days old.`;
      // This is to prevent trolls from making new accounts to maliciously flag-and-hide.
    }

    await this.notify(group, message, userComment, automatedComment);
    await this.flagGroupMessage(group, message, increaseFlagCount);
    return message;
  }
}
