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
    return [
      {
        type: 'quests',
        path: 'quests.rock',
      },
      {
        type: 'quests',
        path: 'quests.peacock',
      },
      {
        type: 'quests',
        path: 'quests.fluorite',
      },
    ];
  },
  seasonal: 'spring2019Rogue',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
