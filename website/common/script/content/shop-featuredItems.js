import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2021-07-31T20:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Sunset',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Glass',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.SandSculpture',
        },
      ];
    }
    return [
      {
        type: 'armoire',
        path: 'armoire',
      },
      {
        type: 'food',
        path: 'food.Honey',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Zombie',
      },
      {
        type: 'eggs',
        path: 'eggs.PandaCub',
      },
    ];
  },
  quests () {
    return [
      {
        type: 'quests',
        path: 'quests.sloth',
      },
      {
        type: 'quests',
        path: 'quests.slime',
      },
      {
        type: 'quests',
        path: 'quests.taskwoodsTerror1',
      },
    ];
  },
  seasonal: 'summer2020Healer',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
