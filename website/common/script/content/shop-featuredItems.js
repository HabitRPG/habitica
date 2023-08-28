import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.potions202308.start, EVENTS.potions202308.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Thunderstorm',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Porcelain',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotions.Zombie',
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
        path: 'food.Meat',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Zombie',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202308.start, EVENTS.bundle202308.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.hugabug',
        },
        {
          type: 'quests',
          path: 'quests.octopus',
        },
        {
          type: 'quests',
          path: 'quests.rock',
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
