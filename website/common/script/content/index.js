import defaults from 'lodash/defaults';
import each from 'lodash/each';
import moment from 'moment';
import t from './translation';

import {
  CLASSES,
  GEAR_TYPES,
  ITEM_LIST,
} from './constants';

let api = module.exports;

import achievements from './achievements';

import eggs from './eggs';
import hatchingPotions from './hatching-potions';
import stable from './stable';
import gear from './gear';
import {
  quests,
  questsByLevel,
  userCanOwnQuestCategories,
} from './quests';

import appearances from './appearance';
import {backgroundsTree, backgroundsFlat} from './appearance/backgrounds';
import spells from './spells';
import subscriptionBlocks from './subscriptionBlocks';
import faq from './faq';
import timeTravelers from './time-travelers';

import loginIncentives from './loginIncentives';

import officialPinnedItems from './officialPinnedItems';

api.achievements = achievements;

api.quests = quests;
api.questsByLevel = questsByLevel;
api.userCanOwnQuestCategories = userCanOwnQuestCategories;

api.itemList = ITEM_LIST;

api.gear = gear;
api.spells = spells;
api.subscriptionBlocks = subscriptionBlocks;

api.audioThemes = ['danielTheBard', 'gokulTheme', 'luneFoxTheme', 'wattsTheme', 'rosstavoTheme', 'dewinTheme', 'airuTheme', 'beatscribeNesTheme', 'arashiTheme', 'maflTheme', 'pizildenTheme', 'farvoidTheme', 'spacePenguinTheme', 'lunasolTheme'];

api.mystery = timeTravelers.mystery;
api.timeTravelerStore = timeTravelers.timeTravelerStore;

api.officialPinnedItems = officialPinnedItems;

/*
   ---------------------------------------------------------------
   Discounted Item Bundles
   ---------------------------------------------------------------
   */

api.bundles = {
  featheredFriends: {
    key: 'featheredFriends',
    text: t('featheredFriendsText'),
    notes: t('featheredFriendsNotes'),
    bundleKeys: [
      'falcon',
      'harpy',
      'owl',
    ],
    canBuy () {
      return moment().isBetween('2017-05-16', '2017-05-31');
    },
    type: 'quests',
    class: 'quest_bundle_featheredFriends',
    value: 7,
  },
  splashyPals: {
    key: 'splashyPals',
    text: t('splashyPalsText'),
    notes: t('splashyPalsNotes'),
    bundleKeys: [
      'dilatory_derby',
      'turtle',
      'whale',
    ],
    canBuy () {
      return moment().isBetween('2017-07-11', '2017-08-02');
    },
    type: 'quests',
    class: 'quest_bundle_splashyPals',
    value: 7,
  },
  farmFriends: {
    key: 'farmFriends',
    text: t('farmFriendsText'),
    notes: t('farmFriendsNotes'),
    bundleKeys: [
      'cow',
      'horse',
      'sheep',
    ],
    canBuy () {
      return moment().isBetween('2017-09-12', '2017-10-07');
    },
    type: 'quests',
    value: 7,
  },
  witchyFamiliars: {
    key: 'witchyFamiliars',
    text: t('witchyFamiliarsText'),
    notes: t('witchyFamiliarsNotes'),
    bundleKeys: [
      'rat',
      'spider',
      'frog',
    ],
    canBuy () {
      return moment().isBetween('2017-10-10', '2017-11-02');
    },
    type: 'quests',
    value: 7,
  },
  winterQuests: {
    key: 'winterQuests',
    text: t('winterQuestsText'),
    notes: t('winterQuestsNotes'),
    bundleKeys: [
      'evilsanta',
      'evilsanta2',
      'penguin',
    ],
    canBuy () {
      return moment().isBetween('2017-12-14', '2018-01-01');
    },
    type: 'quests',
    value: 7,
  },
};

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
  notes (user, count) {
    if (user.flags.armoireEmpty) {
      return t('armoireNotesEmpty')();
    }
    return t('armoireNotesFull')() + count;
  },
  value: 100,
  key: 'armoire',
  canOwn () {
    return true;
  },
};


/*
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
   */

api.classes = CLASSES;


/*
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
   */

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

api.dropEggs = eggs.drops;
api.questEggs = eggs.quests;
api.eggs = eggs.all;

api.timeTravelStable = {
  pets: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
    'MagicalBee-Base': t('magicalBee'),
  },
  mounts: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
    'MagicalBee-Base': t('magicalBee'),
  },
};

api.dropHatchingPotions = hatchingPotions.drops;
api.premiumHatchingPotions = hatchingPotions.premium;
api.hatchingPotions = hatchingPotions.all;

api.pets = stable.dropPets;
api.premiumPets = stable.premiumPets;
api.questPets = stable.questPets;
api.specialPets = stable.specialPets;
api.petInfo = stable.petInfo;

