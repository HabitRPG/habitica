import { authWithHeaders } from '../../middlewares/auth';
import common from '../../../common';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import * as Tasks from '../../models/task';
import {
  basicFields as basicGroupFields,
  model as Group,
} from '../../models/group';
import { model as User } from '../../models/user';
import Bluebird from 'bluebird';
import _ from 'lodash';
import * as passwordUtils from '../../libs/password';

/**
 * @apiDefine UserNotFound
 * @apiError (404) {NotFound} UserNotFound The specified user could not be found.
 */

let api = {};

/**
 * @api {get} /api/v3/user Get the authenticated user's profile
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiSuccess {Object} data The user object
 */
api.getUser = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user;
    let userToJSON = user.toJSON();

    // Remove apiToken from response TODO make it private at the user level? returned in signup/login
    delete userToJSON.apiToken;

    user.addComputedStatsToJSONObj(userToJSON.stats);
    return res.respond(200, userToJSON);
  },
};

/**
 * @api {get} /api/v3/user/inventory/buy Get the gear items available for purchase for the current user
 * @apiName UserGetBuyList
 * @apiGroup User
 *
 * @apiSuccess {Object} data The buy list
 */
api.getBuyList = {
  method: 'GET',
  middlewares: [authWithHeaders()],
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
  'flags.newStuff',

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

  'preferences.disableClasses',
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
 * @api {put} /api/v3/user Update the user
 * @apiDescription Example body: {'stats.hp':50, 'preferences.background': 'beach'}
 * @apiName UserUpdate
 * @apiGroup User
 *
 * @apiSuccess {Object} data The updated user object
 */
api.updateUser = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user;

    _.each(req.body, (val, key) => {
      let purchasable = requiresPurchase[key];

      if (purchasable && !checkPreferencePurchase(user, purchasable, val)) {
        throw new NotAuthorized(res.t('mustPurchaseToSet', { val, key }));
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
 * @api {delete} /api/v3/user Delete an authenticated user's account
 * @apiName UserDelete
 * @apiGroup User
 *
 * @apiParam {String} password The user's password (unless it's a Facebook account)
 *
 * @apiSuccess {Object} data An empty Object
 */
api.deleteUser = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
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

    let types = ['party', 'guilds'];
    let groupFields = basicGroupFields.concat(' leader memberCount');

    let groupsUserIsMemberOf = await Group.getGroups({user, types, groupFields});

    let groupLeavePromises = groupsUserIsMemberOf.map((group) => {
      return group.leave(user, 'remove-all');
    });

    await Bluebird.all(groupLeavePromises);

    await Tasks.Task.remove({
      userId: user._id,
    }).exec();

    await user.remove();

    res.respond(200, {});
  },
};

function _cleanChecklist (task) {
  _.forEach(task.checklist, (c, i) => {
    c.text = `item ${i}`;
  });
}

/**
 * @api {get} /api/v3/user/anonymized Get anonymized user data
 * @apiName UserGetAnonymized
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasks
 **/
api.getUserAnonymized = {
  method: 'GET',
  middlewares: [authWithHeaders()],
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
 * @api {post} /api/v3/user/class/cast/:spellId Cast a skill (spell) on a target
 * @apiName UserCast
 * @apiGroup User
 *
 * @apiParam {String=fireball, mpHeal, earth, frost, smash, defensiveStance, valorousPresence, intimidate, pickPocket, backStab, toolsOfTrade, stealth, heal, protectAura, brightness, healAll} spellId The skill to cast.
 * @apiParam {UUID} targetId Optional query parameter, the id of the target when casting a skill on a party member or a task
 *
 * @apiSuccess data Will return the modified targets. For party members only the necessary fields will be populated. The user is always returned.
 *
 * @apiExample Skill Key to Name Mapping
 * Mage
 * fireball: "Burst of Flames"
 * mpHeal: "Ethereal Surge"
 * earth: "Earthquake"
 * frost: "Chilling Frost"
 *
 * Warrior
 * smash: "Brutal Smash"
 * defensiveStance: "Defensive Stance"
 * valorousPresence: "Valorous Presence"
 * intimidate: "Intimidating Gaze"
 *
 * Rogue
 * pickPocket: "Pickpocket"
 * backStab: "Backstab"
 * toolsOfTrade: "Tools of the Trade"
 * stealth: "Stealth"
 *
 * Healer
 * heal: "Healing Light"
 * protectAura: "Protective Aura"
 * brightness: "Searing Brightness"
 * healAll: "Blessing"
 *
 * @apiUse TaskNotFound
 * @apiUse PartyNotFound
 * @apiUse UserNotFound
 *
 */
api.castSpell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
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

      let results = await Bluebird.all([
        user.save(),
        task.save(),
      ]);

      res.respond(200, {
        user: results[0],
        task: results[1],
      });
    } else if (targetType === 'self') {
      spell.cast(user, null, req);
      await user.save();
      res.respond(200, { user });
    } else if (targetType === 'tasks') { // new target type in v3: when all the user's tasks are necessary
      let tasks = await Tasks.Task.find({
        userId: user._id,
        $or: [ // exclude challenge tasks
          {'challenge.id': {$exists: false}},
          {'challenge.broken': {$exists: true}},
        ],
      }).exec();

      spell.cast(user, tasks, req);

      let toSave = tasks
        .filter(t => t.isModified())
        .map(t => t.save());

      toSave.unshift(user.save());
      let saved = await Bluebird.all(toSave);

      let response = {
        tasks: saved,
        user,
      };

      res.respond(200, response);
    } else if (targetType === 'party' || targetType === 'user') {
      let party = await Group.getGroup({groupId: 'party', user});
      // arrays of users when targetType is 'party' otherwise single users
      let partyMembers;

      if (targetType === 'party') {
        if (!party) {
          partyMembers = [user]; // Act as solo party
        } else {
          partyMembers = await User
            .find({
              'party._id': party._id,
              _id: { $ne: user._id }, // add separately
            })
            // .select(partyMembersFields) Selecting the entire user because otherwise when saving it'll save
            // default values for non-selected fields and pre('save') will mess up thinking some values are missing
            .exec();

          partyMembers.unshift(user);
        }

        spell.cast(user, partyMembers, req);
        await Bluebird.all(partyMembers.map(m => m.save()));
      } else {
        if (!party && (!targetId || user._id === targetId)) {
          partyMembers = user;
        } else {
          if (!targetId) throw new BadRequest(res.t('targetIdUUID'));
          if (!party) throw new NotFound(res.t('partyNotFound'));
          partyMembers = await User
            .findOne({_id: targetId, 'party._id': party._id})
            // .select(partyMembersFields) Selecting the entire user because otherwise when saving it'll save
            // default values for non-selected fields and pre('save') will mess up thinking some values are missing
            .exec();
        }

        if (!partyMembers) throw new NotFound(res.t('userWithIDNotFound', {userId: targetId}));

        spell.cast(user, partyMembers, req);

        if (partyMembers !== user) {
          await Bluebird.all([
            user.save(),
            partyMembers.save(),
          ]);
        } else {
          await partyMembers.save(); // partyMembers is user
        }
      }

      let partyMembersRes = Array.isArray(partyMembers) ? partyMembers : [partyMembers];
      // Only return some fields.
      // See comment above on why we can't just select the necessary fields when querying
      partyMembersRes = partyMembersRes.map(partyMember => {
        return common.pickDeep(partyMember.toJSON(), common.$w(partyMembersFields));
      });

      res.respond(200, {
        partyMembers: partyMembersRes,
        user,
      });

      if (party && !spell.silent) {
        let message = `\`${user.profile.name} casts ${spell.text()}${targetType === 'user' ? ` on ${partyMembers.profile.name}` : ' for the party'}.\``;
        party.sendChat(message);
        await party.save();
      }
    }
  },
};

