import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.potions202312.start, EVENTS.potions202312.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.StainedGlass',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Peppermint',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.IcySnow',
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
        path: 'hatchingPotions.Golden',
      },
      {
        type: 'eggs',
        path: 'eggs.BearCub',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2024.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.winterQuests',
        },
        {
          type: 'quests',
          path: 'quests.Deer',
        },
        {
          type: 'quests',
          path: 'quests.Penguin',
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
        path: 'quests.axolotl',
      },
    ];
  },
  seasonal: 'winter2021WinterMoonMageSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
