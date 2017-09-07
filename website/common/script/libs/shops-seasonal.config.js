import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  // opened: false,
  opened: true,
  // currentSeason: 'Closed',
  currentSeason: 'Summer',

  availableSets: [
    ...SEASONAL_SETS.fall,
  ],

  pinnedSets: {
    warrior: 'fall2017WarriorSet',
    wizard: 'fall2017MasqueradeSet',
    rogue: 'fall2017TrickOrTreatSet',
    healer: 'fall2017HauntedHouseSet',
  },

  availableSpells: [
    'spookySparkles',
  ],

  availableQuests: [
  ],

  featuredSet: 'battleRogueSet',
};
