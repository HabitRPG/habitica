import _ from 'lodash';
import Bluebird from 'bluebird';
import { authWithHeaders } from '../../middlewares/api-v3/auth';
import analytics from '../../libs/api-v3/analyticsService';
import {
  model as Group,
} from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import {
  getUserInfo,
  sendTxn as sendTxnEmail,
} from '../../libs/api-v3/email';
import common from '../../../../common';
import sendPushNotification from '../../libs/api-v3/pushNotifications';

const questScrolls = common.content.quests;

function canStartQuestAutomatically (group)  {
  // If all members are either true (accepted) or false (rejected) return true
  // If any member is null/undefined (undecided) return false
  return _.every(group.quest.members, _.isBoolean);
}

let api = {};

/**
 * @api {post} /api/v3/groups/:groupId/quests/invite Invite users to a quest
 * @apiVersion 3.0.0
 * @apiName InviteToQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 * @apiParam {string} questKey
 *
 * @apiSuccess {Object} data Quest object
 */
api.inviteToQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/invite/:questKey',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let questKey = req.params.questKey;
    let quest = questScrolls[questKey];

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: 'type quest'});

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!quest) throw new NotFound(res.t('questNotFound', { key: questKey }));
    if (!user.items.quests[questKey]) throw new NotAuthorized(res.t('questNotOwned'));
    if (user.stats.lvl < quest.lvl) throw new NotAuthorized(res.t('questLevelTooHigh', { level: quest.lvl }));
    if (group.quest.key) throw new NotAuthorized(res.t('questAlreadyUnderway'));

    let members = await User.find({
      'party._id': group._id,
      _id: {$ne: user._id},
    }).select('auth.facebook auth.local preferences.emailNotifications profile.name pushDevices')
    .exec();

    group.markModified('quest');
    group.quest.key = questKey;
    group.quest.leader = user._id;
    group.quest.members = {};
    group.quest.members[user._id] = true;

    user.party.quest.RSVPNeeded = false;
    user.party.quest.key = questKey;

    await User.update({
      'party._id': group._id,
      _id: {$ne: user._id},
    }, {
      $set: {
        'party.quest.RSVPNeeded': true,
        'party.quest.key': questKey,
      },
    }, {multi: true}).exec();

    _.each(members, (member) => {
      group.quest.members[member._id] = null;
    });

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    let [savedGroup] = await Bluebird.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    // send out invites
    let inviterVars = getUserInfo(user, ['name', 'email']);
    let membersToEmail = members.filter(member => {
      // send push notifications while filtering members before sending emails
      sendPushNotification(
        member,
        common.i18n.t('questInvitationTitle'),
        common.i18n.t('questInvitationInfo', { quest: quest.text() })
      );

      return member.preferences.emailNotifications.invitedQuest !== false;
    });
    sendTxnEmail(membersToEmail, `invite-${quest.boss ? 'boss' : 'collection'}-quest`, [
      {name: 'QUEST_NAME', content: quest.text()},
      {name: 'INVITER', content: inviterVars.name},
      {name: 'PARTY_URL', content: '/#/options/groups/party'},
    ]);

    // track that the inviting user has accepted the quest
    analytics.track('quest', {
      category: 'behavior',
      owner: true,
      response: 'accept',
      gaLabel: 'accept',
      questName: questKey,
      uuid: user._id,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/accept Accept a pending quest
 * @apiVersion 3.0.0
 * @apiName AcceptQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.acceptQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/accept',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: 'type quest'});

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInviteNotFound'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyUnderway'));
    if (group.quest.members[user._id]) throw new BadRequest(res.t('questAlreadyAccepted'));

    group.markModified('quest');
    group.quest.members[user._id] = true;
    user.party.quest.RSVPNeeded = false;

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    let [savedGroup] = await Bluebird.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    // track that a user has accepted the quest
    analytics.track('quest', {
      category: 'behavior',
      owner: false,
      response: 'accept',
      gaLabel: 'accept',
      questName: group.quest.key,
      uuid: user._id,
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/reject Reject a quest
 * @apiVersion 3.0.0
 * @apiName RejectQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.rejectQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/reject',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: 'type quest'});
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInvitationDoesNotExist'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyUnderway'));
    if (group.quest.members[user._id]) throw new BadRequest(res.t('questAlreadyAccepted'));
    if (group.quest.members[user._id] === false) throw new BadRequest(res.t('questAlreadyRejected'));

    group.quest.members[user._id] = false;
    group.markModified('quest.members');

    user.party.quest = Group.cleanQuestProgress();
    user.markModified('party.quest');

    if (canStartQuestAutomatically(group)) {
      await group.startQuest(user);
    }

    let [savedGroup] = await Bluebird.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    analytics.track('quest', {
      category: 'behavior',
      owner: false,
      response: 'reject',
      gaLabel: 'reject',
      questName: group.quest.key,
      uuid: user._id,
    });
  },
};


