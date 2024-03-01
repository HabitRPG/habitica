import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',

// hatching potions and food names should be capitalized lest you break the market
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.potions202402.start, EVENTS.potions202402.end)) {
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
          path: 'hatchingPotions.Red',
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
    if (moment().isBetween(EVENTS.bundle202403.start, EVENTS.bundle202403.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.cuddleBuddies',
        },
        {
          type: 'quests',
          path: 'quests.hedgehog',
        },
        {
          type: 'quests',
          path: 'quests.sheep',
        },
      ];
    }

    return [
      {
        type: 'quests',
        path: 'quests.rat',
      },
      {
        type: 'quests',
        path: 'quests.kraken',
      },
      {
        type: 'quests',
        path: 'quests.slime',
      },
    ];
  },
  seasonal: 'winter2021WinterMoonMageSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