/**
 * @api {post} /api/v3/user/sleep Make the user start / stop sleeping (resting in the Inn)
 * @apiName UserSleep
 * @apiGroup User
 *
 * @apiSuccess {boolean} data user.preferences.sleep
 */
api.sleep = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/sleep',
  async handler (req, res) {
    let user = res.locals.user;
    let sleepRes = common.ops.sleep(user);
    await user.save();
    res.respond(200, ...sleepRes);
  },
};

/**
 * @api {post} /api/v3/user/allocate Allocate an attribute point
 * @apiName UserAllocate
 * @apiGroup User
 *
 * @apiParam {String} stat Query parameter - Defaults to 'str', mast be one of be of str, con, int or per
 *
 * @apiSuccess {Object} data user.stats
 */
api.allocate = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/allocate',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateRes = common.ops.allocate(user, req);
    await user.save();
    res.respond(200, ...allocateRes);
  },
};

/**
 * @api {post} /api/v3/user/allocate-now Allocate all attribute points
 * @apiDescription Uses the user's chosen automatic allocation method, or if none, assigns all to STR.
 * @apiName UserAllocateNow
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.stats
 */
api.allocateNow = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/allocate-now',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateNowRes = common.ops.allocateNow(user);
    await user.save();
    res.respond(200, ...allocateNowRes);
  },
};

