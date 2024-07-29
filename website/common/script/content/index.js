import defaults from 'lodash/defaults';
import each from 'lodash/each';
import moment from 'moment';
import t from './translation';
import { tasksByCategory } from './tasks';

import {
  EVENTS,
  CLASSES,
  GEAR_TYPES,
  ITEM_LIST,
  QUEST_SERIES_ACHIEVEMENTS,
  ANIMAL_COLOR_ACHIEVEMENTS,
  ANIMAL_SET_ACHIEVEMENTS,
  STABLE_ACHIEVEMENTS,
  PET_SET_COMPLETE_ACHIEVEMENTS,
} from './constants';

import achievements from './achievements';

import eggs from './eggs';
import hatchingPotions from './hatching-potions';
import stable from './stable';
import gear from './gear';
import { quests, questsByLevel, userCanOwnQuestCategories } from './quests';

import appearances from './appearance';
import { backgroundsTree, backgroundsFlat } from './appearance/backgrounds';
import bundles from './bundles';
import spells from './spells'; // eslint-disable-line import/no-cycle
import subscriptionBlocks from './subscriptionBlocks';
import gemsBlock from './gems';
import faq from './faq';
import timeTravelers from './time-travelers';

import { REPEATING_EVENTS, getRepeatingEvents } from './constants/events';

import loginIncentives from './loginIncentives';

import officialPinnedItems from './officialPinnedItems';
import memoize from '../fns/datedMemoize';

const api = {};

api.achievements = achievements;
api.questSeriesAchievements = QUEST_SERIES_ACHIEVEMENTS;
api.animalColorAchievements = ANIMAL_COLOR_ACHIEVEMENTS;
api.animalSetAchievements = ANIMAL_SET_ACHIEVEMENTS;
api.stableAchievements = STABLE_ACHIEVEMENTS;
api.petSetCompleteAchievs = PET_SET_COMPLETE_ACHIEVEMENTS;

api.quests = quests;
api.questsByLevel = questsByLevel;
api.userCanOwnQuestCategories = userCanOwnQuestCategories;

api.itemList = ITEM_LIST;

api.gear = gear;
api.spells = spells;
api.subscriptionBlocks = subscriptionBlocks;
api.gems = gemsBlock;

api.audioThemes = [
  'danielTheBard',
  'gokulTheme',
  'luneFoxTheme',
  'wattsTheme',
  'rosstavoTheme',
  'dewinTheme',
  'airuTheme',
  'beatscribeNesTheme',
  'arashiTheme',
  'maflTheme',
  'pizildenTheme',
  'farvoidTheme',
  'spacePenguinTheme',
  'lunasolTheme',
  'triumphTheme',
];

api.mystery = timeTravelers.mystery;
api.timeTravelerStore = timeTravelers.timeTravelerStore;

api.officialPinnedItems = officialPinnedItems;

api.bundles = bundles;

/*
   ---------------------------------------------------------------
   Unique Rewards: Potion and Armoire
   ---------------------------------------------------------------
   */

api.potion = {
  type: 'potion',
  text: t('potionText'),
  notes: t('potionNotes'),
  value: 25,
  key: 'potion',
};

api.armoire = {
  type: 'armoire',
  text: t('armoireText'),
  notes (count) {
    if (count === 0) {
      return t('armoireNotesEmpty')();
    }
    return `${t('armoireNotesFull')()} ${count}`;
  },
  value: 100,
  key: 'armoire',
  canOwn () {
    return true;
  },
};

api.events = EVENTS;
api.repeatingEvents = REPEATING_EVENTS;
api.getRepeatingEventsOnDate = getRepeatingEvents;

api.classes = CLASSES;

api.gearTypes = GEAR_TYPES;

api.cardTypes = {
  greeting: {
    key: 'greeting',
    messageOptions: 4,
    yearRound: true,
  },
  nye: {
    key: 'nye',
    messageOptions: 5,
  },
  thankyou: {
    key: 'thankyou',
    messageOptions: 4,
    yearRound: true,
  },
  valentine: {
    key: 'valentine',
    messageOptions: 4,
  },
  birthday: {
    key: 'birthday',
    messageOptions: 1,
    yearRound: true,
  },
  congrats: {
    key: 'congrats',
    messageOptions: 5,
    yearRound: true,
  },
  getwell: {
    key: 'getwell',
    messageOptions: 4,
    yearRound: true,
  },
  goodluck: {
    key: 'goodluck',
    messageOptions: 3,
    yearRound: true,
  },
};

api.special = api.spells.special;

