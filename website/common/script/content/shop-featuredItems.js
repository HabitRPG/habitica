import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.potions202302.start, EVENTS.potions202302.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.RoseQuartz',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Cupid',
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
        path: 'food.RottenMeat',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.CottonCandyBlue',
      },
      {
        type: 'eggs',
        path: 'eggs.FlyingPig',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202302.start, EVENTS.bundle202302.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.mythicalMarvels',
        },
        {
          type: 'quests',
          path: 'quests.treeling',
        },
        {
          type: 'quests',
          path: 'quests.rock',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.slime',
      },
      {
        type: 'quests',
        path: 'quests.seaserpent',
      },
      {
        type: 'quests',
        path: 'quests.unicorn',
      },
    ];
  },
  seasonal: 'winter2022Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
