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
      path: 'hatchingPotions.Red',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Fairy',
    },
    {
      type: 'card',
      path: 'cardTypes.goodluck',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.squirrel',
    },
    {
      type: 'quests',
      path: 'quests.taskwoodsTerror1',
    },
    {
      type: 'quests',
      path: 'quests.butterfly',
    },
  ],
  seasonal: '',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
