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
      path: 'hatchingPotions.Golden',
    },
    {
      type: 'eggs',
      path: 'eggs.PandaCub',
    },
    {
      type: 'card',
      path: 'cardTypes.goodluck',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.treeling',
    },
    {
      type: 'quests',
      path: 'quests.egg',
    },
    {
      type: 'quests',
      path: 'quests.rock',
    },
  ],
  seasonal: 'spring2018Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
