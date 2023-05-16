import _ from 'lodash';
import { authWithHeaders } from '../../middlewares/auth';
import { getAnalyticsServiceByEnvironment } from '../../libs/analyticsService';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';
import {
  getUserInfo,
  sendTxn as sendTxnEmail,
} from '../../libs/email';
import common from '../../../common';
import { sendNotification as sendPushNotification } from '../../libs/pushNotifications';
import apiError from '../../libs/apiError';
import { questActivityWebhook } from '../../libs/webhook';

const analytics = getAnalyticsServiceByEnvironment();

const questScrolls = common.content.quests;

function canStartQuestAutomatically (group) {
  // If all members are either true (accepted) or false (rejected) return true
  // If any member is null/undefined (undecided) return false
  return _.every(group.quest.members, _.isBoolean);
}

/**
 * @apiDefine QuestNotFound
 * @apiError (404) {NotFound} QuestNotFound The specified quest could not be found.
 */

/**
 * @apiDefine QuestLeader Quest Leader
 * The quest leader can use this route.
 */

const api = {};

/**
 * @api {post} /api/v3/groups/:groupId/quests/invite/:questKey Invite users to a quest
 * @apiName InviteToQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 * @apiParam (Path) {String} questKey
 *
 * @apiSuccess {Object} data Quest object
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.inviteToQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/invite/:questKey',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { questKey } = req.params;
    const quest = questScrolls[questKey];

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: basicGroupFields.concat(' quest chat') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!quest) throw new NotFound(apiError('questNotFound', { key: questKey }));
    if (!user.items.quests[questKey]) throw new NotAuthorized(res.t('questNotOwned'));
    if (group.quest.key) throw new NotAuthorized(res.t('questAlreadyUnderway'));

    const members = await User.find({
      'party._id': group._id,
      _id: { $ne: user._id },
    })
      .select('auth preferences.emailNotifications preferences.pushNotifications preferences.language profile.name pushDevices webhooks')
      .exec();

    group.markModified('quest');
    group.quest.key = questKey;
    group.quest.leader = user._id;
    group.quest.members = {};
    group.quest.members[user._id] = true;

    user.party.quest.RSVPNeeded = false;
    user.party.quest.key = questKey;

    await User.updateMany({
      'party._id': group._id,
      _id: { $ne: user._id },
    }, {
      $set: {
        'party.quest.RSVPNeeded': true,
        'party.quest.key': questKey,
      },
    }).exec();

    _.each(members, member => {
      group.quest.members[member._id] = null;
    });

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    const [savedGroup] = await Promise.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    // send out invites
    const inviterVars = getUserInfo(user, ['name', 'email']);
    const membersToEmail = members.filter(member => {
      // send push notifications while filtering members before sending emails
      if (member.preferences.pushNotifications.invitedQuest !== false) {
        sendPushNotification(
          member,
          {
            title: quest.text(member.preferences.language),
            message: res.t('questInvitationNotificationInfo', member.preferences.language),
            identifier: 'questInvitation',
            category: 'questInvitation',
          },
        );
      }

      // Send webhooks
      questActivityWebhook.send(member, {
        type: 'questInvited',
        group,
        quest,
      });

      return member.preferences.emailNotifications.invitedQuest !== false;
    });
    sendTxnEmail(membersToEmail, `invite-${quest.boss ? 'boss' : 'collection'}-quest`, [
      { name: 'QUEST_NAME', content: quest.text() },
      { name: 'INVITER', content: inviterVars.name },
      { name: 'PARTY_URL', content: '/party' },
    ]);

    // Send webhook to the inviter too
    questActivityWebhook.send(user, {
      type: 'questInvited',
      group,
      quest,
    });

    // track that the inviting user has accepted the quest
    analytics.track('quest', {
      category: 'behavior',
      owner: true,
      response: 'accept',
      gaLabel: 'accept',
      questName: questKey,
      uuid: user._id,
      headers: req.headers,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/accept Accept a pending quest
 * @apiName AcceptQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.acceptQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/accept',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: basicGroupFields.concat(' quest chat') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInviteNotFound'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyStartedFriendly'));
    if (group.quest.members[user._id]) throw new BadRequest(res.t('questAlreadyAccepted'));

    const acceptedSuccessfully = await group.handleQuestInvitation(user, true);
    if (!acceptedSuccessfully) {
      throw new NotAuthorized(res.t('questAlreadyAccepted'));
    }

    user.party.quest.RSVPNeeded = false;
    await user.save();

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    const savedGroup = await group.save();

    res.respond(200, savedGroup.quest);

    // track that a user has accepted the quest
    analytics.track('quest', {
      category: 'behavior',
      owner: false,
      response: 'accept',
      gaLabel: 'accept',
      questName: group.quest.key,
      uuid: user._id,
      headers: req.headers,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/reject Reject a quest
 * @apiName RejectQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.rejectQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/reject',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: basicGroupFields.concat(' quest chat') });
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInvitationDoesNotExist'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyStartedFriendly'));
    if (group.quest.members[user._id]) throw new BadRequest(res.t('questAlreadyAccepted'));
    if (group.quest.members[user._id] === false) throw new BadRequest(res.t('questAlreadyRejected'));

    const rejectedSuccessfully = await group.handleQuestInvitation(user, false);
    if (!rejectedSuccessfully) {
      throw new NotAuthorized(res.t('questAlreadyRejected'));
    }

    user.party.quest = Group.cleanQuestUser(user.party.quest.progress);
    user.markModified('party.quest');
    await user.save();

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    const savedGroup = await group.save();

    res.respond(200, savedGroup.quest);

    analytics.track('quest', {
      category: 'behavior',
      owner: false,
      response: 'reject',
      gaLabel: 'reject',
      questName: group.quest.key,
      uuid: user._id,
      headers: req.headers,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/force-start Force-start a pending quest
 * @apiName ForceQuestStart
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiPermission QuestLeader
 * @apiPermission GroupLeader
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.forceStart = {
  method: 'POST',
  url: '/groups/:groupId/quests/force-start',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: basicGroupFields.concat(' quest chat') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questNotPending'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyStarted'));
    if (!(user._id === group.quest.leader || user._id === group.leader)) {
      throw new NotAuthorized(res.t('questOrGroupLeaderOnlyStartQuest'));
    }

    group.markModified('quest');

    await group.startQuest(user);

    const [savedGroup] = await Promise.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    analytics.track('quest', {
      category: 'behavior',
      owner: user._id === group.quest.leader,
      response: 'force-start',
      gaLabel: 'force-start',
      questName: group.quest.key,
      uuid: user._id,
      headers: req.headers,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/cancel Cancel a quest that is not active
 * @apiName CancelQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiPermission QuestLeader
 * @apiPermission GroupLeader
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.cancelQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Cancel a quest BEFORE it has begun (i.e., in the invitation stage)
    // Quest scroll has not yet left quest owner's inventory so no need to return it.
    // Do not wipe quest progress for members because they'll
    // want it to be applied to the next quest that's started.
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId, fields: basicGroupFields.concat(' quest') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInvitationDoesNotExist'));
    if (user._id !== group.leader && group.quest.leader !== user._id) {
      throw new NotAuthorized(res.t('onlyLeaderCancelQuest'));
    }
    if (group.quest.active) throw new NotAuthorized(res.t('cantCancelActiveQuest'));

    const questName = questScrolls[group.quest.key].text('en');
    const newChatMessage = group.sendChat({
      message: `\`${user.profile.name} cancelled the party quest ${questName}.\``,
      info: {
        type: 'quest_cancel',
        user: user.profile.name,
        quest: group.quest.key,
      },
    });

    group.quest = Group.cleanGroupQuest();
    group.markModified('quest');

    const [savedGroup] = await Promise.all([
      group.save(),
      newChatMessage.save(),
      User.updateMany(
        { 'party._id': groupId },
        Group.cleanQuestParty(),
      ).exec(),
    ]);

    res.respond(200, savedGroup.quest);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/abort Abort the current quest
 * @apiName AbortQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiPermission QuestLeader
 * @apiPermission GroupLeader
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.abortQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/abort',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Abort a quest AFTER it has begun
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId, fields: basicGroupFields.concat(' quest chat') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.active) throw new NotFound(res.t('noActiveQuestToAbort'));
    if (user._id !== group.leader && user._id !== group.quest.leader) throw new NotAuthorized(res.t('onlyLeaderAbortQuest'));

    const questName = questScrolls[group.quest.key].text('en');
    const newChatMessage = group.sendChat({
      message: `\`${common.i18n.t('chatQuestAborted', { username: user.profile.name, questName }, 'en')}\``,
      info: {
        type: 'quest_abort',
        user: user.profile.name,
        quest: group.quest.key,
      },
    });
    await newChatMessage.save();

    const memberUpdates = User.updateMany({
      'party._id': groupId,
    }, Group.cleanQuestParty()).exec();

    const questLeaderUpdate = User.updateOne({
      _id: group.quest.leader,
    }, {
      $inc: {
        [`items.quests.${group.quest.key}`]: 1, // give back the quest to the quest leader
      },
    }).exec();

    group.quest = Group.cleanGroupQuest();
    group.markModified('quest');

    const [groupSaved] = await Promise.all([group.save(), memberUpdates, questLeaderUpdate]);

    res.respond(200, groupSaved.quest);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/leave Leave the active quest
 * @apiName LeaveQuest
 * @apiGroup Quest
 *
 * @apiParam (Path) {String} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 *
 * @apiUse GroupNotFound
 * @apiUse QuestNotFound
 */
api.leaveQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/leave',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId, fields: basicGroupFields.concat(' quest') });

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (group.quest.leader === user._id) throw new NotAuthorized(res.t('questLeaderCannotLeaveQuest'));
    if (!group.quest.members[user._id]) throw new NotAuthorized(res.t('notPartOfQuest'));

    group.quest.members[user._id] = false;
    group.markModified('quest.members');

    user.party.quest = Group.cleanQuestUser(user.party.quest.progress);
    user.markModified('party.quest');

    const [savedGroup] = await Promise.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);
  },
};

export default api;
