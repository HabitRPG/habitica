import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as Tasks from '../../models/task';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import Q from 'q';
import _ from 'lodash';

let api = {};

/**
 * @api {get} /user Get the authenticated user's profile
 * @apiVersion 3.0.0
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiSuccess {Object} user The user object
 */
api.getUser = {
  method: 'GET',
  middlewares: [authWithHeaders(), cron],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user.toJSON();

    // Remove apiToken from response TODO make it private at the user level? returned in signup/login
    delete user.apiToken;

    // TODO move to model (maybe virtuals, maybe in toJSON)
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    return res.respond(200, user);
  },
};

const partyMembersFields = 'profile.name stats achievements items.special';

/**
 * @api {post} /user/class/cast/:spellId Cast a spell on a target.
 * @apiVersion 3.0.0
 * @apiName UserCast
 * @apiGroup User
 *
 * @apiParam {string} spellId The spell to cast.
 * @apiParam {UUID} targetId Optional query parameter, the id of the target when casting a spell on a party member or a task.
 *
 * @apiSuccess {Object|Array} mixed Will return the modified targets. For party members only the necessary fields will be populated.
 */
api.castSpell = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/class/cast/:spellId',
  async handler (req, res) {
    let user = res.locals.user;
    let spellId = req.params.spellId;
    let targetId = req.query.targetId;

    // optional because not required by all targetTypes, presence is checked later if necessary
    req.checkQuery('targetId', res.t('targetIdUUID')).optional().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let klass = common.content.spells.special[spellId] ? 'special' : user.stats.class;
    let spell = common.content.spells[klass][spellId];

    if (!spell) throw new NotFound(res.t('spellNotFound', {spellId}));
    if (spell.mana > user.stats.mp) throw new NotAuthorized(res.t('notEnoughMana'));
    if (spell.value > user.stats.gp && !spell.previousPurchase) throw new NotAuthorized(res.t('messageNotEnoughGold'));
    if (spell.lvl > user.stats.lvl) throw new NotAuthorized(res.t('spellLevelTooHigh', {level: spell.lvl}));

    let targetType = spell.target;

    if (targetType === 'task') {
      if (!targetId) throw new BadRequest(res.t('targetIdUUID'));

      let task = await Tasks.Task.findOne({
        _id: targetId,
        userId: user._id,
      }).exec();
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.challenge.id) throw new BadRequest(res.t('challengeTasksNoCast'));

      spell.cast(user, task, req);
      await task.save();
      res.respond(200, task);
    } else if (targetType === 'self') {
      spell.cast(user, null, req);
      await user.save();
      res.respond(200, user);
    } else if (targetType === 'tasks') { // new target type when all the user's tasks are necessary
      let tasks = await Tasks.Task.find({
        userId: user._id,
        'challenge.id': {$exists: false}, // exclude challenge tasks
        $or: [ // Exclude completed todos
          {type: 'todo', completed: false},
          {type: {$in: ['habit', 'daily', 'reward']}},
        ],
      }).exec();

      spell.cast(user, tasks, req);

      let toSave = tasks.filter(t => t.isModified());
      let isUserModified = user.isModified();
      toSave.unshift(user.save());
      let saved = await Q.all(toSave);

      let response = {
        tasks: isUserModified ? _.rest(saved) : saved,
      };
      if (isUserModified) res.user = user;
      res.respond(200, response);
    } else if (targetType === 'party' || targetType === 'user') {
      let party = await Group.getGroup({groupId: 'party', user});
      // arrays of users when targetType is 'party' otherwise single users
      let partyMembers;

      if (targetType === 'party') {
        if (!party) {
          partyMembers = [user]; // Act as solo party
        } else {
          partyMembers = await User.find({'party._id': party._id}).select(partyMembersFields).exec();
        }

        spell.cast(user, partyMembers, req);
        await Q.all(partyMembers.map(m => m.save()));
      } else {
        if (!party && (!targetId || user._id === targetId)) {
          partyMembers = user;
        } else {
          if (!targetId) throw new BadRequest(res.t('targetIdUUID'));
          if (!party) throw new NotFound(res.t('partyNotFound'));
          partyMembers = await User.findOne({_id: targetId, 'party._id': party._id}).select(partyMembersFields).exec();
        }

        if (!partyMembers) throw new NotFound(res.t('userWithIDNotFound', {userId: targetId}));
        spell.cast(user, partyMembers, req);
        await partyMembers.save();
      }
      res.respond(200, partyMembers);

      if (party && !spell.silent) {
        let message = `\`${user.profile.name} casts ${spell.text()}${targetType === 'user' ? ` on ${partyMembers.profile.name}` : ' for the party'}.\``;
        party.sendChat(message);
        await party.save();
      }
    }
  },
};