Object.defineProperty(api, 'dropEggs', {
  get () { return eggs.drops; },
  enumerable: true,
});
Object.defineProperty(api, 'questEggs', {
  get () { return eggs.quests; },
  enumerable: true,
});
Object.defineProperty(api, 'eggs', {
  get () { return eggs.all; },
  enumerable: true,
});

api.timeTravelStable = {
  pets: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
    'MagicalBee-Base': t('magicalBee'),
    'Hippogriff-Hopeful': t('hopefulHippogriffPet'),
  },
  mounts: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
    'MagicalBee-Base': t('magicalBee'),
    'Hippogriff-Hopeful': t('hopefulHippogriffMount'),
  },
};

Object.defineProperty(api, 'dropHatchingPotions', {
  get () { return hatchingPotions.drops; },
  enumerable: true,
});
Object.defineProperty(api, 'premiumHatchingPotions', {
  get () { return hatchingPotions.premium; },
  enumerable: true,
});
Object.defineProperty(api, 'wackyHatchingPotions', {
  get () { return hatchingPotions.wacky; },
  enumerable: true,
});
Object.defineProperty(api, 'hatchingPotions', {
  get () { return hatchingPotions.all; },
  enumerable: true,
});

Object.defineProperty(api, 'pets', {
  get () { return stable.dropPets; },
  enumerable: true,
});
Object.defineProperty(api, 'premiumPets', {
  get () { return stable.premiumPets; },
  enumerable: true,
});
Object.defineProperty(api, 'questPets', {
  get () { return stable.questPets; },
  enumerable: true,
});
Object.defineProperty(api, 'specialPets', {
  get () { return stable.specialPets; },
  enumerable: true,
});
Object.defineProperty(api, 'wackyPets', {
  get () { return stable.wackyPets; },
  enumerable: true,
});
Object.defineProperty(api, 'petInfo', {
  get () { return stable.petInfo; },
  enumerable: true,
});

Object.defineProperty(api, 'mounts', {
  get () { return stable.dropMounts; },
  enumerable: true,
});
Object.defineProperty(api, 'premiumMounts', {
  get () { return stable.premiumMounts; },
  enumerable: true,
});
Object.defineProperty(api, 'questMounts', {
  get () { return stable.questMounts; },
  enumerable: true,
});
Object.defineProperty(api, 'specialMounts', {
  get () { return stable.specialMounts; },
  enumerable: true,
});
Object.defineProperty(api, 'mountInfo', {
  get () { return stable.mountInfo; },
  enumerable: true,
});

