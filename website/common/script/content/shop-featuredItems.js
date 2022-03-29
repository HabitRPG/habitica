import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore(EVENTS.spring2022.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Shimmer',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Celestial',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.PolkaDot',
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
        path: 'hatchingPotions.CottonCandyPink',
      },
      {
        type: 'eggs',
        path: 'eggs.Cactus',
      },
    ];
  },
  quests () {
    if (moment().isBefore('2022-03-31T20:00-04:00')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.cuddleBuddies',
        },
        {
          type: 'quests',
          path: 'quests.egg',
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
        path: 'quests.ferret',
      },
      {
        type: 'quests',
        path: 'quests.silver',
      },
      {
        type: 'quests',
        path: 'quests.basilist',
      },
    ];
  },
  seasonal: 'spring2021Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
