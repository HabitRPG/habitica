import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',

// hatching potions and food names should be capitalized lest you break the market
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.spring2024.start, EVENTS.spring2024.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Celestial',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Shimmer',
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
        path: 'food.Fish',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Skeleton',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
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
  seasonal: 'spring2019CloudRogueSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
