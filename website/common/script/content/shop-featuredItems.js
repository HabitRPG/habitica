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
      path: 'premiumHatchingPotions.Ghost',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.Glow',
    },
    {
      type: 'card',
      path: 'cardTypes.getwell',
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
