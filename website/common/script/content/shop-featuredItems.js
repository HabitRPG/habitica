import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2021-10-31T20:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Glow',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Spooky',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Vampire',
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
        path: 'food.Chocolate',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Shade',
      },
      {
        type: 'eggs',
        path: 'eggs.BearCub',
      },
    ];
  },
  quests () {
    return [
      {
        type: 'quests',
        path: 'quests.slime',
      },
      {
        type: 'quests',
        path: 'quests.horse',
      },
      {
        type: 'bundles',
        path: 'bundles.birdBuddies',
      },
    ];
  },
  seasonal: 'summer2020Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
