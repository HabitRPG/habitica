import { SEASONAL_SETS } from '../content/constants';

export default {
  opened: true,

  currentSeason: 'Winter',

  dateRange: { start: '2019-12-19', end: '2020-01-31' },

  availableSets: [
    ...SEASONAL_SETS.winter,
  ],

  pinnedSets: {
    healer: 'winter2020WinterSpiceSet',
    rogue: 'winter2020LanternSet',
    warrior: 'winter2020EvergreenSet',
    wizard: 'winter2020CarolOfTheMageSet',
  },

  availableSpells: [
    'snowball',
  ],

  availableQuests: [
    'evilsanta',
    'evilsanta2',
  ],

  featuredSet: 'winter2018GiftWrappedSet',
};
