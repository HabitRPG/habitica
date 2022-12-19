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
    if (moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2023.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.winterQuests',
        },
        {
          type: 'quests',
          path: 'quests.whale',
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
