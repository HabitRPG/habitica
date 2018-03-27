import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Spring',

  dateRange: { start: '2018-03-20', end: '2018-04-30' },

  availableSets: [
    ...SEASONAL_SETS.spring,
  ],

  pinnedSets: {
    wizard: 'spring2018TulipMageSet',
    warrior: 'spring2018SunriseWarriorSet',
    rogue: 'spring2018DucklingRogueSet',
    healer: 'spring2018GarnetHealerSet',
  },

  availableSpells: [
  ],

  availableQuests: [
    'egg',
  ],

  featuredSet: 'comfortingKittySet',
};
