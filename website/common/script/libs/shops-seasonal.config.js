import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Winter',

  dateRange: { start: '2017-12-19', end: '2018-01-31' },

  availableSets: [
    ...SEASONAL_SETS.winter,
  ],

  pinnedSets: {
    warrior: 'winter2018GiftWrappedSet',
    wizard: 'winter2018ConfettiSet',
    rogue: 'winter2018ReindeerSet',
    healer: 'winter2018MistletoeSet',
  },

  availableSpells: [
    'snowball',
  ],

  availableQuests: [
  ],

  featuredSet: 'yetiSet',
};