/**
 * @api {post} /user/sleep Put the user in the inn.
 * @apiVersion 3.0.0
 * @apiName UserSleep
 * @apiGroup User
 *
 * @apiSuccess {Object} Will return an object with the new `user.preferences.sleep` value. Example `{preferences: {sleep: true}}`
 */
api.sleep = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/sleep',
  async handler (req, res) {
    let user = res.locals.user;
    let sleepRes = common.ops.sleep(user);
    await user.save();
    res.respond(200, sleepRes);
  },
};

/**
 * @api {post} /user/allocate Allocate an attribute point.
 * @apiVersion 3.0.0
 * @apiName UserAllocate
 * @apiGroup User
 *
 * @apiSuccess {Object} Returs `user.stats`
 */
api.allocate = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/allocate',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateRes = common.ops.allocate(user, req);
    await user.save();
    res.respond(200, allocateRes);
  },
};

/**
 * @api {post} /user/allocate-now Allocate all attribute points.
 * @apiVersion 3.0.0
 * @apiName UserAllocateNow
 * @apiGroup User
 *
 * @apiSuccess {Object} data `stats`
 */
api.allocateNow = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/allocate-now',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateNowRes = common.ops.allocateNow(user, req);
    await user.save();
    res.respond(200, allocateNowRes);
  },
};

/**
 * @api {post} /user/buy/:key Buy a content item.
 * @apiVersion 3.0.0
 * @apiName UserBuy
 * @apiGroup User
 *
 * @apiParam {string} key The item to buy.
 *
 * @apiSuccess {Object} data `items, achievements, stats, flags`
 * @apiSuccess {object} armoireResp Optional extra item given by the armoire
 * @apiSuccess {string} message
 */
api.buy = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/buy/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyRes = common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, buyRes);
  },
};

/**
 * @api {post} /user/buy-mystery-set/:key Buy a mystery set.
 * @apiVersion 3.0.0
 * @apiName UserBuyMysterySet
 * @apiGroup User
 *
 * @apiParam {string} key The mystery set to buy.
 *
 * @apiSuccess {Object} data `items, purchased.plan.consecutive`
 * @apiSuccess {string} message
 */
api.buyMysterySet = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/buy-mystery-set/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyMysterySetRes = common.ops.buyMysterySet(user, req, res.analytics);
    await user.save();
    res.respond(200, buyMysterySetRes);
  },
};

/**
 * @api {post} /user/buy-quest/:key Buy a quest with gold.
 * @apiVersion 3.0.0
 * @apiName UserBuyQuest
 * @apiGroup User
 *
 * @apiParam {string} key The quest spell to buy.
 *
 * @apiSuccess {Object} data `items.quests`
 * @apiSuccess {string} message
 */
api.buyQuest = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/buy-quest/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyQuestRes = common.ops.buyQuest(user, req, res.analytics);
    await user.save();
    res.respond(200, buyQuestRes);
  },
};

/**
 * @api {post} /user/buy-special-spell/:key Buy special spell.
 * @apiVersion 3.0.0
 * @apiName UserBuySpecialSpell
 * @apiGroup User
 *
 * @apiParam {string} key The special spell to buy.
 *
 * @apiSuccess {Object} data `items, stats`
 * @apiSuccess {string} message
 */
api.buySpecialSpell = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/buy-special-spell/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buySpecialSpellRes = common.ops.buySpecialSpell(user, req);
    await user.save();
    res.respond(200, buySpecialSpellRes);
  },
};

module.exports = api;
