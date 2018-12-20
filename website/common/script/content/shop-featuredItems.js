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
      path: 'premiumHatchingPotions.Peppermint',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.IcySnow',
    },
    {
      type: 'premiumHatchingPotion',
      path: 'premiumHatchingPotions.StarryNight',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.evilsanta',
    },
    {
      type: 'quests',
      path: 'quests.evilsanta2',
    },
    {
      type: 'bundles',
      path: 'bundles.birdBuddies',
    },
  ],
  seasonal: '',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
