import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',

// hatching potions and food names should be capitalized lest you break the market
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.february2024.start, EVENTS.february2024.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.RoseGold',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Cupid',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotion.Red',
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
        path: 'food.Chocolate',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Desert',
      },
      {
        type: 'eggs',
        path: 'eggs.Cactus',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202402.start, EVENTS.bundle202402.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.mythicalMarvels',
        },
        {
          type: 'quests',
          path: 'quests.Nudibranch',
        },
        {
          type: 'quests',
          path: 'quests.Axolotl',
        },
      ];
    }

    return [
      {
        type: 'quests',
        path: 'quests.Rat',
      },
      {
        type: 'quests',
        path: 'quests.Cuttlefish',
      },
      {
        type: 'quests',
        path: 'quests.Axolotl',
      },
    ];
  },
  seasonal: 'winter2021WinterMoonMageSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
