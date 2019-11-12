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
      path: 'premiumHatchingPotions.Ember',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Thunderstorm',
    },
    {
      type: 'food',
      path: 'food.Saddle',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.sloth',
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
