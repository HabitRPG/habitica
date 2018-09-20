import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Fall',

  dateRange: { start: '2018-09-20', end: '2018-10-31' },

  availableSets: [
    ...SEASONAL_SETS.fall,
  ],

  pinnedSets: {
    wizard: 'fall2018CandymancerMageSet',
    warrior: 'fall2018MinotaurWarriorSet',
    rogue: 'fall2018AlterEgoSet',
    healer: 'fall2018CarnivorousPlantSet',
  },

  availableSpells: [
  ],

  availableQuests: [
  ],

  featuredSet: 'mummyMedicSet',
};
