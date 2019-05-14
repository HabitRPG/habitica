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

api.audioThemes = ['danielTheBard', 'gokulTheme', 'luneFoxTheme', 'wattsTheme', 'rosstavoTheme', 'dewinTheme', 'airuTheme', 'beatscribeNesTheme', 'arashiTheme', 'maflTheme', 'pizildenTheme', 'farvoidTheme', 'spacePenguinTheme', 'lunasolTheme', 'triumphTheme'];

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
      return moment().isBetween('2019-05-09', '2019-06-02');
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
  hugabug: {
    key: 'hugabug',
    text: t('hugabugText'),
    notes: t('hugabugNotes'),
    bundleKeys: [
      'snail',
      'beetle',
      'butterfly',
    ],
    canBuy () {
      return moment().isBetween('2018-02-06', '2018-04-02');
    },
    type: 'quests',
    value: 7,
  },
  cuddleBuddies: {
    key: 'cuddleBuddies',
    text: t('cuddleBuddiesText'),
    notes: t('cuddleBuddiesNotes'),
    bundleKeys: [
      'bunny',
      'ferret',
      'guineapig',
    ],
    canBuy () {
      return moment().isBetween('2018-05-08', '2018-06-02');
    },
    type: 'quests',
    value: 7,
  },
  aquaticAmigos: {
    key: 'aquaticAmigos',
    text: t('aquaticAmigosText'),
    notes: t('aquaticAmigosNotes'),
    bundleKeys: [
      'axolotl',
      'kraken',
      'octopus',
    ],
    canBuy () {
      return moment().isBetween('2018-06-12', '2018-07-02');
    },
    type: 'quests',
    value: 7,
  },
  forestFriends: {
    key: 'forestFriends',
    text: t('forestFriendsText'),
    notes: t('forestFriendsNotes'),
    bundleKeys: [
      'ghost_stag',
      'hedgehog',
      'treeling',
    ],
    canBuy () {
      return moment().isBetween('2018-09-11', '2018-10-02');
    },
    type: 'quests',
    value: 7,
  },
  oddballs: {
    key: 'oddballs',
    text: t('oddballsText'),
    notes: t('oddballsNotes'),
    bundleKeys: [
      'slime',
      'rock',
      'yarn',
    ],
    canBuy () {
      return moment().isBetween('2018-11-15', '2018-12-04');
    },
    type: 'quests',
    value: 7,
  },
  birdBuddies: {
    key: 'birdBuddies',
    text: t('birdBuddiesText'),
    notes: t('birdBuddiesNotes'),
    bundleKeys: [
      'peacock',
      'penguin',
      'rooster',
    ],
    canBuy () {
      return moment().isBetween('2018-12-11', '2019-01-02');
    },
    type: 'quests',
    value: 7,
  },
  mythicalMarvels: {
    key: 'mythicalMarvels',
    text: t('mythicalMarvelsText'),
    notes: t('mythicalMarvelsNotes'),
    bundleKeys: [
      'unicorn',
      'seaserpent',
      'gryphon',
    ],
    canBuy () {
      return moment().isBetween('2019-02-19', '2019-03-02');
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
    return `${t('armoireNotesFull')()} ${count}`;
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
api.wackyHatchingPotions = hatchingPotions.wacky;
api.hatchingPotions = hatchingPotions.all;

api.pets = stable.dropPets;
api.premiumPets = stable.premiumPets;
api.questPets = stable.questPets;
api.specialPets = stable.specialPets;
api.wackyPets = stable.wackyPets;
api.petInfo = stable.petInfo;

api.mounts = stable.dropMounts;
api.questMounts = stable.questMounts;
api.premiumMounts = stable.premiumMounts;
api.specialMounts = stable.specialMounts;
api.mountInfo = stable.mountInfo;

// For seasonal events, change this constant:

const FOOD_SEASON = 'Normal';

api.food = {
  Meat: {
    text: t('foodMeat'),
    textA: t('foodMeatA'),
    textThe: t('foodMeatThe'),
    target: 'Base',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Milk: {
    text: t('foodMilk'),
    textA: t('foodMilkA'),
    textThe: t('foodMilkThe'),
    target: 'White',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Potatoe: {
    text: t('foodPotatoe'),
    textA: t('foodPotatoeA'),
    textThe: t('foodPotatoeThe'),
    target: 'Desert',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Strawberry: {
    text: t('foodStrawberry'),
    textA: t('foodStrawberryA'),
    textThe: t('foodStrawberryThe'),
    target: 'Red',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Chocolate: {
    text: t('foodChocolate'),
    textA: t('foodChocolateA'),
    textThe: t('foodChocolateThe'),
    target: 'Shade',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Fish: {
    text: t('foodFish'),
    textA: t('foodFishA'),
    textThe: t('foodFishThe'),
    target: 'Skeleton',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  RottenMeat: {
    text: t('foodRottenMeat'),
    textA: t('foodRottenMeatA'),
    textThe: t('foodRottenMeatThe'),
    target: 'Zombie',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  CottonCandyPink: {
    text: t('foodCottonCandyPink'),
    textA: t('foodCottonCandyPinkA'),
    textThe: t('foodCottonCandyPinkThe'),
    target: 'CottonCandyPink',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  CottonCandyBlue: {
    text: t('foodCottonCandyBlue'),
    textA: t('foodCottonCandyBlueA'),
    textThe: t('foodCottonCandyBlueThe'),
    target: 'CottonCandyBlue',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
  },
  Honey: {
    text: t('foodHoney'),
    textA: t('foodHoneyA'),
    textThe: t('foodHoneyThe'),
    target: 'Golden',
    canBuy () {
      return FOOD_SEASON === 'Normal';
    },
    canDrop: FOOD_SEASON === 'Normal',
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
    textA: t('foodCakeSkeletonA'),
    textThe: t('foodCakeSkeletonThe'),
    target: 'Skeleton',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Base: {
    text: t('foodCakeBase'),
    textA: t('foodCakeBaseA'),
    textThe: t('foodCakeBaseThe'),
    target: 'Base',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_CottonCandyBlue: {
    text: t('foodCakeCottonCandyBlue'),
    textA: t('foodCakeCottonCandyBlueA'),
    textThe: t('foodCakeCottonCandyBlueThe'),
    target: 'CottonCandyBlue',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_CottonCandyPink: {
    text: t('foodCakeCottonCandyPink'),
    textA: t('foodCakeCottonCandyPinkA'),
    textThe: t('foodCakeCottonCandyPinkThe'),
    target: 'CottonCandyPink',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Shade: {
    text: t('foodCakeShade'),
    textA: t('foodCakeShadeA'),
    textThe: t('foodCakeShadeThe'),
    target: 'Shade',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_White: {
    text: t('foodCakeWhite'),
    textA: t('foodCakeWhiteA'),
    textThe: t('foodCakeWhiteThe'),
    target: 'White',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Golden: {
    text: t('foodCakeGolden'),
    textA: t('foodCakeGoldenA'),
    textThe: t('foodCakeGoldenThe'),
    target: 'Golden',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Zombie: {
    text: t('foodCakeZombie'),
    textA: t('foodCakeZombieA'),
    textThe: t('foodCakeZombieThe'),
    target: 'Zombie',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Desert: {
    text: t('foodCakeDesert'),
    textA: t('foodCakeDesertA'),
    textThe: t('foodCakeDesertThe'),
    target: 'Desert',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Cake_Red: {
    text: t('foodCakeRed'),
    textA: t('foodCakeRedA'),
    textThe: t('foodCakeRedThe'),
    target: 'Red',
    canBuy () {
      return FOOD_SEASON === 'Cake';
    },
    canDrop: FOOD_SEASON === 'Cake',
  },
  Candy_Skeleton: {
    text: t('foodCandySkeleton'),
    textA: t('foodCandySkeletonA'),
    textThe: t('foodCandySkeletonThe'),
    target: 'Skeleton',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Base: {
    text: t('foodCandyBase'),
    textA: t('foodCandyBaseA'),
    textThe: t('foodCandyBaseThe'),
    target: 'Base',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_CottonCandyBlue: {
    text: t('foodCandyCottonCandyBlue'),
    textA: t('foodCandyCottonCandyBlueA'),
    textThe: t('foodCandyCottonCandyBlueThe'),
    target: 'CottonCandyBlue',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_CottonCandyPink: {
    text: t('foodCandyCottonCandyPink'),
    textA: t('foodCandyCottonCandyPinkA'),
    textThe: t('foodCandyCottonCandyPinkThe'),
    target: 'CottonCandyPink',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Shade: {
    text: t('foodCandyShade'),
    textA: t('foodCandyShadeA'),
    textThe: t('foodCandyShadeThe'),
    target: 'Shade',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_White: {
    text: t('foodCandyWhite'),
    textA: t('foodCandyWhiteA'),
    textThe: t('foodCandyWhiteThe'),
    target: 'White',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Golden: {
    text: t('foodCandyGolden'),
    textA: t('foodCandyGoldenA'),
    textThe: t('foodCandyGoldenThe'),
    target: 'Golden',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Zombie: {
    text: t('foodCandyZombie'),
    textA: t('foodCandyZombieA'),
    textThe: t('foodCandyZombieThe'),
    target: 'Zombie',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Desert: {
    text: t('foodCandyDesert'),
    textA: t('foodCandyDesertA'),
    textThe: t('foodCandyDesertThe'),
    target: 'Desert',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Candy_Red: {
    text: t('foodCandyRed'),
    textA: t('foodCandyRedA'),
    textThe: t('foodCandyRedThe'),
    target: 'Red',
    canBuy () {
      return FOOD_SEASON === 'Candy';
    },
    canDrop: FOOD_SEASON === 'Candy',
  },
  Pie_Skeleton: {
    text: t('foodPieSkeleton'),
    textA: t('foodPieSkeletonA'),
    textThe: t('foodPieSkeletonThe'),
    target: 'Skeleton',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Base: {
    text: t('foodPieBase'),
    textA: t('foodPieBaseA'),
    textThe: t('foodPieBaseThe'),
    target: 'Base',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_CottonCandyBlue: {
    text: t('foodPieCottonCandyBlue'),
    textA: t('foodPieCottonCandyBlueA'),
    textThe: t('foodPieCottonCandyBlueThe'),
    target: 'CottonCandyBlue',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_CottonCandyPink: {
    text: t('foodPieCottonCandyPink'),
    textA: t('foodPieCottonCandyPinkA'),
    textThe: t('foodPieCottonCandyPinkThe'),
    target: 'CottonCandyPink',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Shade: {
    text: t('foodPieShade'),
    textA: t('foodPieShadeA'),
    textThe: t('foodPieShadeThe'),
    target: 'Shade',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_White: {
    text: t('foodPieWhite'),
    textA: t('foodPieWhiteA'),
    textThe: t('foodPieWhiteThe'),
    target: 'White',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Golden: {
    text: t('foodPieGolden'),
    textA: t('foodPieGoldenA'),
    textThe: t('foodPieGoldenThe'),
    target: 'Golden',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Zombie: {
    text: t('foodPieZombie'),
    textA: t('foodPieZombieA'),
    textThe: t('foodPieZombieThe'),
    target: 'Zombie',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Desert: {
    text: t('foodPieDesert'),
    textA: t('foodPieDesertA'),
    textThe: t('foodPieDesertThe'),
    target: 'Desert',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
  },
  Pie_Red: {
    text: t('foodPieRed'),
    textA: t('foodPieRedA'),
    textThe: t('foodPieRedThe'),
    target: 'Red',
    canBuy () {
      return FOOD_SEASON === 'Pie';
    },
    canDrop: FOOD_SEASON === 'Pie',
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
