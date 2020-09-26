import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2020-11-02')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Vampire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Ghost',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Shadow',
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
        path: 'hatchingPotions.Red',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
      },
      {
        type: 'food',
        path: 'food.potatoe',
      },
    ];
  },
  quests () {
    return [
      {
        type: 'quests',
        path: 'quests.squirrel',
      },
      {
        type: 'quests',
        path: 'quests.cow',
      },
      {
        type: 'quests',
        path: 'quests.turquoise',
      },
    ];
  },
  seasonal: 'fall2019Mage',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
