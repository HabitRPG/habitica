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
      type: 'eggs',
      path: 'eggs.Dragon',
    },
    {
      type: 'hatchingPotions',
      path: 'hatchingPotions.Red',
    },
    {
      type: 'card',
      path: 'cardTypes.congrats',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.bronze',
    },
    {
      type: 'quests',
      path: 'quests.rat',
    },
    {
      type: 'quests',
      path: 'quests.horse',
    },
  ],
  seasonal: 'spring2018Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