/**
 * @api {post} /api/v3/groups/:groupId/quests/force-start Force-start a pending quest
 * @apiVersion 3.0.0
 * @apiName ForceQuestStart
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.forceStart = {
  method: 'POST',
  url: '/groups/:groupId/quests/force-start',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: 'type quest leader'});

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questNotPending'));
    if (group.quest.active) throw new NotAuthorized(res.t('questAlreadyUnderway'));
    if (!(user._id === group.quest.leader || user._id === group.leader)) throw new NotAuthorized(res.t('questOrGroupLeaderOnlyStartQuest'));

    group.markModified('quest');

    await group.startQuest(user);

    let [savedGroup] = await Bluebird.all([
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
    });
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/cancel Cancels a quest that is not active
 * @apiVersion 3.0.0
 * @apiName CancelQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.cancelQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/cancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Cancel a quest BEFORE it has begun (i.e., in the invitation stage)
    // Quest scroll has not yet left quest owner's inventory so no need to return it.
    // Do not wipe quest progress for members because they'll want it to be applied to the next quest that's started.
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId, fields: 'type leader quest'});
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.key) throw new NotFound(res.t('questInvitationDoesNotExist'));
    if (user._id !== group.leader && group.quest.leader !== user._id) throw new NotAuthorized(res.t('onlyLeaderCancelQuest'));
    if (group.quest.active) throw new NotAuthorized(res.t('cantCancelActiveQuest'));

    group.quest = Group.cleanGroupQuest();
    group.markModified('quest');

    let [savedGroup] = await Bluebird.all([
      group.save(),
      User.update(
        {'party._id': groupId},
        {$set: {'party.quest': Group.cleanQuestProgress()}},
        {multi: true}
      ),
    ]);

    res.respond(200, savedGroup.quest);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/abort Abort the current quest
 * @apiVersion 3.0.0
 * @apiName AbortQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.abortQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/abort',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Abort a quest AFTER it has begun (see questCancel for BEFORE)
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId, fields: 'type quest leader'});
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.active) throw new NotFound(res.t('noActiveQuestToAbort'));
    if (user._id !== group.leader && user._id !== group.quest.leader) throw new NotAuthorized(res.t('onlyLeaderAbortQuest'));

    let memberUpdates = User.update({
      'party._id': groupId,
    }, {
      $set: {'party.quest': Group.cleanQuestProgress()},
    }, {multi: true}).exec();

    let questLeaderUpdate = User.update({
      _id: group.quest.leader,
    }, {
      $inc: {
        [`items.quests.${group.quest.key}`]: 1, // give back the quest to the quest leader
      },
    }).exec();

    group.quest = Group.cleanGroupQuest();
    group.markModified('quest');

    let [groupSaved] = await Bluebird.all([group.save(), memberUpdates, questLeaderUpdate]);

    res.respond(200, groupSaved.quest);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/quests/leave Leaves the active quest
 * @apiVersion 3.0.0
 * @apiName LeaveQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} data Quest Object
 */
api.leaveQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/leave',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId, fields: 'type quest'});

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party') throw new NotAuthorized(res.t('guildQuestsNotSupported'));
    if (!group.quest.active) throw new NotFound(res.t('noActiveQuestToLeave'));
    if (group.quest.leader === user._id) throw new NotAuthorized(res.t('questLeaderCannotLeaveQuest'));
    if (!group.quest.members[user._id]) throw new NotAuthorized(res.t('notPartOfQuest'));

    group.quest.members[user._id] = false;
    group.markModified('quest.members');

    user.party.quest = Group.cleanQuestProgress();
    user.markModified('party.quest');

    let [savedGroup] = await Bluebird.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);
  },
};

module.exports = api;
