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
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Frost',
    },
    {
      type: 'eggs',
      path: 'eggs.Wolf',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Thunderstorm',
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
