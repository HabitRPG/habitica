import _ from 'lodash';

// When using a common module from the website or the server NEVER import the module directly
// but access it through `api` (the main common) module, otherwise you would require the non transpiled version of the file in production.
let api = module.exports = {};

import content from './content/index';
api.content = content;

import * as errors from './libs/errors';
api.errors = errors;
import i18n from './i18n';
api.i18n = i18n;

// TODO under api.libs.cron?
import { shouldDo, daysSince } from './cron';
api.shouldDo = shouldDo;
api.daysSince = daysSince;

// TODO under api.constants?
import {
  MAX_HEALTH,
  MAX_LEVEL,
  MAX_STAT_POINTS,
} from './constants';
api.maxLevel = MAX_LEVEL;
api.maxHealth = MAX_HEALTH;
api.maxStatPoints = MAX_STAT_POINTS;

// TODO under api.libs.statHelpers?
import * as statHelpers from './statHelpers';
api.capByLevel = statHelpers.capByLevel;
api.tnl = statHelpers.toNextLevel;
api.diminishingReturns = statHelpers.diminishingReturns;

// TODO under api.libs?
import splitWhitespace from './libs/splitWhitespace';
const $w = api.$w = splitWhitespace;

import dotSet from './libs/dotSet';
api.dotSet = dotSet;

import dotGet from './libs/dotGet';
api.dotGet = dotGet;

import refPush from './libs/refPush';
api.refPush = refPush;

import planGemLimits from './libs/planGemLimits';
api.planGemLimits = planGemLimits;

import preenTodos from './libs/preenTodos';
api.preenTodos = preenTodos;

import updateStore from './libs/updateStore';
api.updateStore = updateStore;

import uuid from './libs/uuid';
api.uuid = uuid;

import taskDefaults from './libs/taskDefaults';
api.taskDefaults = taskDefaults;

import percent from './libs/percent';
api.percent = percent;

import gold from './libs/gold';
api.gold = gold;

import silver from './libs/silver';
api.silver = silver;

import taskClasses from './libs/taskClasses';
api.taskClasses = taskClasses;

import noTags from './libs/noTags';
api.noTags = noTags;

import appliedTags from './libs/appliedTags';
api.appliedTags = appliedTags;

import pickDeep from './libs/pickDeep';
api.pickDeep = pickDeep;

import count from './count';
api.count = count;

// TODO As ops and fns are ported, exported them through the api object
import scoreTask from './ops/scoreTask';
import sleep from './ops/sleep';
import allocate from './ops/allocate';
import buy from './ops/buy';
import buyMysterySet from './ops/buyMysterySet';
import buyQuest from './ops/buyQuest';
import buySpecialSpell from './ops/buySpecialSpell';
import allocateNow from './ops/allocateNow';
import hatch from './ops/hatch';
import feed from './ops/feed';
import equip from './ops/equip';
import changeClass from './ops/changeClass';
import disableClasses from './ops/disableClasses';
import purchase from './ops/purchase';
import purchaseHourglass from './ops/hourglassPurchase';
import readCard from './ops/readCard';
import openMysteryItem from './ops/openMysteryItem';
import addWebhook from './ops/addWebhook';
import updateWebhook from './ops/updateWebhook';
import deleteWebhook from './ops/deleteWebhook';
import releasePets from './ops/releasePets';
import releaseBoth from './ops/releaseBoth';
import releaseMounts from './ops/releaseMounts';
import updateTask from './ops/updateTask';
import clearCompleted from './ops/clearCompleted';
import sell from './ops/sell';
import unlock from './ops/unlock';
import revive from './ops/revive';
import rebirth from './ops/rebirth';