function buildFood () {
  const food = {
    Meat: {
      text: t('foodMeat'),
      textA: t('foodMeatA'),
      textThe: t('foodMeatThe'),
      target: 'Base',
    },
    Milk: {
      text: t('foodMilk'),
      textA: t('foodMilkA'),
      textThe: t('foodMilkThe'),
      target: 'White',
    },
    Potatoe: {
      text: t('foodPotatoe'),
      textA: t('foodPotatoeA'),
      textThe: t('foodPotatoeThe'),
      target: 'Desert',
    },
    Strawberry: {
      text: t('foodStrawberry'),
      textA: t('foodStrawberryA'),
      textThe: t('foodStrawberryThe'),
      target: 'Red',
    },
    Chocolate: {
      text: t('foodChocolate'),
      textA: t('foodChocolateA'),
      textThe: t('foodChocolateThe'),
      target: 'Shade',
    },
    Fish: {
      text: t('foodFish'),
      textA: t('foodFishA'),
      textThe: t('foodFishThe'),
      target: 'Skeleton',
    },
    RottenMeat: {
      text: t('foodRottenMeat'),
      textA: t('foodRottenMeatA'),
      textThe: t('foodRottenMeatThe'),
      target: 'Zombie',
    },
    CottonCandyPink: {
      text: t('foodCottonCandyPink'),
      textA: t('foodCottonCandyPinkA'),
      textThe: t('foodCottonCandyPinkThe'),
      target: 'CottonCandyPink',
    },
    CottonCandyBlue: {
      text: t('foodCottonCandyBlue'),
      textA: t('foodCottonCandyBlueA'),
      textThe: t('foodCottonCandyBlueThe'),
      target: 'CottonCandyBlue',
    },
    Honey: {
      text: t('foodHoney'),
      textA: t('foodHoneyA'),
      textThe: t('foodHoneyThe'),
      target: 'Golden',
    },
    Saddle: {
      sellWarningNote: t('foodSaddleSellWarningNote'),
      text: t('foodSaddleText'),
      value: 5,
      notes: t('foodSaddleNotes'),
      canBuy: () => true,
      canDrop: false,
    },
    /* eslint-disable camelcase */
    Cake_Skeleton: {
      text: t('foodCakeSkeleton'),
      textA: t('foodCakeSkeletonA'),
      textThe: t('foodCakeSkeletonThe'),
      target: 'Skeleton',
    },
    Cake_Base: {
      text: t('foodCakeBase'),
      textA: t('foodCakeBaseA'),
      textThe: t('foodCakeBaseThe'),
      target: 'Base',
    },
    Cake_CottonCandyBlue: {
      text: t('foodCakeCottonCandyBlue'),
      textA: t('foodCakeCottonCandyBlueA'),
      textThe: t('foodCakeCottonCandyBlueThe'),
      target: 'CottonCandyBlue',
    },
    Cake_CottonCandyPink: {
      text: t('foodCakeCottonCandyPink'),
      textA: t('foodCakeCottonCandyPinkA'),
      textThe: t('foodCakeCottonCandyPinkThe'),
      target: 'CottonCandyPink',
    },
    Cake_Shade: {
      text: t('foodCakeShade'),
      textA: t('foodCakeShadeA'),
      textThe: t('foodCakeShadeThe'),
      target: 'Shade',
    },
    Cake_White: {
      text: t('foodCakeWhite'),
      textA: t('foodCakeWhiteA'),
      textThe: t('foodCakeWhiteThe'),
      target: 'White',
    },
    Cake_Golden: {
      text: t('foodCakeGolden'),
      textA: t('foodCakeGoldenA'),
      textThe: t('foodCakeGoldenThe'),
      target: 'Golden',
    },
    Cake_Zombie: {
      text: t('foodCakeZombie'),
      textA: t('foodCakeZombieA'),
      textThe: t('foodCakeZombieThe'),
      target: 'Zombie',
    },
    Cake_Desert: {
      text: t('foodCakeDesert'),
      textA: t('foodCakeDesertA'),
      textThe: t('foodCakeDesertThe'),
      target: 'Desert',
    },
    Cake_Red: {
      text: t('foodCakeRed'),
      textA: t('foodCakeRedA'),
      textThe: t('foodCakeRedThe'),
      target: 'Red',
    },
    Candy_Skeleton: {
      text: t('foodCandySkeleton'),
      textA: t('foodCandySkeletonA'),
      textThe: t('foodCandySkeletonThe'),
      target: 'Skeleton',
    },
    Candy_Base: {
      text: t('foodCandyBase'),
      textA: t('foodCandyBaseA'),
      textThe: t('foodCandyBaseThe'),
      target: 'Base',
    },
    Candy_CottonCandyBlue: {
      text: t('foodCandyCottonCandyBlue'),
      textA: t('foodCandyCottonCandyBlueA'),
      textThe: t('foodCandyCottonCandyBlueThe'),
      target: 'CottonCandyBlue',
    },
    Candy_CottonCandyPink: {
      text: t('foodCandyCottonCandyPink'),
      textA: t('foodCandyCottonCandyPinkA'),
      textThe: t('foodCandyCottonCandyPinkThe'),
      target: 'CottonCandyPink',
    },
    Candy_Shade: {
      text: t('foodCandyShade'),
      textA: t('foodCandyShadeA'),
      textThe: t('foodCandyShadeThe'),
      target: 'Shade',
    },
    Candy_White: {
      text: t('foodCandyWhite'),
      textA: t('foodCandyWhiteA'),
      textThe: t('foodCandyWhiteThe'),
      target: 'White',
    },
    Candy_Golden: {
      text: t('foodCandyGolden'),
      textA: t('foodCandyGoldenA'),
      textThe: t('foodCandyGoldenThe'),
      target: 'Golden',
    },
    Candy_Zombie: {
      text: t('foodCandyZombie'),
      textA: t('foodCandyZombieA'),
      textThe: t('foodCandyZombieThe'),
      target: 'Zombie',
    },
    Candy_Desert: {
      text: t('foodCandyDesert'),
      textA: t('foodCandyDesertA'),
      textThe: t('foodCandyDesertThe'),
      target: 'Desert',
    },
    Candy_Red: {
      text: t('foodCandyRed'),
      textA: t('foodCandyRedA'),
      textThe: t('foodCandyRedThe'),
      target: 'Red',
    },
    Pie_Skeleton: {
      text: t('foodPieSkeleton'),
      textA: t('foodPieSkeletonA'),
      textThe: t('foodPieSkeletonThe'),
      target: 'Skeleton',
    },
    Pie_Base: {
      text: t('foodPieBase'),
      textA: t('foodPieBaseA'),
      textThe: t('foodPieBaseThe'),
      target: 'Base',
    },
    Pie_CottonCandyBlue: {
      text: t('foodPieCottonCandyBlue'),
      textA: t('foodPieCottonCandyBlueA'),
      textThe: t('foodPieCottonCandyBlueThe'),
      target: 'CottonCandyBlue',
    },
    Pie_CottonCandyPink: {
      text: t('foodPieCottonCandyPink'),
      textA: t('foodPieCottonCandyPinkA'),
      textThe: t('foodPieCottonCandyPinkThe'),
      target: 'CottonCandyPink',
    },
    Pie_Shade: {
      text: t('foodPieShade'),
      textA: t('foodPieShadeA'),
      textThe: t('foodPieShadeThe'),
      target: 'Shade',
    },
    Pie_White: {
      text: t('foodPieWhite'),
      textA: t('foodPieWhiteA'),
      textThe: t('foodPieWhiteThe'),
      target: 'White',
    },
    Pie_Golden: {
      text: t('foodPieGolden'),
      textA: t('foodPieGoldenA'),
      textThe: t('foodPieGoldenThe'),
      target: 'Golden',
    },
    Pie_Zombie: {
      text: t('foodPieZombie'),
      textA: t('foodPieZombieA'),
      textThe: t('foodPieZombieThe'),
      target: 'Zombie',
    },
    Pie_Desert: {
      text: t('foodPieDesert'),
      textA: t('foodPieDesertA'),
      textThe: t('foodPieDesertThe'),
      target: 'Desert',
    },
    Pie_Red: {
      text: t('foodPieRed'),
      textA: t('foodPieRedA'),
      textThe: t('foodPieRedThe'),
      target: 'Red',
    },
    /* eslint-enable camelcase */
  };

  let FOOD_SEASON = 'Normal';
  getRepeatingEvents(moment()).forEach(event => {
    if (event.foodSeason) {
      FOOD_SEASON = event.foodSeason;
    }
  });
  each(food, (foodItem, key) => {
    let foodType = 'Normal';
    if (key.startsWith('Cake_')) {
      foodType = 'Cake';
    } else if (key.startsWith('Candy_')) {
      foodType = 'Candy';
    } else if (key.startsWith('Pie_')) {
      foodType = 'Pie';
    }
    defaults(foodItem, {
      value: 1,
      key,
      notes: t('foodNotes'),
      canBuy: () => FOOD_SEASON === foodType,
      canDrop: FOOD_SEASON === foodType,
    });
  });

  return food;
}

