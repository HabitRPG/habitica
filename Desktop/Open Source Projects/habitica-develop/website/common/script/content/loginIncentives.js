import range from 'lodash/range';
import { MAX_INCENTIVES } from '../constants';

// NOTE do not import this file alone but only access it through common.content
// so that it's already compiled
module.exports = function getLoginIncentives (api) {
  let loginIncentives = {
    1: {
      rewardKey: ['armor_special_bardRobes'],
      reward: [api.gear.flat.armor_special_bardRobes],
      assignReward: function assignReward (user) {
        user.items.gear.owned.armor_special_bardRobes = true; // eslint-disable-line camelcase
      },
    },
    2: {
      rewardKey: ['background_purple'],
      reward: [api.backgrounds.incentiveBackgrounds],
      rewardName: 'incentiveBackgrounds', // i18n string
      assignReward: function assignReward (user) {
        user.purchased.background.blue = true;
        user.purchased.background.green = true;
        user.purchased.background.purple = true;
        user.purchased.background.red = true;
        user.purchased.background.yellow = true;
        if (user.markModified) user.markModified('purchased.background');
      },
    },
    3: {
      rewardKey: ['head_special_bardHat'],
      reward: [api.gear.flat.head_special_bardHat],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_bardHat = true; // eslint-disable-line camelcase
      },
    },
    4: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    5: {
      rewardKey: ['Pet_Food_Chocolate', 'Pet_Food_Meat', 'Pet_Food_CottonCandyPink'],
      reward: [api.food.Chocolate, api.food.Meat, api.food.CottonCandyPink],
      assignReward: function assignReward (user) {
        if (!user.items.food.Chocolate) user.items.food.Chocolate = 0;
        user.items.food.Chocolate += 1;
        if (!user.items.food.Meat) user.items.food.Meat = 0;
        user.items.food.Meat += 1;
        if (!user.items.food.CottonCandyPink) user.items.food.CottonCandyPink = 0;
        user.items.food.CottonCandyPink += 1;
      },
    },
    7: {
      rewardKey: ['inventory_quest_scroll_moon1'],
      reward: [api.quests.moon1],
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon1) user.items.quests.moon1 = 0;
        user.items.quests.moon1 += 1;
      },
    },
    10: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    14: {
      rewardKey: ['Pet_Food_Strawberry', 'Pet_Food_Potatoe', 'Pet_Food_CottonCandyBlue'],
      reward: [api.food.Strawberry, api.food.Potatoe, api.food.CottonCandyBlue],
      assignReward: function assignReward (user) {
        if (!user.items.food.Strawberry) user.items.food.Strawberry = 0;
        user.items.food.Strawberry += 1;
        if (!user.items.food.Potatoe) user.items.food.Potatoe = 0;
        user.items.food.Potatoe += 1;
        if (!user.items.food.CottonCandyBlue) user.items.food.CottonCandyBlue = 0;
        user.items.food.CottonCandyBlue += 1;
      },
    },
    18: {
      rewardKey: ['weapon_special_bardInstrument'],
      reward: [api.gear.flat.weapon_special_bardInstrument],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_bardInstrument = true; // eslint-disable-line camelcase
      },
    },
    22: {
      rewardKey: ['inventory_quest_scroll_moon2'],
      reward: [api.quests.moon2],
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon2) user.items.quests.moon2 = 0;
        user.items.quests.moon2 += 1;
      },
    },
    26: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    30: {
      rewardKey: ['Pet_Food_Fish', 'Pet_Food_Milk', 'Pet_Food_RottenMeat', 'Pet_Food_Honey'],
      reward: [api.food.Fish, api.food.Milk, api.food.RottenMeat, api.food.Honey],
      assignReward: function assignReward (user) {
        if (!user.items.food.Fish) user.items.food.Fish = 0;
        user.items.food.Fish += 1;
        if (!user.items.food.Milk) user.items.food.Milk = 0;
        user.items.food.Milk += 1;
        if (!user.items.food.RottenMeat) user.items.food.RottenMeat = 0;
        user.items.food.RottenMeat += 1;
        if (!user.items.food.Honey) user.items.food.Honey = 0;
        user.items.food.Honey += 1;
      },
    },
    35: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    40: {
      rewardKey: ['inventory_quest_scroll_moon3'],
      reward: [api.quests.moon3],
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon3) user.items.quests.moon3 = 0;
        user.items.quests.moon3 += 1;
      },
    },
    45: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    50: {
      rewardKey: ['Pet_Food_Saddle'],
      reward: [api.food.Saddle],
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 1;
      },
    },
    55: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    60: {
      rewardKey: ['slim_armor_special_pageArmor'],
      reward: [api.gear.flat.armor_special_pageArmor],
      assignReward: function assignReward (user) {
        user.items.gear.owned.armor_special_pageArmor = true; // eslint-disable-line camelcase
      },
    },
    65: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    70: {
      rewardKey: ['head_special_pageHelm'],
      reward: [api.gear.flat.head_special_pageHelm],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_pageHelm = true; // eslint-disable-line camelcase
      },
    },
    75: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    80: {
      rewardKey: ['weapon_special_pageBanner'],
      reward: [api.gear.flat.weapon_special_pageBanner],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_pageBanner = true; // eslint-disable-line camelcase
      },
    },
    85: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    90: {
      rewardKey: ['shield_special_diamondStave'],
      reward: [api.gear.flat.shield_special_diamondStave],
      assignReward: function assignReward (user) {
        user.items.gear.owned.shield_special_diamondStave = true; // eslint-disable-line camelcase
      },
    },
    95: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    100: {
      rewardKey: ['Pet_Food_Saddle'],
      reward: [api.food.Saddle],
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 1;
      },
    },
    105: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    110: {
      rewardKey: ['Pet_Egg_Cactus', 'Pet_Egg_Dragon', 'Pet_Egg_Wolf'],
      reward: [api.eggs.BearCub, api.eggs.Cactus, api.eggs.Dragon, api.eggs.FlyingPig, api.eggs.Fox, api.eggs.LionCub, api.eggs.PandaCub, api.eggs.TigerCub, api.eggs.Wolf],
      rewardName: 'oneOfAllPetEggs',
      assignReward: function assignReward (user) {
        if (!user.items.eggs.BearCub) user.items.eggs.BearCub = 0;
        user.items.eggs.BearCub += 1;
        if (!user.items.eggs.Cactus) user.items.eggs.Cactus = 0;
        user.items.eggs.Cactus += 1;
        if (!user.items.eggs.Dragon) user.items.eggs.Dragon = 0;
        user.items.eggs.Dragon += 1;
        if (!user.items.eggs.FlyingPig) user.items.eggs.FlyingPig = 0;
        user.items.eggs.FlyingPig += 1;
        if (!user.items.eggs.Fox) user.items.eggs.Fox = 0;
        user.items.eggs.Fox += 1;
        if (!user.items.eggs.LionCub) user.items.eggs.LionCub = 0;
        user.items.eggs.LionCub += 1;
        if (!user.items.eggs.PandaCub) user.items.eggs.PandaCub = 0;
        user.items.eggs.PandaCub += 1;
        if (!user.items.eggs.TigerCub) user.items.eggs.TigerCub = 0;
        user.items.eggs.TigerCub += 1;
        if (!user.items.eggs.Wolf) user.items.eggs.Wolf = 0;
        user.items.eggs.Wolf += 1;
      },
    },
    115: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    120: {
      rewardKey: ['Pet_HatchingPotion_Base', 'Pet_HatchingPotion_Red', 'Pet_HatchingPotion_Golden'],
      reward: [api.hatchingPotions.Base, api.hatchingPotions.CottonCandyBlue, api.hatchingPotions.CottonCandyPink, api.hatchingPotions.Desert, api.hatchingPotions.Golden, api.hatchingPotions.Red, api.hatchingPotions.Shade, api.hatchingPotions.Skeleton, api.hatchingPotions.White, api.hatchingPotions.Zombie],
      rewardName: 'oneOfAllHatchingPotions',
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Base) user.items.hatchingPotions.Base = 0;
        user.items.hatchingPotions.Base += 1;
        if (!user.items.hatchingPotions.CottonCandyBlue) user.items.hatchingPotions.CottonCandyBlue = 0;
        user.items.hatchingPotions.CottonCandyBlue += 1;
        if (!user.items.hatchingPotions.CottonCandyPink) user.items.hatchingPotions.CottonCandyPink = 0;
        user.items.hatchingPotions.CottonCandyPink += 1;
        if (!user.items.hatchingPotions.Desert) user.items.hatchingPotions.Desert = 0;
        user.items.hatchingPotions.Desert += 1;
        if (!user.items.hatchingPotions.Golden) user.items.hatchingPotions.Golden = 0;
        user.items.hatchingPotions.Golden += 1;
        if (!user.items.hatchingPotions.Red) user.items.hatchingPotions.Red = 0;
        user.items.hatchingPotions.Red += 1;
        if (!user.items.hatchingPotions.Shade) user.items.hatchingPotions.Shade = 0;
        user.items.hatchingPotions.Shade += 1;
        if (!user.items.hatchingPotions.Skeleton) user.items.hatchingPotions.Skeleton = 0;
        user.items.hatchingPotions.Skeleton += 1;
        if (!user.items.hatchingPotions.White) user.items.hatchingPotions.White = 0;
        user.items.hatchingPotions.White += 1;
        if (!user.items.hatchingPotions.Zombie) user.items.hatchingPotions.Zombie = 0;
        user.items.hatchingPotions.Zombie += 1;
      },
    },
    125: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    130: {
      rewardKey: ['Pet_Food_Meat', 'Pet_Food_Potatoe', 'Pet_Food_Milk'],
      reward: [api.food.Meat, api.food.CottonCandyBlue, api.food.CottonCandyPink, api.food.Potatoe, api.food.Honey, api.food.Strawberry, api.food.Chocolate, api.food.Fish, api.food.Milk, api.food.RottenMeat],
      rewardName: 'threeOfEachFood',
      assignReward: function assignReward (user) {
        if (!user.items.food.Meat) user.items.food.Meat = 0;
        user.items.food.Meat += 3;
        if (!user.items.food.CottonCandyBlue) user.items.food.CottonCandyBlue = 0;
        user.items.food.CottonCandyBlue += 3;
        if (!user.items.food.CottonCandyPink) user.items.food.CottonCandyPink = 0;
        user.items.food.CottonCandyPink += 3;
        if (!user.items.food.Potatoe) user.items.food.Potatoe = 0;
        user.items.food.Potatoe += 3;
        if (!user.items.food.Honey) user.items.food.Honey = 0;
        user.items.food.Honey += 3;
        if (!user.items.food.Strawberry) user.items.food.Strawberry = 0;
        user.items.food.Strawberry += 3;
        if (!user.items.food.Chocolate) user.items.food.Chocolate = 0;
        user.items.food.Chocolate += 3;
        if (!user.items.food.Fish) user.items.food.Fish = 0;
        user.items.food.Fish += 3;
        if (!user.items.food.Milk) user.items.food.Milk = 0;
        user.items.food.Milk += 3;
        if (!user.items.food.RottenMeat) user.items.food.RottenMeat = 0;
        user.items.food.RottenMeat += 3;
      },
    },
    135: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    140: {
      rewardKey: ['shop_weapon_special_skeletonKey', 'shop_shield_special_lootBag'],
      reward: [api.gear.flat.weapon_special_skeletonKey, api.gear.flat.shield_special_lootBag],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_skeletonKey = true; // eslint-disable-line camelcase
        user.items.gear.owned.shield_special_lootBag = true; // eslint-disable-line camelcase
      },
    },
    145: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    150: {
      rewardKey: ['shop_head_special_clandestineCowl', 'shop_armor_special_sneakthiefRobes'],
      reward: [api.gear.flat.head_special_clandestineCowl, api.gear.flat.armor_special_sneakthiefRobes],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_clandestineCowl = true; // eslint-disable-line camelcase
        user.items.gear.owned.armor_special_sneakthiefRobes = true; // eslint-disable-line camelcase
      },
    },
    160: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    170: {
      rewardKey: ['shop_head_special_snowSovereignCrown', 'shop_armor_special_snowSovereignRobes'],
      reward: [api.gear.flat.head_special_snowSovereignCrown, api.gear.flat.armor_special_snowSovereignRobes],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_snowSovereignCrown = true; // eslint-disable-line camelcase
        user.items.gear.owned.armor_special_snowSovereignRobes = true; // eslint-disable-line camelcase
      },
    },
    180: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    190: {
      rewardKey: ['shop_shield_special_wintryMirror', 'shop_back_special_snowdriftVeil'],
      reward: [api.gear.flat.shield_special_wintryMirror, api.gear.flat.back_special_snowdriftVeil],
      assignReward: function assignReward (user) {
        user.items.gear.owned.shield_special_wintryMirror = true; // eslint-disable-line camelcase
        user.items.gear.owned.back_special_snowdriftVeil = true; // eslint-disable-line camelcase
      },
    },
    200: {
      rewardKey: ['Pet_HatchingPotion_RoyalPurple'],
      reward: [api.hatchingPotions.RoyalPurple],
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.RoyalPurple) user.items.hatchingPotions.RoyalPurple = 0;
        user.items.hatchingPotions.RoyalPurple += 1;
      },
    },
    220: {
      rewardKey: ['Pet_Food_Saddle'],
      reward: [api.food.Saddle],
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 1;
      },
    },
    240: {
      rewardKey: ['shop_weapon_special_nomadsScimitar', 'shop_armor_special_nomadsCuirass'],
      reward: [api.gear.flat.weapon_special_nomadsScimitar, api.gear.flat.armor_special_nomadsCuirass],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_nomadsScimitar = true; // eslint-disable-line camelcase
        user.items.gear.owned.armor_special_nomadsCuirass = true; // eslint-disable-line camelcase
      },
    },
    260: {
      rewardKey: ['shop_head_special_spikedHelm'],
      reward: [api.gear.flat.head_special_spikedHelm],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_spikedHelm = true; // eslint-disable-line camelcase
      },
    },
    280: {
      rewardKey: ['Pet_Food_Meat', 'Pet_Food_Potatoe', 'Pet_Food_Milk'],
      reward: [api.food.Meat, api.food.CottonCandyBlue, api.food.CottonCandyPink, api.food.Potatoe, api.food.Honey, api.food.Strawberry, api.food.Chocolate, api.food.Fish, api.food.Milk, api.food.RottenMeat],
      rewardName: 'threeOfEachFood',
      assignReward: function assignReward (user) {
        if (!user.items.food.Meat) user.items.food.Meat = 0;
        user.items.food.Meat += 3;
        if (!user.items.food.CottonCandyBlue) user.items.food.CottonCandyBlue = 0;
        user.items.food.CottonCandyBlue += 3;
        if (!user.items.food.CottonCandyPink) user.items.food.CottonCandyPink = 0;
        user.items.food.CottonCandyPink += 3;
        if (!user.items.food.Potatoe) user.items.food.Potatoe = 0;
        user.items.food.Potatoe += 3;
        if (!user.items.food.Honey) user.items.food.Honey = 0;
        user.items.food.Honey += 3;
        if (!user.items.food.Strawberry) user.items.food.Strawberry = 0;
        user.items.food.Strawberry += 3;
        if (!user.items.food.Chocolate) user.items.food.Chocolate = 0;
        user.items.food.Chocolate += 3;
        if (!user.items.food.Fish) user.items.food.Fish = 0;
        user.items.food.Fish += 3;
        if (!user.items.food.Milk) user.items.food.Milk = 0;
        user.items.food.Milk += 3;
        if (!user.items.food.RottenMeat) user.items.food.RottenMeat = 0;
        user.items.food.RottenMeat += 3;
      },
    },
    300: {
      rewardKey: ['Pet_Egg_Cactus', 'Pet_Egg_Dragon', 'Pet_Egg_Wolf'],
      reward: [api.eggs.BearCub, api.eggs.Cactus, api.eggs.Dragon, api.eggs.FlyingPig, api.eggs.Fox, api.eggs.LionCub, api.eggs.PandaCub, api.eggs.TigerCub, api.eggs.Wolf],
      rewardName: 'twoOfAllPetEggs',
      assignReward: function assignReward (user) {
        if (!user.items.eggs.BearCub) user.items.eggs.BearCub = 0;
        user.items.eggs.BearCub += 2;
        if (!user.items.eggs.Cactus) user.items.eggs.Cactus = 0;
        user.items.eggs.Cactus += 2;
        if (!user.items.eggs.Dragon) user.items.eggs.Dragon = 0;
        user.items.eggs.Dragon += 2;
        if (!user.items.eggs.FlyingPig) user.items.eggs.FlyingPig = 0;
        user.items.eggs.FlyingPig += 2;
        if (!user.items.eggs.Fox) user.items.eggs.Fox = 0;
        user.items.eggs.Fox += 2;
        if (!user.items.eggs.LionCub) user.items.eggs.LionCub = 0;
        user.items.eggs.LionCub += 2;
        if (!user.items.eggs.PandaCub) user.items.eggs.PandaCub = 0;
        user.items.eggs.PandaCub += 2;
        if (!user.items.eggs.TigerCub) user.items.eggs.TigerCub = 0;
        user.items.eggs.TigerCub += 2;
        if (!user.items.eggs.Wolf) user.items.eggs.Wolf = 0;
        user.items.eggs.Wolf += 2;
      },
    },
    320: {
      rewardKey: ['shop_head_special_dandyHat'],
      reward: [api.gear.flat.head_special_dandyHat],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_dandyHat = true; // eslint-disable-line camelcase
      },
    },
    340: {
      rewardKey: ['shop_weapon_special_fencingFoil', 'shop_armor_special_dandySuit'],
      reward: [api.gear.flat.weapon_special_fencingFoil, api.gear.flat.armor_special_dandySuit],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_fencingFoil = true; // eslint-disable-line camelcase
        user.items.gear.owned.armor_special_dandySuit = true; // eslint-disable-line camelcase
      },
    },
    360: {
      rewardKey: ['Pet_Food_Saddle'],
      reward: [api.food.Saddle],
      rewardName: 'twoSaddles',
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 2;
      },
    },
    380: {
      rewardKey: ['Pet_Egg_Cactus', 'Pet_Egg_Dragon', 'Pet_Egg_Wolf'],
      reward: [api.eggs.BearCub, api.eggs.Cactus, api.eggs.Dragon, api.eggs.FlyingPig, api.eggs.Fox, api.eggs.LionCub, api.eggs.PandaCub, api.eggs.TigerCub, api.eggs.Wolf],
      rewardName: 'threeOfAllPetEggs',
      assignReward: function assignReward (user) {
        if (!user.items.eggs.BearCub) user.items.eggs.BearCub = 0;
        user.items.eggs.BearCub += 3;
        if (!user.items.eggs.Cactus) user.items.eggs.Cactus = 0;
        user.items.eggs.Cactus += 3;
        if (!user.items.eggs.Dragon) user.items.eggs.Dragon = 0;
        user.items.eggs.Dragon += 3;
        if (!user.items.eggs.FlyingPig) user.items.eggs.FlyingPig = 0;
        user.items.eggs.FlyingPig += 3;
        if (!user.items.eggs.Fox) user.items.eggs.Fox = 0;
        user.items.eggs.Fox += 3;
        if (!user.items.eggs.LionCub) user.items.eggs.LionCub = 0;
        user.items.eggs.LionCub += 3;
        if (!user.items.eggs.PandaCub) user.items.eggs.PandaCub = 0;
        user.items.eggs.PandaCub += 3;
        if (!user.items.eggs.TigerCub) user.items.eggs.TigerCub = 0;
        user.items.eggs.TigerCub += 3;
        if (!user.items.eggs.Wolf) user.items.eggs.Wolf = 0;
        user.items.eggs.Wolf += 3;
      },
    },
    400: {
      rewardKey: ['Pet_Food_Meat', 'Pet_Food_Potatoe', 'Pet_Food_Milk'],
      reward: [api.food.Meat, api.food.CottonCandyBlue, api.food.CottonCandyPink, api.food.Potatoe, api.food.Honey, api.food.Strawberry, api.food.Chocolate, api.food.Fish, api.food.Milk, api.food.RottenMeat],
      rewardName: 'fourOfEachFood',
      assignReward: function assignReward (user) {
        if (!user.items.food.Meat) user.items.food.Meat = 0;
        user.items.food.Meat += 4;
        if (!user.items.food.CottonCandyBlue) user.items.food.CottonCandyBlue = 0;
        user.items.food.CottonCandyBlue += 4;
        if (!user.items.food.CottonCandyPink) user.items.food.CottonCandyPink = 0;
        user.items.food.CottonCandyPink += 4;
        if (!user.items.food.Potatoe) user.items.food.Potatoe = 0;
        user.items.food.Potatoe += 4;
        if (!user.items.food.Honey) user.items.food.Honey = 0;
        user.items.food.Honey += 4;
        if (!user.items.food.Strawberry) user.items.food.Strawberry = 0;
        user.items.food.Strawberry += 4;
        if (!user.items.food.Chocolate) user.items.food.Chocolate = 0;
        user.items.food.Chocolate += 4;
        if (!user.items.food.Fish) user.items.food.Fish = 0;
        user.items.food.Fish += 4;
        if (!user.items.food.Milk) user.items.food.Milk = 0;
        user.items.food.Milk += 4;
        if (!user.items.food.RottenMeat) user.items.food.RottenMeat = 0;
        user.items.food.RottenMeat += 4;
      },
    },
    425: {
      rewardKey: ['Pet_Food_Saddle'],
      reward: [api.food.Saddle],
      rewardName: 'threeSaddles',
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 3;
      },
    },
    450: {
      rewardKey: ['shop_weapon_special_tachi', 'shop_armor_special_samuraiArmor'],
      reward: [api.gear.flat.weapon_special_tachi, api.gear.flat.armor_special_samuraiArmor],
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_tachi = true; // eslint-disable-line camelcase
        user.items.gear.owned.armor_special_samuraiArmor = true; // eslint-disable-line camelcase
      },
    },
    475: {
      rewardKey: ['shop_head_special_kabuto', 'shop_shield_special_wakizashi'],
      reward: [api.gear.flat.head_special_kabuto, api.gear.flat.shield_special_wakizashi],
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_kabuto = true; // eslint-disable-line camelcase
        user.items.gear.owned.shield_special_wakizashi = true; // eslint-disable-line camelcase
      },
    },
    500: {
      rewardKey: ['achievement-royally-loyal2x'],
      reward: [api.achievements.royallyLoyal],
      rewardName: 'incentiveAchievement',
      assignReward: function assignReward (user) {
        user.achievements.royallyLoyal = true; // eslint-disable-line camelcase
      },
    },
  };
  // When the final check-in prize is added here, change checkinReceivedAllRewardsMessage in website/common/locales/en/loginIncentives.json
  // to say "You have received the final Check-In prize!". Confirm the message with Lemoness first.

  // Add reference link to next reward and add filler days so we have a map to reference the next reward from any day
  // We could also, use a list, but then we would be cloning each of the rewards.
  // Create a new array if we want the loginIncentives to be immutable in the future
  let nextRewardKey;
  range(MAX_INCENTIVES + 1).reverse().forEach(function addNextRewardLink (index) {
    if (loginIncentives[index] && loginIncentives[index].rewardKey) {
      loginIncentives[index].nextRewardAt = nextRewardKey;
      nextRewardKey = index;
      return;
    }

    loginIncentives[index] = {
      reward: undefined,
      nextRewardAt: nextRewardKey,
    };
  });

  let prevRewardKey;
  range(MAX_INCENTIVES + 1).forEach(function addPrevRewardLink (index) {
    loginIncentives[index].prevRewardKey = prevRewardKey;
    if (loginIncentives[index].rewardKey) prevRewardKey = index;
  });

  return loginIncentives;
};
