import moment from 'moment';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',
const featuredItems = {
  market () {
    if (moment().isBefore('2021-08-31T20:00-04:00')) {
      return [
        {
          type: 'armoire',
          path: 'armoire',
        },
        {
          type: 'food',
          path: 'food.Saddle',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Thunderstorm',
        },
        {
          type: 'premiumHatchingPotion',
          path: 'premiumHatchingPotions.Moonglow',
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
        path: 'food.Strawberry',
      },
      {
        type: 'hatchingPotions',
        path: 'hatchingPotions.Base',
      },
      {
        type: 'eggs',
        path: 'eggs.Dragon',
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
