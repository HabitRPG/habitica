import moment from 'moment';

// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
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
    if (moment().isBefore('2020-04-02')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.hugabug',
        },
        {
          type: 'quests',
          path: 'quests.velociraptor',
        },
        {
          type: 'quests',
          path: 'quests.taskwoodsTerror1',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.badger',
      },
      {
        type: 'quests',
        path: 'quests.ferret',
      },
      {
        type: 'quests',
        path: 'quests.sloth',
      },
    ];
  },
  seasonal: 'winter2019Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
