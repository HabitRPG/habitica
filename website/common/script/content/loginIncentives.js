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
      assignReward: function assignReward (user) {
        user.purchased.background.blue = true;
        user.purchased.background.green = true;
        user.purchased.background.purple = true;
        user.purchased.background.red = true;
        user.purchased.background.yellow = true;
        user.markModified('purchased.background');
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
      rewardKey: ['Pet_HatchingPotion_Purple'],
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
  };

  let rangeMaxIncentivesPlusOne = range(MAX_INCENTIVES + 1);
  // Add refence link to next reward and add filler days so we have a map to refernce the next reward from any day
  // We could also, use a list, but then we would be cloning each of the rewards.
  // Create a new array if we want the loginIncentives to be immutable in the future
  let nextRewardKey;
  rangeMaxIncentivesPlusOne.reverse().forEach(function addNextRewardLink (index) {
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
  rangeMaxIncentivesPlusOne.forEach(function addPrevRewardLink (index) {
    loginIncentives[index].prevRewardKey = prevRewardKey;
    if (loginIncentives[index].rewardKey) prevRewardKey = index;
  });

  return loginIncentives;
};
