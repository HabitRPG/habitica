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
        path: 'hatchingPotions.Shade',
      },
      {
        type: 'eggs',
        path: 'eggs.TigerCub',
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
        path: 'quests.snail',
      },
      {
        type: 'quests',
        path: 'quests.alligator',
      },
      {
        type: 'quests',
        path: 'quests.fluorite',
      },
    ];
  },
  seasonal: 'summer2019Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
