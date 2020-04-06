import moment from 'moment';

// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2020-05-02')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.BirchBark',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Shimmer',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Celestial',
        },
        {
          type: 'hatchingPotions',
          path: 'hatchingPotions.Veggie',
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
    if (moment().isBefore('2020-05-02')) {
      return [
        {
          type: 'quests',
          path: 'quests.waffle',
        },
        {
          type: 'quests',
          path: 'quests.trex_undead',
        },
        {
          type: 'quests',
          path: 'quests.bunny',
        },
      ];
    }
    return [
      {
        type: 'quests',
        path: 'quests.sheep',
      },
      {
        type: 'quests',
        path: 'quests.seaserpent',
      },
      {
        type: 'quests',
        path: 'quests.silver',
      },
    ];
  },
  seasonal: 'spring2019Rogue',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
