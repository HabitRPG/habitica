const ANIMAL_SET_ACHIEVEMENTS = {
  legendaryBestiary: {
    type: 'pet',
    species: [
      'Dragon',
      'FlyingPig',
      'Gryphon',
      'SeaSerpent',
      'Unicorn',
    ],
    achievementKey: 'legendaryBestiary',
    notificationType: 'ACHIEVEMENT_LEGENDARY_BESTIARY',
  },
  domesticated: {
    type: 'pet',
    species: [
      'Ferret',
      'GuineaPig',
      'Rooster',
      'FlyingPig',
      'Rat',
      'Bunny',
      'Horse',
      'Cow',
    ],
    achievementKey: 'domesticated',
    notificationType: 'ACHIEVEMENT_DOMESTICATED',
  },
};

export default ANIMAL_SET_ACHIEVEMENTS;
