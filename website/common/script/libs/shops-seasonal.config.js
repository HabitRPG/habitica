import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Spring',

  dateRange: { start: '2019-03-19', end: '2019-04-30' },

  availableSets: [
    ...SEASONAL_SETS.spring,
  ],

  pinnedSets: {
    wizard: 'spring2019AmberMageSet',
    warrior: 'spring2019OrchidWarriorSet',
    rogue: 'spring2019CloudRogueSet',
    healer: 'spring2019RobinHealerSet',
  },

  availableSpells: [
    'shinySeed',
  ],

  availableQuests: [
    'egg',
  ],

  featuredSet: 'spring2018DucklingRogueSet',
};
