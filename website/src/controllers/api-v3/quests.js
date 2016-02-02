import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import {
  model as Group,
} from '../../models/group';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import { quests as questScrolls } from '../../../../common/script/content';

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

    group.markModified('quest');
    group.quest.key = questKey;
    group.quest.leader = user._id;
    group.quest.members = {};

    // let memberUpdate = {
    //   '$set': {
    //     'party.quest.key': questKey,
    //     'party.quest.progress.down': 0,
    //     'party.quest.completed': null,
    //   },
    // };

    // TODO collect members of party
    // TODO Logic for quest invite and send back quest object

    await group.save();
    res.respond(200, {});
  },
};

export default api;
