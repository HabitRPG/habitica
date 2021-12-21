import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2022-01-31T20:00-05:00')) {
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
          path: 'premiumHatchingPotions.Holly',
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
    if (moment().isBefore('2022-01-11T08:00-05:00')) {
      return [
        {
          type: 'quests',
          path: 'quests.evilsanta',
        },
        {
          type: 'quests',
          path: 'quests.evilsanta2',
        },
        {
          type: 'quests',
          path: 'quests.penguin',
        },
      ];
    }
    if (moment().isBefore('2022-01-31T20:00-05:00')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.winterQuests',
        },
        {
          type: 'quests',
          path: 'quests.silver',
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
        path: 'quests.ferret',
      },
      {
        type: 'quests',
        path: 'quests.bronze',
      },
      {
        type: 'quests',
        path: 'quests.basilist',
      },
    ];
  },
  seasonal: 'winter2021Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
