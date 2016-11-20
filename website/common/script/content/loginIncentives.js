import _ from 'lodash';

module.exports = function getLoginIncentives (api) {
  let loginIncentives = {
    1: {
      rewardKey: 'armor_special_bardRobes',
      reward: api.gear.flat.armor_special_bardRobes,
      assignReward: function assignReward (user) {
        user.items.gear.owned.armor_special_bardRobes = true; // eslint-disable-line camelcase
      },
    },
    2: {
      rewardKey: 'incentiveBackgrounds',
      reward: api.backgrounds.incentiveBackgrounds,
      assignReward: function assignReward (user) {
        user.purchased.background.incentiveBackgrounds = true;
      },
    },
    3: {
      rewardKey: 'head_special_bardHat',
      reward: api.gear.flat.head_special_bardHat,
      assignReward: function assignReward (user) {
        user.items.gear.owned.head_special_bardHat = true; // eslint-disable-line camelcase
      },
    },
    4: {
      rewardKey: 'Purple',
      reward: api.hatchingPotions.Purple,
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Purple) user.items.hatchingPotions.Purple = 0;
        user.items.hatchingPotions.Purple += 1;
      },
    },
    5: {
      rewardKey: 'balance',
      reward: api.balance,
      assignReward: function assignReward (user) {
        user.balance += 4 * 5;
      },
    },
    7: {
      rewardKey: 'moon1',
      reward: api.quests.moon1,
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon1) user.items.quests.moon1 = 0;
        user.items.quests.moon1 += 1;
      },
    },
    10: {
      rewardKey: 'Purple',
      reward: api.hatchingPotions.Purple,
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Purple) user.items.hatchingPotions.Purple = 0;
        user.items.hatchingPotions.Purple += 1;
      },
    },
    14: {
      rewardKey: 'balance',
      reward: '',
      assignReward: function assignReward (user) {
        user.balance += 4 * 3;
      },
    },
    18: {
      rewardKey: 'head_special_bardHat',
      reward: api.gear.flat.head_special_bardHat,
      assignReward: function assignReward (user) {
        user.items.gear.owned.weapon_special_bardInstrument = true; // eslint-disable-line camelcase
      },
    },
    22: {
      rewardKey: 'moon2',
      reward: api.quests.moon2,
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon2) user.items.quests.moon2 = 0;
        user.items.quests.moon2 += 1;
      },
    },
    26: {
      rewardKey: 'Purple',
      reward: api.hatchingPotions.Purple,
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Purple) user.items.hatchingPotions.Purple = 0;
        user.items.hatchingPotions.Purple += 1;
      },
    },
    30: {
      rewardKey: 'balance',
      reward: '',
      assignReward: function assignReward (user) {
        user.balance += 4 * 3;
      },
    },
    35: {
      rewardKey: 'Purple',
      reward: api.hatchingPotions.Purple,
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Purple) user.items.hatchingPotions.Purple = 0;
        user.items.hatchingPotions.Purple += 1;
      },
    },
    40: {
      rewardKey: 'moon3',
      reward: api.quests.moon3,
      assignReward: function assignReward (user) {
        if (!user.items.quests.moon3) user.items.quests.moon3 = 0;
        user.items.quests.moon3 += 1;
      },
    },
    45: {
      rewardKey: 'Purple',
      reward: api.hatchingPotions.Purple,
      assignReward: function assignReward (user) {
        if (!user.items.hatchingPotions.Purple) user.items.hatchingPotions.Purple = 0;
        user.items.hatchingPotions.Purple += 1;
      },
    },
    50: {
      rewardKey: 'Saddle',
      reward: api.food.Saddle,
      assignReward: function assignReward (user) {
        if (!user.items.food.Saddle) user.items.food.Saddle = 0;
        user.items.food.Saddle += 1;
        user.balance += 4 * 5;
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
