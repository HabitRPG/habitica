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
        path: 'food.Potatoe',
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
