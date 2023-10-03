import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.fall2023.start, EVENTS.fall2023.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Glow',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Spooky',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Vampire',
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
        path: 'hatchingPotions.Zombie',
      },
      {
        type: 'eggs',
        path: 'eggs.Cactus',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202310.start, EVENTS.bundle202310.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.sandySidekicks',
        },
        {
          type: 'quests',
          path: 'quests.beetle',
        },
        {
          type: 'quests',
          path: 'quests.frog',
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
  seasonal: 'fall2017TrickOrTreatSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