const memoizedBuildFood = memoize(buildFood);
Object.defineProperty(api, 'food', {
  get () { return memoizedBuildFood(); },
  enumerable: true,
});
api.appearances = appearances;
api.backgrounds = backgroundsTree();
api.backgroundsFlat = backgroundsFlat();

api.userDefaults = {
  habits: [
    {
      type: 'habit',
      text: t('defaultHabit1Text'),
      value: 0,
      up: true,
      down: false,
      attribute: 'per',
      tags: [
        t('defaultTag1'), // Work
        t('defaultTag4'), // School
        t('defaultTag6'), // Chores
      ],
    },
    {
      type: 'habit',
      text: t('defaultHabit2Text'),
      value: 0,
      up: false,
      down: true,
      attribute: 'str',
      tags: [
        t('defaultTag3'), // Health + Wellness
      ],
    },
    {
      type: 'habit',
      text: t('defaultHabit3Text'),
      value: 0,
      up: true,
      down: true,
      attribute: 'str',
      tags: [
        t('defaultTag2'), // Exercise
        t('defaultTag3'), // Health + Wellness
      ],
    },
  ],
  dailys: [],
  todos: [
    {
      type: 'todo',
      text: t('defaultTodo1Text'),
      notes: t('defaultTodoNotes'),
      completed: false,
      attribute: 'int',
    },
  ],
  rewards: [
    {
      type: 'reward',
      text: t('defaultReward1Text'),
      value: 10,
    },
  ],
  tags: [
    {
      name: t('defaultTag1'),
    },
    {
      name: t('defaultTag2'),
    },
    {
      name: t('defaultTag3'),
    },
    {
      name: t('defaultTag4'),
    },
    {
      name: t('defaultTag5'),
    },
    {
      name: t('defaultTag6'),
    },
    {
      name: t('defaultTag7'),
    },
  ],
};
api.tasksByCategory = tasksByCategory;

api.userDefaultsMobile = {
  habits: [],
  dailys: [],
  todos: [],
  rewards: [],
  tags: [],
};

api.faq = faq;

api.loginIncentives = loginIncentives(api);

export default api;
