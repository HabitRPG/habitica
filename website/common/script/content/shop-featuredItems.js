import moment from 'moment';
// import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2022-05-31T20:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Sunshine',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Floral',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotions.Golden',
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
    if (moment().isBefore('2022-05-31T20:00-04:00')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.delightfulDinos',
        },
        {
          type: 'quests',
          path: 'quests.alligator',
        },
        {
          type: 'quests',
          path: 'quests.turtle',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.ferret',
      },
      {
        type: 'quests',
        path: 'quests.silver',
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
