import moment from 'moment';
import { EVENTS } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween(EVENTS.potions202311.start, EVENTS.potions202311.end)) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.AutumnLeaf',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Ember',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Frost',
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
    if (moment().isBetween(EVENTS.bundle202311.start, EVENTS.bundle202311.end)) {
      return [
        {
          type: 'bundles',
          path: 'bundles.oddballs',
        },
        {
          type: 'quests',
          path: 'quests.gryphon',
        },
        {
          type: 'quests',
          path: 'quests.armadillo',
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
