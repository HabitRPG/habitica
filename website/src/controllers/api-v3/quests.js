import _ from 'lodash';
import Q from 'q';
import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import analytics from '../../libs/api-v3/analyticsService';
import {
  model as Group,
} from '../../models/group';
import {
  model as User,
} from '../../models/user';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import {
  getUserInfo,
  sendTxn as sendTxnEmail,
} from '../../libs/api-v3/email';
import { quests as questScrolls } from '../../../../common/script/content';

function canStartQuestAutomatically (group)  {
  // If all members are either true (accepted) or false (rejected) return true
  // If any member is null/undefined (undecided) return false
  return _.every(group.quest.members, Boolean);
}

let api = {};

/**
 * @api {post} /groups/:groupId/quests/invite Invite users to a quest
 * @apiVersion 3.0.0
 * @apiName InviteToQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} Quest Object
 */
api.inviteToQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/invite/:questKey',
  middlewares: [authWithHeaders(), cron],
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
    }).select('auth.facebook auth.local preferences.emailNotifications profile.name')
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

    let [savedGroup] = await Q.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    // send out invites
    let inviterVars = getUserInfo(user, ['name', 'email']);
    let membersToEmail = members.filter(member => {
      return member.preferences.emailNotifications.invitedQuest !== false;
    });
    sendTxnEmail(membersToEmail, `invite-${quest.boss ? 'boss' : 'collection'}-quest`, [
      {name: 'QUEST_NAME', content: quest.text()},
      {name: 'INVITER', content: inviterVars.name},
      {name: 'REPLY_TO_ADDRESS', content: inviterVars.email},
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
 * @api {post} /groups/:groupId/quests/cancel Cancels a quest
 * @apiVersion 3.0.0
 * @apiName CancelQuest
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} Group Object
 */
api.cancelQuest = {
  method: 'POST',
  url: '/groups/:groupId/quests/cancel',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    // Cancel a quest BEFORE it has begun (i.e., in the invitation stage)
    // Quest scroll has not yet left quest owner's inventory so no need to return it.
    // Do not wipe quest progress for members because they'll want it to be applied to the next quest that's started.
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId, fields: 'type quest'});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.quest.active) throw new NotAuthorized(res.t('cantCancelActiveQuest'));

    group.quest = {key: null, progress: {}, leader: null, members: {}};
    group.markModified('quest');
    await group.save();

    await User.update(
      {'party._id': groupId},
      {$set: {'party.quest.RSVPNeeded': false, 'party.quest.key': null}},
      {multi: true}
    );

    res.respond(200, group);
  },
};


export default api;