api.ops = {
  scoreTask,
  sleep,
  allocate,
  buy,
  buyMysterySet,
  buySpecialSpell,
  buyQuest,
  allocateNow,
  hatch,
  feed,
  equip,
  changeClass,
  disableClasses,
  purchase,
  purchaseHourglass,
  readCard,
  openMysteryItem,
  addWebhook,
  updateWebhook,
  deleteWebhook,
  releasePets,
  releaseBoth,
  releaseMounts,
  updateTask,
  clearCompleted,
  sell,
  unlock,
  revive,
  rebirth,
};

import handleTwoHanded from './fns/handleTwoHanded';
import predictableRandom from './fns/predictableRandom';
import randomVal from './fns/randomVal';
import ultimateGear from './fns/ultimateGear';
import autoAllocate from './fns/autoAllocate';

api.fns = {
  handleTwoHanded,
  predictableRandom,
  randomVal,
  ultimateGear,
  autoAllocate,
};


/*
------------------------------------------------------
User (prototype wrapper to give it ops, helper funcs, and virtuals
------------------------------------------------------
 */


/*
User is now wrapped (both on client and server), adding a few new properties:
  * getters (_statsComputed, tasks, etc)
  * user.fns, which is a bunch of helper functions
    These were originally up above, but they make more sense belonging to the user object so we don't have to pass
    the user object all over the place. In fact, we should pull in more functions such as cron(), updateStats(), etc.
  * user.ops, which is super important:

If a function is inside user.ops, it has magical properties. If you call it on the client it updates the user object in
the browser and when it's done it automatically POSTs to the server, calling src/controllers/user.js#OP_NAME (the exact same name
of the op function). The first argument req is {query, body, params}, it's what the express controller function
expects. This means we call our functions as if we were calling an Express route. Eg, instead of score(task, direction),
we call score({params:{id:task.id,direction:direction}}). This also forces us to think about our routes (whether to use
params, query, or body for variables). see http://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters

If `src/controllers/user.js#OP_NAME` doesn't exist on the server, it's automatically added. It runs the code in user.ops.OP_NAME
to update the user model server-side, then performs `user.save()`. You can see this in action for `user.ops.buy`. That
function doesn't exist on the server - so the client calls it, it updates user in the browser, auto-POSTs to server, server
handles it by calling `user.ops.buy` again (to update user on the server), and then saves. We can do this for
everything that doesn't need any code difference from what's in user.ops.OP_NAME for special-handling server-side. If we
*do* need special handling, just add `src/controllers/user.js#OP_NAME` to override the user.ops.OP_NAME, and be
sure to call user.ops.OP_NAME at some point within the overridden function.

TODO
  * Is this the best way to wrap the user object? I thought of using user.prototype, but user is an object not a Function.
    user on the server is a Mongoose model, so we can use prototype - but to do it on the client, we'd probably have to
    move to $resource for user
  * Move to $resource!
 */

import importedOps from './ops';
import importedFns from './fns';

