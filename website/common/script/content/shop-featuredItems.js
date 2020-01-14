import moment from 'moment';

// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween('2019-12-19', '2020-01-02')) {
      return [
        {
          type: 'card',
          path: 'cardTypes.nye',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Aurora',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Holly',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.StarryNight',
        },
      ];
    }
    if (moment().isBetween('2019-12-19', '2020-02-02')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Aurora',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Holly',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.StarryNight',
        },
      ];
    }
    return [
      {
        type: 'armoire',
        path: 'armoire',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.White',
      },
      {
        type: 'eggs',
        path: 'eggs.PandaCub',
      },
      {
        type: 'food',
        path: 'food.Saddle',
      },
    ];
  },
  quests () {
    if (moment().isBetween('2019-12-19', '2020-02-02')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.winterQuests',
        },
        {
          type: 'quests',
          path: 'quests.evilsanta',
        },
        {
          type: 'quests',
          path: 'quests.evilsanta2',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.treeling',
      },
      {
        type: 'quests',
        path: 'quests.stoikalmCalamity1',
      },
      {
        type: 'quests',
        path: 'quests.silver',
      },
    ];
  },
  seasonal: 'winter2019Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