/**
 * @api {post} /user/buy/:key Buy gear, armoire or potion
 * @apiDescription Under the hood uses UserBuyGear, UserBuyPotion and UserBuyArmoire
 * @apiName UserBuy
 * @apiGroup User
 *
 * @apiParam {String} key The item to buy
 */
api.buy = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyRes = common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyRes);
  },
};

/**
 * @api {post} /user/buy-gear/:key Buy a piece of gear
 * @apiName UserBuyGear
 * @apiGroup User
 *
 * @apiParam {String} key The item to buy
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.achievements user.achievements
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {String} message Success message
 */
api.buyGear = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-gear/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyGearRes = common.ops.buyGear(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyGearRes);
  },
};

/**
 * @api {post} /user/buy-armoire Buy an armoire item
 * @apiName UserBuyArmoire
 * @apiGroup User
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.armoire Extra item given by the armoire
 * @apiSuccess {String} message Success message
 */
api.buyArmoire = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-armoire',
  async handler (req, res) {
    let user = res.locals.user;
    let buyArmoireResponse = common.ops.buyArmoire(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyArmoireResponse);
  },
};

/**
 * @api {post} /user/buy-health-potion Buy a health potion
 * @apiName UserBuyPotion
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.stats
 * @apiSuccess {String} message Success message
 */
api.buyHealthPotion = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-health-potion',
  async handler (req, res) {
    let user = res.locals.user;
    let buyHealthPotionResponse = common.ops.buyHealthPotion(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyHealthPotionResponse);
  },
};

/**
 * @api {post} /user/buy-mystery-set/:key Buy a mystery set
 * @apiName UserBuyMysterySet
 * @apiGroup User
 *
 * @apiParam {String} key The mystery set to buy
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.purchasedPlanConsecutive user.purchased.plan.consecutive
 * @apiSuccess {String} message Success message
 */
api.buyMysterySet = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-mystery-set/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyMysterySetRes = common.ops.buyMysterySet(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyMysterySetRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-quest/:key Buy a quest with gold
 * @apiName UserBuyQuest
 * @apiGroup User
 *
 * @apiParam {String} key The quest scroll to buy
 *
 * @apiSuccess {Object} data `user.items.quests`
 * @apiSuccess {String} message Success message
 */
api.buyQuest = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-quest/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buyQuestRes = common.ops.buyQuest(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyQuestRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-special-spell/:key Buy special "spell" item
 * @apiDescription Includes gift cards (e.g., birthday card), and avatar Transformation Items and their antidotes (e.g., Snowball item and Salt reward).
 * @apiName UserBuySpecialSpell
 * @apiGroup User
 *
 * @apiParam {String} key The special item to buy. Must be one of the keys from "content.special", such as birthday, snowball, salt.
 *
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {String} message Success message
 */
api.buySpecialSpell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-special-spell/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let buySpecialSpellRes = common.ops.buySpecialSpell(user, req);
    await user.save();
    res.respond(200, ...buySpecialSpellRes);
  },
};

/**
 * @api {post} /api/v3/user/hatch/:egg/:hatchingPotion Hatch a pet
 * @apiName UserHatch
 * @apiGroup User
 *
 * @apiParam {String} egg The egg to use
 * @apiParam {String} hatchingPotion The hatching potion to use
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message
 */
api.hatch = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/hatch/:egg/:hatchingPotion',
  async handler (req, res) {
    let user = res.locals.user;
    let hatchRes = common.ops.hatch(user, req);
    await user.save();
    res.respond(200, ...hatchRes);
  },
};

