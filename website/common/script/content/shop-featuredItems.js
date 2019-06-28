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
      path: 'eggs.BearCub',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Glass',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Watery',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.bronze',
    },
    {
      type: 'quests',
      path: 'quests.yarn',
    },
    {
      type: 'quests',
      path: 'quests.dolphin',
    },
  ],
  seasonal: 'summer2019Mage',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