// TODO redo
api.wrap = function wrapUser (user, main = true) {
  if (user._wrapped) return;
  user._wrapped = true;

  // Make markModified available on the client side as a noop function
  // TODO move to client?
  if (!user.markModified) {
    user.markModified = function noopMarkModified () {};
  }

  if (main) {
    user.ops = {
      update: _.partial(importedOps.update, user),
      sleep: _.partial(importedOps.sleep, user),
      revive: _.partial(importedOps.revive, user),
      reset: _.partial(importedOps.reset, user),
      reroll: _.partial(importedOps.reroll, user),
      rebirth: _.partial(importedOps.rebirth, user),
      allocateNow: _.partial(importedOps.allocateNow, user),
      clearCompleted: _.partial(importedOps.clearCompleted, user),
      sortTask: _.partial(importedOps.sortTask, user),
      updateTask: _.partial(importedOps.updateTask, user),
      deleteTask: _.partial(importedOps.deleteTask, user),
      addTask: _.partial(importedOps.addTask, user),
      addTag: _.partial(importedOps.addTag, user),
      sortTag: _.partial(importedOps.sortTag, user),
      getTags: _.partial(importedOps.getTags, user),
      getTag: _.partial(importedOps.getTag, user),
      updateTag: _.partial(importedOps.updateTag, user),
      deleteTag: _.partial(importedOps.deleteTag, user),
      addWebhook: _.partial(importedOps.addWebhook, user),
      updateWebhook: _.partial(importedOps.updateWebhook, user),
      deleteWebhook: _.partial(importedOps.deleteWebhook, user),
      addPushDevice: _.partial(importedOps.addPushDevice, user),
      clearPMs: _.partial(importedOps.clearPMs, user),
      deletePM: _.partial(importedOps.deletePM, user),
      blockUser: _.partial(importedOps.blockUser, user),
      feed: _.partial(importedOps.feed, user),
      buySpecialSpell: _.partial(importedOps.buySpecialSpell, user),
      purchase: _.partial(importedOps.purchase, user),
      releasePets: _.partial(importedOps.releasePets, user),
      releaseMounts: _.partial(importedOps.releaseMounts, user),
      releaseBoth: _.partial(importedOps.releaseBoth, user),
      buy: _.partial(importedOps.buy, user),
      buyQuest: _.partial(importedOps.buyQuest, user),
      buyMysterySet: _.partial(importedOps.buyMysterySet, user),
      hourglassPurchase: _.partial(importedOps.hourglassPurchase, user),
      sell: _.partial(importedOps.sell, user),
      equip: _.partial(importedOps.equip, user),
      hatch: _.partial(importedOps.hatch, user),
      unlock: _.partial(importedOps.unlock, user),
      changeClass: _.partial(importedOps.changeClass, user),
      disableClasses: _.partial(importedOps.disableClasses, user),
      allocate: _.partial(importedOps.allocate, user),
      readCard: _.partial(importedOps.readCard, user),
      openMysteryItem: _.partial(importedOps.openMysteryItem, user),
      score: _.partial(importedOps.scoreTask, user),
    };
  }

  user.fns = {
    handleTwoHanded: _.partial(importedFns.handleTwoHanded, user),
    predictableRandom: _.partial(importedFns.predictableRandom, user),
    crit: _.partial(importedFns.crit, user),
    randomVal: _.partial(importedFns.randomVal, user),
    dotSet: _.partial(importedFns.dotSet, user),
    dotGet: _.partial(importedFns.dotGet, user),
    randomDrop: _.partial(importedFns.randomDrop, user),
    autoAllocate: _.partial(importedFns.autoAllocate, user),
    updateStats: _.partial(importedFns.updateStats, user),
    ultimateGear: _.partial(importedFns.ultimateGear, user),
    nullify: _.partial(importedFns.nullify, user),
  };

  Object.defineProperty(user, '_statsComputed', {
    get () {
      let computed = _.reduce(['per', 'con', 'str', 'int'], (m, stat) => {
        m[stat] = _.reduce($w('stats stats.buffs items.gear.equipped.weapon items.gear.equipped.armor items.gear.equipped.head items.gear.equipped.shield'), (m2, path) => {
          let item;
          let val = user.fns.dotGet(path);
          return m2 + (path.indexOf('items.gear') !== -1 ? (item = content.gear.flat[val], (Number(item ? item[stat] : undefined) || 0) * ((item ? item.klass : undefined) === user.stats.class || (item ? item.specialClass : undefined) === user.stats.class ? 1.5 : 1)) : Number(val[stat]) || 0);
        }, 0);
        m[stat] += Math.floor(api.capByLevel(user.stats.lvl) / 2);
        return m;
      }, {});
      computed.maxMP = computed.int * 2 + 30;
      return computed;
    },
  });

  if (typeof window !== 'undefined') {
    // TODO kept for compatibility with the client that relies on v2, remove once the client is adapted
    Object.defineProperty(user, 'tasks', {
      get () {
        let tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards);
        return _.object(_.pluck(tasks, 'id'), tasks);
      },
    });
  }
};
