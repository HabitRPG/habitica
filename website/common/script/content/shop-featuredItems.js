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
