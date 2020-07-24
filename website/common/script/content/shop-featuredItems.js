// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    return [
      {
        type: 'armoire',
        path: 'armoire',
      },
      {
        type: 'premiumHatchingPotion',
        path: 'premiumHatchingPotions.SandSculpture',
      },
      {
        type: 'eggs',
        path: 'eggs.Dragon',
      },
      {
        type: 'food',
        path: 'food.Chocolate',
      },
    ];
  },
  quests () {
    return [
      {
        type: 'bundles',
        path: 'bundles.aquaticAmigos',
      },
      {
        type: 'quests',
        path: 'quests.peacock',
      },
      {
        type: 'quests',
        path: 'quests.fluorite',
      },
    ];
  },
  seasonal: 'summer2019Warrior',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
