import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.fall2022.start, EVENTS.fall2022.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Vampire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Ghost',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Shadow',
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
        path: 'food.Potatoe',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Desert',
      },
      {
        type: 'eggs',
        path: 'eggs.Dragon',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202208.start, EVENTS.bundle202209.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.forestFriends',
        },
        {
          type: 'bundles',
          path: 'bundles.farmFriends',
        },
        {
          type: 'quests',
          path: 'quests.ferret',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.guineapig',
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