/**
 * @api {post} /api/v3/user/equip/:type/:key Equip an item
 * @apiName UserEquip
 * @apiGroup User
 *
 * @apiParam {String} type The type of item to equip (mount, pet, costume or equipped)
 * @apiParam {String} key The item to equip
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message Optional success message
 */
api.equip = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/equip/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let equipRes = common.ops.equip(user, req);
    await user.save();
    res.respond(200, ...equipRes);
  },
};

/**
 * @api {post} /api/v3/user/feed/:pet/:food Feed a pet
 * @apiName UserFeed
 * @apiGroup User
 *
 * @apiParam {String} pet
 * @apiParam {String} food
 *
 * @apiSuccess {Number} data The pet value
 * @apiSuccess {String} message Success message
 */
api.feed = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/feed/:pet/:food',
  async handler (req, res) {
    let user = res.locals.user;
    let feedRes = common.ops.feed(user, req);
    await user.save();
    res.respond(200, ...feedRes);
  },
};

/**
 * @api {post} /api/v3/user/change-class Change class
 * @apiDescription User must be at least level 10. If ?class is defined and user.flags.classSelected is false it'll change the class. If user.preferences.disableClasses it'll enable classes, otherwise it sets user.flags.classSelected to false (costs 3 gems)
 * @apiName UserChangeClass
 * @apiGroup User
 *
 * @apiParam {String} class Query parameter - ?class={warrior|rogue|wizard|healer}
 *
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {Object} data.preferences user.preferences
 * @apiSuccess {Object} data.items user.items
 */
api.changeClass = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/change-class',
  async handler (req, res) {
    let user = res.locals.user;
    let changeClassRes = common.ops.changeClass(user, req, res.analytics);
    await user.save();
    res.respond(200, ...changeClassRes);
  },
};

/**
 * @api {post} /api/v3/user/disable-classes Disable classes
 * @apiName UserDisableClasses
 * @apiGroup User
 *
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {Object} data.preferences user.preferences
 */
api.disableClasses = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/disable-classes',
  async handler (req, res) {
    let user = res.locals.user;
    let disableClassesRes = common.ops.disableClasses(user, req);
    await user.save();
    res.respond(200, ...disableClassesRes);
  },
};

/**
 * @api {post} /api/v3/user/purchase/:type/:key Purchase Gem or Gem-purchasable item
 * @apiName UserPurchase
 * @apiGroup User
 *
 * @apiParam {String} type Type of item to purchase. Must be one of: gems, eggs, hatchingPotions, food, quests, or gear
 * @apiParam {String} key Item's key (use "gem" for purchasing gems)
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Number} data.balance user.balance
 * @apiSuccess {String} message Success message
 */
api.purchase = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/purchase/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let purchaseRes = req.params.type === 'spells' ? common.ops.buySpecialSpell(user, req) : common.ops.purchase(user, req, res.analytics);
    await user.save();
    res.respond(200, ...purchaseRes);
  },
};

/**
 * @api {post} /api/v3/user/purchase-hourglass/:type/:key Purchase Hourglass-purchasable item
 * @apiName UserPurchaseHourglass
 * @apiGroup User
 *
 * @apiParam {String} type The type of item to purchase (pets or mounts)
 * @apiParam {String} key Ex: {MantisShrimp-Base}. The key for the mount/pet
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.purchasedPlanConsecutive user.purchased.plan.consecutive
 * @apiSuccess {String} message Success message
 */
api.userPurchaseHourglass = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/purchase-hourglass/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let purchaseHourglassRes = common.ops.purchaseHourglass(user, req, res.analytics);
    await user.save();
    res.respond(200, ...purchaseHourglassRes);
  },
};

/**
 * @api {post} /api/v3/user/read-card/:cardType Read a card
 * @apiName UserReadCard
 * @apiGroup User
 *
 * @apiParam {String} cardType Type of card to read
 *
 * @apiSuccess {Object} data.specialItems user.items.special
 * @apiSuccess {Boolean} data.cardReceived user.flags.cardReceived
 * @apiSuccess {String} message Success message
 */
api.readCard = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/read-card/:cardType',
  async handler (req, res) {
    let user = res.locals.user;
    let readCardRes = common.ops.readCard(user, req);
    await user.save();
    res.respond(200, ...readCardRes);
  },
};

