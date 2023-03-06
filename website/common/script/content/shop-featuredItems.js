import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.spring2023.start, EVENTS.spring2023.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.PolkaDot',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.BirchBark',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Rainbow',
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
  quests () { // start date is 3/28
    if (moment().isBetween(EVENTS.bundle202303.start, EVENTS.bundle202303.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.jungleBuddies',
        },
        {
          type: 'quests',
          path: 'quests.cuttlefish',
        },
        {
          type: 'quests',
          path: 'quests.nudibranch',
        },
      ];
    }
    if (moment().isBetween(EVENTS.eggHunt2023.start, EVENTS.eggHunt2023.end)) {
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
        path: 'quests.cuttlefish',
      },
      {
        type: 'quests',
        path: 'quests.nudibranch',
      },
    ];
  },
  seasonal: 'spring2022Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
