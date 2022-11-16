import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.bundle202211.start, EVENTS.bundle202211.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Frost',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Ember',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Thunderstorm',
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
  seasonal: 'spring2021Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
