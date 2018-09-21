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
import { shouldDo, daysSince, DAY_MAPPING } from './cron';
api.shouldDo = shouldDo;
api.daysSince = daysSince;
api.DAY_MAPPING = DAY_MAPPING;

import {
  MAX_HEALTH,
  MAX_LEVEL,
  MAX_STAT_POINTS,
  MAX_INCENTIVES,
  TAVERN_ID,
  LARGE_GROUP_COUNT_MESSAGE_CUTOFF,
  MAX_SUMMARY_SIZE_FOR_GUILDS,
  MAX_SUMMARY_SIZE_FOR_CHALLENGES,
  MIN_SHORTNAME_SIZE_FOR_CHALLENGES,
  SUPPORTED_SOCIAL_NETWORKS,
  GUILDS_PER_PAGE,
  PARTY_LIMIT_MEMBERS,
} from './constants';

api.constants = {
  MAX_INCENTIVES,
  LARGE_GROUP_COUNT_MESSAGE_CUTOFF,
  MAX_SUMMARY_SIZE_FOR_GUILDS,
  MAX_SUMMARY_SIZE_FOR_CHALLENGES,
  MIN_SHORTNAME_SIZE_FOR_CHALLENGES,
  SUPPORTED_SOCIAL_NETWORKS,
  GUILDS_PER_PAGE,
  PARTY_LIMIT_MEMBERS,
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

import inAppRewards from './libs/inAppRewards';
api.inAppRewards = inAppRewards;

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

import achievements from './libs/achievements';
api.achievements = achievements;

import randomVal from './libs/randomVal';
api.randomVal = randomVal;

import hasClass from './libs/hasClass';
api.hasClass = hasClass;

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
import allocateNow from './ops/stats/allocateNow';
import allocate from './ops/stats/allocate';
import allocateBulk from './ops/stats/allocateBulk';
import buy from './ops/buy/buy';
import hatch from './ops/hatch';
import feed from './ops/feed';
import equip from './ops/equip';
import changeClass from './ops/changeClass';
import disableClasses from './ops/disableClasses';
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
import emptyArmory from './ops/emptyArmory';
import blockUser from './ops/blockUser';
import reroll from './ops/reroll';
import reset from './ops/reset';
import markPmsRead from './ops/markPMSRead';
import pinnedGearUtils from './ops/pinnedGearUtils';

api.ops = {
  scoreTask,
  sleep,
  allocate,
  allocateBulk,
  buy,
  allocateNow,
  hatch,
  feed,
  equip,
  changeClass,
  disableClasses,
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
  emptyArmory,
  blockUser,
  reroll,
  reset,
  markPmsRead,
  pinnedGearUtils,
};
