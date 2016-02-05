import _ from 'lodash';
import Q from 'q';
import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
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

    let members = await User.find({ 'party._id': group._id }, 'auth.facebook auth.local preferences.emailNotifications').exec();
    let backgroundOperations = [];

    group.markModified('quest');
    group.quest.key = questKey;
    group.quest.leader = user._id;
    group.quest.members = {};
    group.quest.members[user._id] = true;

    user.party.quest.RSVPNeeded = false;
    user.party.quest.key = questKey;

    _.each(members, (member) => {
      if (member._id !== user._id) {
        group.quest.members[member._id] = null;
        member.party.quest.RSVPNeeded = true;
        member.party.quest.key = questKey;
        // TODO: Send Quest invite email
        backgroundOperations.push(member.save());
      }
    });

    if (canStartQuestAutomatically(group)) {
      group.startQuest(user);
    }

    let [savedGroup] = await Q.all([
      group.save(),
      user.save(),
    ]);

    res.respond(200, savedGroup.quest);

    Q.allSettled(backgroundOperations).catch(err => {
      // TODO what to do about errors in background ops
      throw err;
    });
  },
};

export default api;
