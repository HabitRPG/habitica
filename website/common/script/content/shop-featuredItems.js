import moment from 'moment';

// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2020-03-02')) {
      return [
        {
          type: 'card',
          path: 'cardTypes.valentine',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Cupid',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.RoseQuartz',
        },
        {
          type: 'eggs',
          path: 'eggs.Fox',
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
        path: 'hatchingPotions.Golden',
      },
      {
        type: 'eggs',
        path: 'eggs.Wolf',
      },
      {
        type: 'food',
        path: 'food.Saddle',
      },
    ];
  },
  quests () {
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
        path: 'quests.ruby',
      },
    ];
  },
  seasonal: 'winter2019Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