/**
 * @api {post} /api/v3/user/open-mystery-item Open the Mystery Item box
 * @apiName UserOpenMysteryItem
 * @apiGroup User
 *
 * @apiSuccess {Object} data The item obtained
 * @apiSuccess {String} message Success message
 */
api.userOpenMysteryItem = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/open-mystery-item',
  async handler (req, res) {
    let user = res.locals.user;
    let openMysteryItemRes = common.ops.openMysteryItem(user, req, res.analytics);
    await user.save();
    res.respond(200, ...openMysteryItemRes);
  },
};

/* @api {post} /api/v3/user/release-pets Release pets
 * @apiName UserReleasePets
 * @apiGroup User
 *
 * @apiSuccess {Object} data.items `user.items.pets`
 * @apiSuccess {String} message Success message
 */
api.userReleasePets = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-pets',
  async handler (req, res) {
    let user = res.locals.user;
    let releasePetsRes = common.ops.releasePets(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releasePetsRes);
  },
};

/**
 * @api {post} /api/v3/user/release-both Release pets and mounts and grants Triad Bingo
 * @apiName UserReleaseBoth
 * @apiGroup User

 * @apiSuccess {Object} data.achievements
 * @apiSuccess {Object} data.items
 * @apiSuccess {Number} data.balance
 * @apiSuccess {String} message Success message
 */
api.userReleaseBoth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-both',
  async handler (req, res) {
    let user = res.locals.user;
    let releaseBothRes = common.ops.releaseBoth(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releaseBothRes);
  },
};

/**
 * @api {post} /api/v3/user/release-mounts Release mounts
 * @apiName UserReleaseMounts
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.items.mounts
 * @apiSuccess {String} message Success message
 */
api.userReleaseMounts = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-mounts',
  async handler (req, res) {
    let user = res.locals.user;
    let releaseMountsRes = common.ops.releaseMounts(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releaseMountsRes);
  },
};

/**
 * @api {post} /api/v3/user/sell/:type/:key Sell a gold-sellable item owned by the user
 * @apiName UserSell
 * @apiGroup User
 *
 * @apiParam {String} type The type of item to sell. Must be one of: eggs, hatchingPotions, or food
 * @apiParam {String} key The key of the item
 *
 * @apiSuccess {Object} data.stats
 * @apiSuccess {Object} data.items
 * @apiSuccess {String} message Success message
 */
api.userSell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/sell/:type/:key',
  async handler (req, res) {
    let user = res.locals.user;
    let sellRes = common.ops.sell(user, req);
    await user.save();
    res.respond(200, ...sellRes);
  },
};

/**
 * @api {post} /api/v3/user/unlock Unlock item or set of items by purchase
 * @apiName UserUnlock
 * @apiGroup User
 *
 * @apiParam {String} path Query parameter. The path to unlock
 *
 * @apiSuccess {Object} data.purchased
 * @apiSuccess {Object} data.items
 * @apiSuccess {Object} data.preferences
 * @apiSuccess {String} message
 */
api.userUnlock = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/unlock',
  async handler (req, res) {
    let user = res.locals.user;
    let unlockRes = common.ops.unlock(user, req);
    await user.save();
    res.respond(200, ...unlockRes);
  },
};

/**
 * @api {post} /api/v3/user/revive Revive user from death
 * @apiName UserRevive
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message Success message
 */
api.userRevive = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/revive',
  async handler (req, res) {
    let user = res.locals.user;
    let reviveRes = common.ops.revive(user, req, res.analytics);
    await user.save();
    res.respond(200, ...reviveRes);
  },
};

/**
 * @api {post} /api/v3/user/rebirth Use Orb of Rebirth on user
 * @apiName UserRebirth
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {String} message Success message
 */
api.userRebirth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/rebirth',
  async handler (req, res) {
    let user = res.locals.user;
    let tasks = await Tasks.Task.find({
      userId: user._id,
      type: {$in: ['daily', 'habit', 'todo']},
      $or: [ // exclude challenge tasks
        {'challenge.id': {$exists: false}},
        {'challenge.broken': {$exists: true}},
      ],
    }).exec();

    let rebirthRes = common.ops.rebirth(user, tasks, req, res.analytics);

    let toSave = tasks.map(task => task.save());

    toSave.push(user.save());

    await Bluebird.all(toSave);

    res.respond(200, ...rebirthRes);
  },
};

