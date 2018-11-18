// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market: [
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
      path: 'eggs.Wolf',
    },
    {
      type: 'card',
      path: 'cardTypes.getwell',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.alligator',
    },
    {
      type: 'quests',
      path: 'quests.taskwoodsTerror1',
    },
    {
      type: 'bundles',
      path: 'bundles.oddballs',
    },
  ],
  seasonal: '',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
