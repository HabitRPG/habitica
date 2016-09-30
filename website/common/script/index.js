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

import {
  MAX_HEALTH,
  MAX_LEVEL,
  MAX_STAT_POINTS,
  TAVERN_ID,
  LARGE_GROUP_COUNT_MESSAGE_CUTOFF,
  SUPPORTED_SOCIAL_NETWORKS,
} from './constants';

api.constants = {
  LARGE_GROUP_COUNT_MESSAGE_CUTOFF,
  SUPPORTED_SOCIAL_NETWORKS,
};
// TODO Move these under api.constants
api.maxLevel = MAX_LEVEL;
api.maxHealth = MAX_HEALTH;
api.maxStatPoints = MAX_STAT_POINTS;
api.TAVERN_ID = TAVERN_ID;

// TODO under api.libs.statHelpers?
import * as statHelpers from './statHelpers';
api.capByLevel = statHelpers.capByLevel;
api.tnl = statHelpers.toNextLevel;
api.diminishingReturns = statHelpers.diminishingReturns;

import splitWhitespace from './libs/splitWhitespace';
api.$w = splitWhitespace;

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

import statsComputed from './libs/statsComputed';
api.statsComputed = statsComputed;

import shops from './libs/shops';
api.shops = shops;

import randomVal from './libs/randomVal';
api.randomVal = randomVal;

import autoAllocate from './fns/autoAllocate';
import crit from './fns/crit';
import handleTwoHanded from './fns/handleTwoHanded';
import predictableRandom from './fns/predictableRandom';
import randomDrop from './fns/randomDrop';
import resetGear from './fns/resetGear';
import ultimateGear from './fns/ultimateGear';
import updateStats from './fns/updateStats';

api.fns = {
  autoAllocate,
  crit,
  handleTwoHanded,
  predictableRandom,
  randomDrop,
  resetGear,
  ultimateGear,
  updateStats,
};

import scoreTask from './ops/scoreTask';
import sleep from './ops/sleep';
import allocate from './ops/allocate';
import buy from './ops/buy';
import buyGear from './ops/buyGear';
import buyHealthPotion from './ops/buyHealthPotion';
import buyArmoire from './ops/buyArmoire';
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
import releasePets from './ops/releasePets';
import releaseBoth from './ops/releaseBoth';
import releaseMounts from './ops/releaseMounts';
import updateTask from './ops/updateTask';
import sell from './ops/sell';
import unlock from './ops/unlock';
import revive from './ops/revive';
import rebirth from './ops/rebirth';
import blockUser from './ops/blockUser';
import clearPMs from './ops/clearPMs';
import deletePM from './ops/deletePM';
import reroll from './ops/reroll';
import reset from './ops/reset';
import markPmsRead from './ops/markPMSRead';

api.ops = {
  scoreTask,
  sleep,
  allocate,
  buy,
  buyGear,
  buyHealthPotion,
  buyArmoire,
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
  releasePets,
  releaseBoth,
  releaseMounts,
  updateTask,
  sell,
  unlock,
  revive,
  rebirth,
  blockUser,
  clearPMs,
  deletePM,
  reroll,
  reset,
  markPmsRead,
};

/*
------------------------------------------------------
User (prototype wrapper to give it ops, helper funcs, and virtuals
------------------------------------------------------
 */

/*
User is now wrapped (both on client and server), adding a few new properties:
  * getters (_statsComputed)
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

// TODO Kept for the client side
api.wrap = function wrapUser (user, main = true) {
  if (user._wrapped) return;
  user._wrapped = true;

  // Make markModified available on the client side as a noop function
  if (!user.markModified) {
    user.markModified = function noopMarkModified () {};
  }

  // same for addNotification
  if (!user.addNotification) {
    user.addNotification = function noopAddNotification () {};
  }

  if (main) {
    user.ops = {
      sleep: _.partial(importedOps.sleep, user),
      revive: _.partial(importedOps.revive, user),
      reset: _.partial(importedOps.reset, user),
      reroll: _.partial(importedOps.reroll, user),
      rebirth: _.partial(importedOps.rebirth, user),
      allocateNow: _.partial(importedOps.allocateNow, user),
      sortTask: _.partial(importedOps.sortTask, user),
      updateTask: _.partial(importedOps.updateTask, user),
      deleteTask: _.partial(importedOps.deleteTask, user),
      addTask: _.partial(importedOps.addTask, user),
      addTag: _.partial(importedOps.addTag, user),
      sortTag: _.partial(importedOps.sortTag, user),
      updateTag: _.partial(importedOps.updateTag, user),
      deleteTag: _.partial(importedOps.deleteTag, user),
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
      buyHealthPotion: _.partial(importedOps.buyHealthPotion, user),
      buyArmoire: _.partial(importedOps.buyArmoire, user),
      buyGear: _.partial(importedOps.buyGear, user),
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
      markPmsRead: _.partial(importedOps.markPmsRead, user),
    };
  }

  user.fns = {
    handleTwoHanded: _.partial(importedFns.handleTwoHanded, user),
    predictableRandom: _.partial(importedFns.predictableRandom, user),
    crit: _.partial(importedFns.crit, user),
    randomDrop: _.partial(importedFns.randomDrop, user),
    autoAllocate: _.partial(importedFns.autoAllocate, user),
    updateStats: _.partial(importedFns.updateStats, user),
    statsComputed: _.partial(statsComputed, user),
    ultimateGear: _.partial(importedFns.ultimateGear, user),
  };

  Object.defineProperty(user, '_statsComputed', {
    get () {
      return statsComputed(user);
    },
  });
};
