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
      path: 'premiumHatchingPotions.Glow',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Spooky',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Shadow',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.bronze',
    },
    {
      type: 'quests',
      path: 'quests.taskwoodsTerror1',
    },
    {
      type: 'quests',
      path: 'quests.silver',
    },
  ],
  seasonal: 'fall2018Rogue',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
