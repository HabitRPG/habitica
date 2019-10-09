// When using a common module from the website or the server NEVER import the module directly
// but access it through `api` (the main common) module,
// otherwise you would require the non transpiled version of the file in production.
import content from './content/index';

import * as errors from './libs/errors';
import i18n from './i18n';

// TODO under api.libs.cron?
import { shouldDo, daysSince, DAY_MAPPING } from './cron';

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
  CHAT_FLAG_LIMIT_FOR_HIDING,
  CHAT_FLAG_FROM_MOD,
  CHAT_FLAG_FROM_SHADOW_MUTE,
} from './constants';

// TODO under api.libs.statHelpers?
import * as statHelpers from './statHelpers';

import splitWhitespace from './libs/splitWhitespace';

import refPush from './libs/refPush';

import planGemLimits from './libs/planGemLimits';

import preenTodos from './libs/preenTodos';

import updateStore from './libs/updateStore';

import inAppRewards from './libs/inAppRewards';

import uuid from './libs/uuid';

import taskDefaults from './libs/taskDefaults';

import percent from './libs/percent';

import gold from './libs/gold';

import silver from './libs/silver';

import noTags from './libs/noTags';

import appliedTags from './libs/appliedTags';

import pickDeep from './libs/pickDeep';

import * as count from './count';

import statsComputed from './libs/statsComputed';

import shops from './libs/shops';

import achievements from './libs/achievements';

import randomVal from './libs/randomVal';

import hasClass from './libs/hasClass';

import autoAllocate from './fns/autoAllocate';
import crit from './fns/crit';
import handleTwoHanded from './fns/handleTwoHanded';
import predictableRandom from './fns/predictableRandom';
import randomDrop from './fns/randomDrop';
import resetGear from './fns/resetGear';
import ultimateGear from './fns/ultimateGear';
import updateStats from './fns/updateStats';

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
import blockUser from './ops/blockUser';
import reroll from './ops/reroll';
import reset from './ops/reset';
import markPmsRead from './ops/markPMSRead';
import * as pinnedGearUtils from './ops/pinnedGearUtils';

const api = {};
api.content = content;
api.errors = errors;
api.i18n = i18n;
api.shouldDo = shouldDo;
api.daysSince = daysSince;
api.DAY_MAPPING = DAY_MAPPING;

api.constants = {
  MAX_INCENTIVES,
  LARGE_GROUP_COUNT_MESSAGE_CUTOFF,
  MAX_SUMMARY_SIZE_FOR_GUILDS,
  MAX_SUMMARY_SIZE_FOR_CHALLENGES,
  MIN_SHORTNAME_SIZE_FOR_CHALLENGES,
  SUPPORTED_SOCIAL_NETWORKS,
  GUILDS_PER_PAGE,
  PARTY_LIMIT_MEMBERS,
  CHAT_FLAG_LIMIT_FOR_HIDING,
  CHAT_FLAG_FROM_MOD,
  CHAT_FLAG_FROM_SHADOW_MUTE,
};
// TODO Move these under api.constants
api.maxLevel = MAX_LEVEL;
api.maxHealth = MAX_HEALTH;
api.maxStatPoints = MAX_STAT_POINTS;
api.TAVERN_ID = TAVERN_ID;
api.capByLevel = statHelpers.capByLevel;
api.tnl = statHelpers.toNextLevel;
api.diminishingReturns = statHelpers.diminishingReturns;
api.$w = splitWhitespace;
api.refPush = refPush;
api.planGemLimits = planGemLimits;
api.preenTodos = preenTodos;
api.updateStore = updateStore;
api.inAppRewards = inAppRewards;
api.uuid = uuid;
api.taskDefaults = taskDefaults;
api.percent = percent;
api.gold = gold;
api.silver = silver;
api.noTags = noTags;
api.appliedTags = appliedTags;
api.pickDeep = pickDeep;
api.count = count;
api.statsComputed = statsComputed;
api.shops = shops;
api.achievements = achievements;
api.randomVal = randomVal;
api.hasClass = hasClass;

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
  blockUser,
  reroll,
  reset,
  markPmsRead,
  pinnedGearUtils,
};

export default api;
