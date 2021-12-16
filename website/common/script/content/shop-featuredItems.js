// import moment from 'moment';
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
        path: 'quests.onyx',
      },
      {
        type: 'quests',
        path: 'quests.butterfly',
      },
    ];
  },
  seasonal: 'summer2020Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
