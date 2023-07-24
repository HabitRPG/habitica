import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.summer2023.start, EVENTS.summer2023.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Sunset',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Glass',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.SandSculpture',
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
        path: 'eggs.Dragon',
      },
    ];
  },
  quests () {
    if (moment().isBetween(EVENTS.bundle202306.start, EVENTS.bundle202306.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.splashyPals',
        },
        {
          type: 'quests',
          path: 'quests.harpy',
        },
        {
          type: 'quests',
          path: 'quests.owl',
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
        path: 'quests.nudibranch',
      },
    ];
  },
  seasonal: 'summer2022MantaRayMageSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
