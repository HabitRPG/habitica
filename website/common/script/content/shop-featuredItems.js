import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2020-12-02')) {
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
          path: 'premiumHatchingPotions.Frost',
        },
        {
          type: 'food',
          path: 'food.Chocolate',
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
        path: 'eggs.Cactus',
      },
      {
        type: 'food',
        path: 'food.Honey',
      },
    ];
  },
  quests () {
    if (moment().isBefore('2020-11-02')) {
      return [
        {
          type: 'bundles',
          path: 'bundles.sandySidekicks',
        },
        {
          type: 'quests',
          path: 'quests.taskwoodsTerror1',
        },
        {
          type: 'quests',
          path: 'quests.ruby',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.gryphon',
      },
      {
        type: 'quests',
        path: 'quests.hedgehog',
      },
      {
        type: 'quests',
        path: 'quests.rat',
      },
    ];
  },
  seasonal: 'fall2019Mage',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
