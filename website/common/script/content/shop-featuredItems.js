import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2023.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.StarryNight',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Holly',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Aurora',
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
        path: 'food.Milk',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.White',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202211.start, EVENTS.bundle202211.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.rockingReptiles',
        },
        {
          type: 'quests',
          path: 'quests.peacock',
        },
        {
          type: 'quests',
          path: 'quests.harpy',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.axolotl',
      },
      {
        type: 'quests',
        path: 'quests.stone',
      },
      {
        type: 'quests',
        path: 'quests.whale',
      },
    ];
  },
  seasonal: 'winter2022Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