/**
 * @api {post} /api/v3/user/block/:uuid Block / unblock a user from sending you a PM
 * @apiName BlockUser
 * @apiGroup User
 *
 * @apiParam {UUID} uuid The uuid of the user to block / unblock
 *
 * @apiSuccess {Array} data user.inbox.blocks
 */
api.blockUser = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/block/:uuid',
  async handler (req, res) {
    let user = res.locals.user;
    let blockUserRes = common.ops.blockUser(user, req);
    await user.save();
    res.respond(200, ...blockUserRes);
  },
};

/**
 * @api {delete} /api/v3/user/messages/:id Delete a message
 * @apiName deleteMessage
 * @apiGroup User
 *
 * @apiParam {UUID} id The id of the message to delete
 *
 * @apiSuccess {Object} data user.inbox.messages
 */
api.deleteMessage = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/messages/:id',
  async handler (req, res) {
    let user = res.locals.user;
    let deletePMRes = common.ops.deletePM(user, req);
    await user.save();
    res.respond(200, ...deletePMRes);
  },
};

/**
 * @api {delete} /api/v3/user/messages Delete all messages
 * @apiName clearMessages
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.inbox.messages
 */
api.clearMessages = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/messages',
  async handler (req, res) {
    let user = res.locals.user;
    let clearPMsRes = common.ops.clearPMs(user, req);
    await user.save();
    res.respond(200, ...clearPMsRes);
  },
};

/**
 * @api {post} /api/v3/user/mark-pms-read Marks Private Messages as read
 * @apiName markPmsRead
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.inbox.messages
 */
api.markPmsRead = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/mark-pms-read',
  async handler (req, res) {
    let user = res.locals.user;
    let markPmsResponse = common.ops.markPmsRead(user);
    await user.save();
    res.respond(200, markPmsResponse);
  },
};

/**
 * @api {post} /api/v3/user/reroll Reroll a user using the Fortify Potion
 * @apiName UserReroll
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Object} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {Object} message Success message
 */
api.userReroll = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/reroll',
  async handler (req, res) {
    let user = res.locals.user;
    let query = {
      userId: user._id,
      type: {$in: ['daily', 'habit', 'todo']},
      $or: [ // exclude challenge tasks
        {'challenge.id': {$exists: false}},
        {'challenge.broken': {$exists: true}},
      ],
    };
    let tasks = await Tasks.Task.find(query).exec();
    let rerollRes = common.ops.reroll(user, tasks, req, res.analytics);

    let promises = tasks.map(task => task.save());
    promises.push(user.save());

    await Bluebird.all(promises);

    res.respond(200, ...rerollRes);
  },
};

/**
 * @api {post} /api/v3/user/reset Reset user
 * @apiName UserReset
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Object} data.tasksToRemove IDs of removed tasks
 * @apiSuccess {String} message Success message
 */
api.userReset = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/reset',
  async handler (req, res) {
    let user = res.locals.user;

    let tasks = await Tasks.Task.find({
      userId: user._id,
      $or: [ // exclude challenge tasks
        {'challenge.id': {$exists: false}},
        {'challenge.broken': {$exists: true}},
      ],
    }).select('_id type challenge').exec();

    let resetRes = common.ops.reset(user, tasks);

    await Bluebird.all([
      Tasks.Task.remove({_id: {$in: resetRes[0].tasksToRemove}, userId: user._id}),
      user.save(),
    ]);

    res.respond(200, ...resetRes);
  },
};

/**
 * @api {post} /api/v3/user/custom-day-start Set preferences.dayStart for user
 * @apiName setCustomDayStart
 * @apiGroup User
 *
 * @apiSuccess {Object} data An empty Object
 */
api.setCustomDayStart = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/custom-day-start',
  async handler (req, res) {
    let user = res.locals.user;
    let dayStart = req.body.dayStart;

    user.preferences.dayStart = dayStart;
    user.lastCron = new Date();

    await user.save();

    res.respond(200, {
      message: res.t('customDayStartHasChanged'),
    });
  },
};

module.exports = api;
