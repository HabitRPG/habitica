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
      path: 'premiumHatchingPotions.Shimmer',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Rainbow',
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
      path: 'quests.egg',
    },
    {
      type: 'quests',
      path: 'quests.bunny',
    },
  ],
  seasonal: 'springHealer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
