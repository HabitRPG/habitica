import moment from 'moment';

// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBetween('2019-11-01', '2019-12-02')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Ember',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Thunderstorm',
        },
        {
          type: 'food',
          path: 'food.Saddle',
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
        path: 'hatchingPotions.Skeleton',
      },
      {
        type: 'eggs',
        path: 'eggs.Fox',
      },
      {
        type: 'food',
        path: 'food.Saddle',
      },
    ];
  },
  quests: [
    {
      type: 'quests',
      path: 'quests.badger',
    },
    {
      type: 'quests',
      path: 'quests.taskwoodsTerror1',
    },
    {
      type: 'quests',
      path: 'quests.amber',
    },
  ],
  seasonal: 'fall2018Rogue',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
