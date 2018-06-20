import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Summer',

  dateRange: { start: '2018-06-19', end: '2018-07-31' },

  availableSets: [
    ...SEASONAL_SETS.summer,
  ],

  pinnedSets: {
    wizard: 'summer2018LionfishMageSet',
    warrior: 'summer2018BettaFishWarriorSet',
    rogue: 'summer2018FisherRogueSet',
    healer: 'summer2018MerfolkMonarchSet',
  },

  availableSpells: [
  ],

  availableQuests: [
  ],

  featuredSet: 'strappingSailorSet',
};
