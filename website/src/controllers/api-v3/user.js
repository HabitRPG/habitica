import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as Tasks from '../../models/task';
import {
  basicFields as basicGroupFields,
  model as Group,
} from '../../models/group';
import { model as User } from '../../models/user';
import Q from 'q';
import _ from 'lodash';
import * as firebase from '../../libs/api-v3/firebase';
import * as passwordUtils from '../../libs/api-v3/password';

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

/**
 * @api {get} /user/inventory/buy Get the gear items available for purchase for the current user
 * @apiVersion 3.0.0
 * @apiName UserGetBuyList
 * @apiGroup User
 *
 * @apiSuccess {Object} list The buy list
 */
api.getBuyList = {
  method: 'GET',
  middlewares: [authWithHeaders(), cron],
  url: '/user/inventory/buy',
  async handler (req, res) {
    let list = _.cloneDeep(common.updateStore(res.locals.user));

    // return text and notes strings
    _.each(list, item => {
      _.each(item, (itemPropVal, itemPropKey) => {
        if (_.isFunction(itemPropVal) && itemPropVal.i18nLangFunc) item[itemPropKey] = itemPropVal(req.language);
      });
    });

    res.respond(200, list);
  },
};

let updatablePaths = [
  'flags.customizationsNotification',
  'flags.showTour',
  'flags.tour',
  'flags.tutorial',
  'flags.communityGuidelinesAccepted',
  'flags.welcomed',
  'flags.cardReceived',
  'flags.warnedLowHealth',

  'achievements',

  'party.order',
  'party.orderAscending',
  'party.quest.completed',
  'party.quest.RSVPNeeded',

  'preferences',
  'profile',
  'stats',
  'inbox.optOut',
];

// This tells us for which paths users can call `PUT /user`.
// The trick here is to only accept leaf paths, not root/intermediate paths (see http://goo.gl/OEzkAs)
let acceptablePUTPaths = _.reduce(require('./../../models/user').schema.paths, (accumulator, val, leaf) => {
  let found = _.find(updatablePaths, (rootPath) => {
    return leaf.indexOf(rootPath) === 0;
  });

  if (found) accumulator[leaf] = true;

  return accumulator;
}, {});

let restrictedPUTSubPaths = [
  'stats.class',

  'preferences.sleep',
  'preferences.webhooks',
];

_.each(restrictedPUTSubPaths, (removePath) => {
  delete acceptablePUTPaths[removePath];
});

let requiresPurchase = {
  'preferences.background': 'background',
  'preferences.shirt': 'shirt',
  'preferences.size': 'size',
  'preferences.skin': 'skin',
  'preferences.hair.bangs': 'hair.bangs',
  'preferences.hair.base': 'hair.base',
  'preferences.hair.beard': 'hair.beard',
  'preferences.hair.color': 'hair.color',
  'preferences.hair.flower': 'hair.flower',
  'preferences.hair.mustache': 'hair.mustache',
};

let checkPreferencePurchase = (user, path, item) => {
  let itemPath = `${path}.${item}`;
  let appearance = _.get(common.content.appearances, itemPath);
  if (!appearance) return false;
  if (appearance.price === 0) return true;

  return _.get(user.purchased, itemPath);
};

/**
 * @api {put} /user Update the user. Example body: {'stats.hp':50, 'preferences.background': 'beach'}
 * @apiVersion 3.0.0
 * @apiName UserUpdate
 * @apiGroup User
 *
 * @apiSuccess user object The updated user object
 */
api.updateUser = {
  method: 'PUT',
  middlewares: [authWithHeaders(), cron],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user;

    _.each(req.body, (val, key) => {
      let purchasable = requiresPurchase[key];

      if (purchasable && !checkPreferencePurchase(user, purchasable, val)) {
        throw new NotAuthorized(res.t(`mustPurchaseToSet`, { val, key }));
      }

      if (acceptablePUTPaths[key]) {
        _.set(user, key, val);
      } else {
        throw new NotAuthorized(res.t('messageUserOperationProtected', { operation: key }));
      }
    });

    await user.save();
    return res.respond(200, user);
  },
};

/**
 * @api {delete} /user DELETE an authenticated user's profile
 * @apiVersion 3.0.0
 * @apiName UserDelete
 * @apiGroup User
 *
 * @apiParam {string} password The user's password unless it's a Facebook account
 *
 * @apiSuccess {} object An empty object
 */
