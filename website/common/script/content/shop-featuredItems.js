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
          type: 'hatchingPotions',
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
    if (moment().isBetween(EVENTS.fall.start, EVENTS.fall2023.end)) {
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
    if (moment().isBetween('2023-03-28T08:00-05:00', EVENTS.spring2023.end)) {
      return [
        {
          type: 'quests',
          path: 'quests.egg',
        },
        {
          type: 'quests',
          path: 'quests.yarn',
        },
        {
          type: 'quests',
          path: 'quests.ghost_stag',
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
  seasonal: 'summer2022MantaRayMageSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
