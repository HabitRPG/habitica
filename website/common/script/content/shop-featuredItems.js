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
      path: 'eggs.LionCub',
    },
    {
      type: 'hatchingPotions',
      path: 'hatchingPotions.Desert',
    },
    {
      type: 'food',
      path: 'food.Potatoe',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.bronze',
    },
    {
      type: 'bundles',
      path: 'bundles.farmFriends',
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
