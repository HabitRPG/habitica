import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Winter',

  dateRange: { start: '2018-12-20', end: '2019-01-31' },

  availableSets: [
    ...SEASONAL_SETS.winter,
  ],

  pinnedSets: {
    wizard: 'winter2019PyrotechnicSet',
    warrior: 'winter2019BlizzardSet',
    rogue: 'winter2019PoinsettiaSet',
    healer: 'winter2019WinterStarSet',
  },

  availableSpells: [
  ],

  availableQuests: [
    'evilsanta',
    'evilsanta2',
  ],

  featuredSet: 'winter2017WinterWolfSet',
};
