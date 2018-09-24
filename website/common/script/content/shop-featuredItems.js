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
      type: 'eggs',
      path: 'eggs.Dragon',
    },
    {
      type: 'card',
      path: 'cardTypes.congrats',
    },
  ],
  quests: [
    {
      type: 'bundles',
      path: 'bundles.forestFriends',
    },
    {
      type: 'quests',
      path: 'quests.dilatoryDistress1',
    },
    {
      type: 'quests',
      path: 'quests.kangaroo',
    },
  ],
  seasonal: '',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
