import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2020-12-22T08:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotions.White',
        },
        {
          type: 'eggs',
          path: 'eggs.Cactus',
        },
        {
          type: 'food',
          path: 'food.Honey',
        },
      ];
    }
    if (moment().isBefore('2021-01-31T20:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.StainedGlass',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Aurora',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.IcySnow',
        },
      ];
    }
    return [
      {
        type: 'armoire',
        path: 'armoire',
      },
      {
        type: 'food',
        path: 'food.Saddle',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Golden',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
      },
    ];
  },
  quests () {
    if (moment().isBefore('2020-12-17T08:00-04:00')) {
      return [
        {
          type: 'quests',
          path: 'quests.gryphon',
        },
        {
          type: 'quests',
          path: 'quests.hedgehog',
        },
        {
          type: 'quests',
          path: 'quests.rat',
        },
      ];
    }
    if (moment().isBefore('2021-01-31T20:00-04:00')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.winterQuests',
        },
        {
          type: 'quests',
          path: 'quests.spider',
        },
        {
          type: 'quests',
          path: 'quests.silver',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.ghost_stag',
      },
      {
        type: 'quests',
        path: 'quests.unicorn',
      },
      {
        type: 'quests',
        path: 'quests.falcon',
      },
    ];
  },
  seasonal: 'fall2019Mage',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
