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
      path: 'hatchingPotions.CottonCandyPink',
    },
    {
      type: 'eggs',
      path: 'eggs.TigerCub',
    },
    {
      type: 'card',
      path: 'cardTypes.birthday',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.treeling',
    },
    {
      type: 'quests',
      path: 'quests.sabretooth',
    },
    {
      type: 'quests',
      path: 'quests.rock',
    },
  ],
  seasonal: '',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
