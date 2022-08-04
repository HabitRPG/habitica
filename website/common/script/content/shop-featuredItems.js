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
        path: 'eggs.BearCub',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202208.start, EVENTS.bundle202208.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.forestFriends',
        },
        {
          type: 'quests',
          path: 'quests.owl',
        },
        {
          type: 'quests',
          path: 'quests.snail',
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
