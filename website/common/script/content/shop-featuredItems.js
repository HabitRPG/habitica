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
      path: 'hatchingPotions.Desert',
    },
    {
      type: 'food',
      path: 'food.Fish',
    },
    {
      type: 'card',
      path: 'cardTypes.congrats',
    },
  ],
  quests: [
    {
      type: 'quests',
      path: 'quests.dilatory_derby',
    },
    {
      type: 'quests',
      path: 'quests.dilatoryDistress1',
    },
    {
      type: 'quests',
      path: 'quests.whale',
    },
  ],
  seasonal: 'summerRogue',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