api.deleteUser = {
  method: 'DELETE',
  middlewares: [authWithHeaders(), cron],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user;
    let plan = user.purchased.plan;

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    if (plan && plan.customerId && !plan.dateTerminated) {
      throw new NotAuthorized(res.t('cannotDeleteActiveAccount'));
    }

    let types = ['party', 'publicGuilds', 'privateGuilds'];
    let groupFields = basicGroupFields.concat(' leader memberCount');

    let groupsUserIsMemberOf = await Group.getGroups({user, types, groupFields});

    let groupLeavePromises = groupsUserIsMemberOf.map((group) => {
      return group.leave(user, 'remove-all');
    });

    await Q.all(groupLeavePromises);

    await Tasks.Task.remove({
      userId: user._id,
    }).exec();

    await user.remove();

    res.respond(200, {});

    firebase.deleteUser(user._id);
  },
};

function _cleanChecklist (task) {
  _.forEach(task.checklist, (c, i) => {
    c.text = `item ${i}`;
  });
}

/**
 * @api {get} /user/anonymized
 * @apiVersion 3.0.0
 * @apiName UserGetAnonymized
 * @apiGroup User
 * @apiSuccess {Object} object The object { user, tasks }
 **/
api.getUserAnonymized = {
  method: 'GET',
  middlewares: [authWithHeaders(), cron],
  url: '/user/anonymized',
  async handler (req, res) {
    let user = res.locals.user.toJSON();
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    delete user.apiToken;
    if (user.auth) {
      delete user.auth.local;
      delete user.auth.facebook;
    }
    delete user.newMessages;
    delete user.profile;
    delete user.purchased.plan;
    delete user.contributor;
    delete user.invitations;
    delete user.items.special.nyeReceived;
    delete user.items.special.valentineReceived;
    delete user.webhooks;
    delete user.achievements.challenges;

    _.forEach(user.inbox.messages, (msg) => {
      msg.text = 'inbox message text';
    });
    _.forEach(user.tags, (tag) => {
      tag.name = 'tag';
      tag.challenge = 'challenge';
    });

    let query = {
      userId: user._id,
      $or: [
        { type: 'todo', completed: false },
        { type: { $in: ['habit', 'daily', 'reward'] } },
      ],
    };
    let tasks = await Tasks.Task.find(query).exec();

    _.forEach(tasks, (task) => {
      task.text = 'task text';
      task.notes = 'task notes';
      if (task.type === 'todo' || task.type === 'daily') {
        _cleanChecklist(task);
      }
    });

    return res.respond(200, { user, tasks });
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

/**
 * @api {post} /user/hatch/:egg/:hatchingPotion Hatch a pet.
 * @apiVersion 3.0.0
 * @apiName UserHatch
 * @apiGroup User
 *
 * @apiParam {string} egg The egg to use.
 * @apiParam {string} hatchingPotion The hatching potion to use.
 *
 * @apiSuccess {Object} data `user.items`
 * @apiSuccess {string} message
 */
api.hatch = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/hatch/:egg/:hatchingPotion',
  async handler (req, res) {
    let user = res.locals.user;
    let hatchRes = common.ops.hatch(user, req);
    await user.save();
    res.respond(200, hatchRes);
  },
};

/**
 * @api {post} /user/equip/:type/:key Equip an item
 * @apiVersion 3.0.0
 * @apiName UserEquip
 * @apiGroup User
 *
 * @apiParam {string} type
 * @apiParam {string} key
 *
 * @apiSuccess {Object} data `user.items`
 * @apiSuccess {string} message Optional
 */
api.equip = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/equip/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let equipRes = common.ops.equip(user, req);
    await user.save();
    res.respond(200, equipRes);
  },
};

/**
 * @api {post} /user/equip/:pet/:food Feed a pet
 * @apiVersion 3.0.0
 * @apiName UserFeed
 * @apiGroup User
 *
 * @apiParam {string} pet
 * @apiParam {string} food
 *
 * @apiSuccess {Object} data The fed pet
 * @apiSuccess {string} message
 */
api.feed = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/feed/:pet/:food',
  async handler (req, res) {
    let user = res.locals.user;
    let feedRes = common.ops.feed(user, req);
    await user.save();
    res.respond(200, feedRes);
  },
};

/**
* @api {post} /user/change-class Change class.
* @apiVersion 3.0.0
* @apiName UserChangeClass
* @apiGroup User
*
* @apiParam {string} class ?class={warrior|rogue|wizard|healer}. If missing will
*
* @apiSuccess {Object} data `stats flags items preferences`
*/
api.changeClass = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/change-class',
  async handler (req, res) {
    let user = res.locals.user;
    let changeClassRes = common.ops.changeClass(user, req, res.analytics);
    await user.save();
    res.respond(200, changeClassRes);
  },
};

/**
* @api {post} /user/disable-classes Disable classes.
* @apiVersion 3.0.0
* @apiName UserDisableClasses
* @apiGroup User
*
* @apiSuccess {Object} data `stats flags preferences`
*/
api.disableClasses = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/disable-classes',
  async handler (req, res) {
    let user = res.locals.user;
    let disableClassesRes = common.ops.disableClasses(user, req);
    await user.save();
    res.respond(200, disableClassesRes);
  },
};

