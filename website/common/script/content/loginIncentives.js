import _ from 'lodash';

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
      rewardKey: ['background_blue'],
      reward: [api.backgrounds.incentiveBackgrounds],
      assignReward: function assignReward (user) {
        user.purchased.background.incentiveBackgrounds = true;
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
      rewardKey: ['Pet_Food_Strawberry', 'Pet_Food_Patatoe', 'Pet_Food_CottonCandyBlue'],
      reward: [api.food.Strawberry, api.food.Patatoe, api.food.CottonCandyBlue],
      assignReward: function assignReward (user) {
        if (!user.items.food.Strawberry) user.items.food.Strawberry = 0;
        user.items.food.Strawberry += 1;
        if (!user.items.food.Patatoe) user.items.food.Patatoe = 0;
        user.items.food.Patatoe += 1;
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
  };

  // Add refence link to next reward and add filler days so we have a map to refernce the next reward from any day
  // We could also, use a list, but then we would be cloning each of the rewards.
  // Create a new array if we want the loginIncentives to be immutable in the future
  let nextRewardKey;
  _.range(51).reverse().forEach(function addNextRewardLink (index) {
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
  _.range(51).forEach(function addPrevRewardLink (index) {
    loginIncentives[index].prevRewardKey = prevRewardKey;
    if (loginIncentives[index].rewardKey) prevRewardKey = index;
  });

  return loginIncentives;
};
