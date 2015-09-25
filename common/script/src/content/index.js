import classes from './classes';
import mysterySets from './mystery-sets';
import itemList from './item-list';
import {
  tree as gearTree,
  flat as gearFlat,
  gearTypes,
} from './gear/index';
import timeTravelerStore from './time-traveler-store';
import potion from './health-potion';
import armoire from './armoire';
import spells from './spells/index';
import {special} from './spells/index';
import cardTypes from './card-types';
import {
  dropEggs,
  questEggs,
  allEggs,
} from './eggs/index';
import {
  dropPets,
  questPets,
  dropMounts,
  questMounts,
  specialPets,
  specialMounts,
} from './pets-mounts/index';
import timeTravelStable from './time-traveler-stable';
import hatchingPotions from './hatching-potions';
import food from './food/index';
import {
  all as allQuests,
  canOwnCategories as userCanOwnQuestCategories,
  byLevel as questsByLevel
} from './quests/index';
import backgrounds from './backgrounds';
import subscriptionBlocks from './subscription-blocks';
import userDefaults from './user-defaults';
import faq from './faq';

export default {
  // Constants
  classes: classes,
  gearTypes: gearTypes,
  mystery: mysterySets,
  itemList: itemList,
  userCanOwnQuestCategories: userCanOwnQuestCategories,

  // Gear
  gear: {
    tree: gearTree,
    flat: gearFlat
  },

  // Time Traveler Store
  timeTravelerStore: timeTravelerStore,
  timeTravelStable: timeTravelStable,

  // Non-Gear Static Rewards
  potion: potion,
  armoire: armoire,

  // Spells
  spells: spells,
  cardTypes: cardTypes,
  special: special,

  // Item Drops
  hatchingPotions: hatchingPotions,
  food: food,

  // Eggs
  dropEggs: dropEggs,
  questEggs: questEggs,
  eggs: allEggs,

  // Pets And Mounts
  pets: dropPets,
  questPets: questPets,
  mounts: dropMounts,
  questMounts: questMounts,
  specialPets: specialPets,
  specialMounts: specialMounts,

  // Quests
  quests: allQuests,
  questsByLevel: questsByLevel,

  // Backgrounds
  backgrounds: backgrounds,

  // Subscription Blocks
  subscriptionBlocks: subscriptionBlocks,

  // Default User Tasks
  userDefaults: userDefaults,

  // Frequently Asked Questions
  faq: faq,
};