/**
* @api {post} /user/purchase/:type/:key Purchase Gem Items.
* @apiVersion 3.0.0
* @apiName UserPurchase
* @apiGroup User
*
* @apiParam {string} type Type of item to purchase
* @apiParam {string} key Item's key
*
* @apiSuccess {Object} data `items balance`
*/
api.purchase = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/purchase/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let purchaseResponse = common.ops.purchase(user, req, res.analytics);
    await user.save();
    res.respond(200, purchaseResponse);
  },
};

/**
* @api {post} /user/purchase-hourglass/:type/:key Purchase Hourglass.
* @apiVersion 3.0.0
* @apiName UserPurchaseHourglass
* @apiGroup User
*
* @apiParam {string} type {pets|mounts}. The type of item to purchase
* @apiParam {string} key Ex: {MantisShrimp-Base}. The key for the mount/pet
*
* @apiSuccess {Object} data `items purchased.plan.consecutive`
*/
api.userPurchaseHourglass = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/purchase-hourglass/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let purchaseHourglassResponse = common.ops.purchaseHourglass(user, req, res.analytics);
    await user.save();
    res.respond(200, purchaseHourglassResponse);
  },
};

/**
* @api {post} /user/read-card/:cardType Reads a card.
* @apiVersion 3.0.0
* @apiName UserReadCard
* @apiGroup User
*
* @apiParam {string} cardType Type of card to read
*
* @apiSuccess {Object} data `items.special flags.cardReceived`
*/
api.readCard = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/read-card/:cardType',
  async handler (req, res) {
    let user = res.locals.user;
    let readCardResponse = common.ops.readCard(user, req);
    await user.save();
    res.respond(200, readCardResponse);
  },
};

/**
* @api {post} /user/open-mystery-item Open the mystery item.
* @apiVersion 3.0.0
* @apiName UserOpenMysteryItem
* @apiGroup User
*
* @apiSuccess {Object} data `user.items.gear.owned`
*/
api.userOpenMysteryItem = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/open-mystery-item',
  async handler (req, res) {
    let user = res.locals.user;
    let openMysteryItemResponse = common.ops.openMysteryItem(user, req, res.analytics);
    await user.save();
    res.respond(200, openMysteryItemResponse);
  },
};

/**
* @api {post} /user/release-pets Releases pets.
* @apiVersion 3.0.0
* @apiName UserReleasePets
* @apiGroup User
*
* @apiSuccess {Object} data `user.items.pets`
*/
api.userReleasePets = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/release-pets',
  async handler (req, res) {
    let user = res.locals.user;
    let releasePetsResponse = common.ops.releasePets(user, req, res.analytics);
    await user.save();
    res.respond(200, releasePetsResponse);
  },
};

/*
* @api {post} /user/release-both Releases Pets and Mounts and grants Triad Bingo.
* @apiVersion 3.0.0
* @apiName UserReleaseBoth
* @apiGroup User
*
* @apiSuccess {Object} data `user.items.gear.owned`
*/
api.userReleaseBoth = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/release-both',
  async handler (req, res) {
    let user = res.locals.user;
    let releaseBothResponse = common.ops.releaseBoth(user, req, res.analytics);
    await user.save();
    res.respond(200, releaseBothResponse);
  },
};

/*
* @api {post} /user/release-mounts Released mounts.
* @apiVersion 3.0.0
* @apiName UserReleaseMounts
* @apiGroup User
*
* @apiSuccess {Object} data `mounts`
*/
api.userReleaseMounts = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/release-mounts',
  async handler (req, res) {
    let user = res.locals.user;
    let releaseMountsResponse = common.ops.releaseMounts(user, req, res.analytics);
    await user.save();
    res.respond(200, releaseMountsResponse);
  },
};

/*
* @api {post} /user/sell/:type/:key Sells user's items.
* @apiVersion 3.0.0
* @apiName UserSell
* @apiGroup User
*
* @apiSuccess {Object} data `stats items`
*/
api.userSell = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/sell/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let sellResponse = common.ops.sell(user, req);
    await user.save();
    res.respond(200, sellResponse);
  },
};

/**
* @api {post} /user/revive Revives user from death.
* @apiVersion 3.0.0
* @apiName UserRevive
* @apiGroup User
*
* @apiSuccess {Object} data `user.items`
*/
api.userRevive = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/revive',
  async handler (req, res) {
    let user = res.locals.user;
    let reviveResponse = common.ops.revive(user, req, res.analytics);
    await user.save();
    res.respond(200, reviveResponse);
  },
};

module.exports = api;
