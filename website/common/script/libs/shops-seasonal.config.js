import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Fall',

  dateRange: { start: '2019-09-24', end: '2019-10-31' },

  availableSets: [
    ...SEASONAL_SETS.fall,
  ],

  pinnedSets: {
    wizard: 'fall2019CyclopsSet',
    warrior: 'fall2019RavenSet',
    rogue: 'fall2019OperaticSpecterSet',
    healer: 'fall2019LichSet',
  },

  availableSpells: [
    'spookySparkles',
  ],

  availableQuests: [
  ],

  featuredSet: 'fall2018AlterEgoSet',
};
