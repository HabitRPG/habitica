import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2022-02-28T20:00-05:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Cupid',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.RoseQuartz',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotions.CottonCandyPink',
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
        path: 'food.Honey',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.CottonCandyPink',
      },
      {
        type: 'eggs',
        path: 'eggs.Cactus',
      },
    ];
  },
  quests () {
    if (moment().isBefore('2022-02-28T20:00-05:00')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.mythicalMarvels',
        },
        {
          type: 'quests',
          path: 'quests.onyx',
        },
        {
          type: 'quests',
          path: 'quests.dolphin',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.snake',
      },
      {
        type: 'quests',
        path: 'quests.turquoise',
      },
      {
        type: 'quests',
        path: 'quests.basilist',
      },
    ];
  },
  seasonal: 'spring2021Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
