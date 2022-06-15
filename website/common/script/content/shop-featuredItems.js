import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore(EVENTS.summer2022.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Sunset',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Watery',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Aquatic',
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
    if (moment().isBefore(EVENTS.bundle202206.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.aquaticAmigos',
        },
        {
          type: 'quests',
          path: 'quests.seaserpent',
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
        path: 'quests.badger',
      },
      {
        type: 'quests',
        path: 'quests.onyx',
      },
      {
        type: 'quests',
        path: 'quests.rooster',
      },
    ];
  },
  seasonal: 'spring2021Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