api.mounts = stable.dropMounts;
api.questMounts = stable.questMounts;
api.premiumMounts = stable.premiumMounts;
api.specialMounts = stable.specialMounts;
api.mountInfo = stable.mountInfo;

// For seasonal events, change these booleans:
let canBuyNormalFood = true;
let canDropNormalFood = true;
let canBuyCandyFood = false;
let canDropCandyFood = false;
let canBuyCakeFood = false;
let canDropCakeFood = false;

api.food = {
  Meat: {
    text: t('foodMeat'),
    target: 'Base',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Milk: {
    text: t('foodMilk'),
    target: 'White',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Potatoe: {
    text: t('foodPotatoe'),
    target: 'Desert',
    article: 'a ',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Strawberry: {
    text: t('foodStrawberry'),
    target: 'Red',
    article: 'a ',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Chocolate: {
    text: t('foodChocolate'),
    target: 'Shade',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Fish: {
    text: t('foodFish'),
    target: 'Skeleton',
    article: 'a ',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  RottenMeat: {
    text: t('foodRottenMeat'),
    target: 'Zombie',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  CottonCandyPink: {
    text: t('foodCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  CottonCandyBlue: {
    text: t('foodCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Honey: {
    text: t('foodHoney'),
    target: 'Golden',
    article: '',
    canBuy () {
      return canBuyNormalFood;
    },
    canDrop: canDropNormalFood,
  },
  Saddle: {
    canBuy () {
      return true;
    },
    sellWarningNote: t('foodSaddleSellWarningNote'),
    text: t('foodSaddleText'),
    value: 5,
    notes: t('foodSaddleNotes'),
  },
  /* eslint-disable camelcase */
  Cake_Skeleton: {
    text: t('foodCakeSkeleton'),
    target: 'Skeleton',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Base: {
    text: t('foodCakeBase'),
    target: 'Base',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_CottonCandyBlue: {
    text: t('foodCakeCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_CottonCandyPink: {
    text: t('foodCakeCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Shade: {
    text: t('foodCakeShade'),
    target: 'Shade',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_White: {
    text: t('foodCakeWhite'),
    target: 'White',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Golden: {
    text: t('foodCakeGolden'),
    target: 'Golden',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Zombie: {
    text: t('foodCakeZombie'),
    target: 'Zombie',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Desert: {
    text: t('foodCakeDesert'),
    target: 'Desert',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Cake_Red: {
    text: t('foodCakeRed'),
    target: 'Red',
    article: '',
    canBuy () {
      return canBuyCakeFood;
    },
    canDrop: canDropCakeFood,
  },
  Candy_Skeleton: {
    text: t('foodCandySkeleton'),
    target: 'Skeleton',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Base: {
    text: t('foodCandyBase'),
    target: 'Base',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_CottonCandyBlue: {
    text: t('foodCandyCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_CottonCandyPink: {
    text: t('foodCandyCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Shade: {
    text: t('foodCandyShade'),
    target: 'Shade',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_White: {
    text: t('foodCandyWhite'),
    target: 'White',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Golden: {
    text: t('foodCandyGolden'),
    target: 'Golden',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Zombie: {
    text: t('foodCandyZombie'),
    target: 'Zombie',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Desert: {
    text: t('foodCandyDesert'),
    target: 'Desert',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  Candy_Red: {
    text: t('foodCandyRed'),
    target: 'Red',
    article: '',
    canBuy () {
      return canBuyCandyFood;
    },
    canDrop: canDropCandyFood,
  },
  /* eslint-enable camelcase */
};

each(api.food, (food, key) => {
  return defaults(food, {
    value: 1,
    key,
    notes: t('foodNotes'),
    canBuy () {
      return false;
    },
    canDrop: false,
  });
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
        t('defaultTag1'),  // Work
        t('defaultTag4'),  // School
        t('defaultTag6'),  // Chores
      ],
    }, {
      type: 'habit',
      text: t('defaultHabit2Text'),
      value: 0,
      up: false,
      down: true,
      attribute: 'str',
      tags: [
        t('defaultTag3'),  // Health + Wellness
      ],
    }, {
      type: 'habit',
      text: t('defaultHabit3Text'),
      value: 0,
      up: true,
      down: true,
      attribute: 'str',
      tags: [
        t('defaultTag2'),  // Exercise
        t('defaultTag3'),  // Health + Wellness
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
    }, {
      name: t('defaultTag2'),
    }, {
      name: t('defaultTag3'),
    }, {
      name: t('defaultTag4'),
    }, {
      name: t('defaultTag5'),
    }, {
      name: t('defaultTag6'),
    }, {
      name: t('defaultTag7'),
    },
  ],
};

api.userDefaultsMobile = {
  habits: [],
  dailys: [],
  todos: [],
  rewards: [],
  tags: [],
};

api.faq = faq;

api.loginIncentives = loginIncentives(api);
