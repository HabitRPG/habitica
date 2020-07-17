import { SEASONAL_SETS } from '../content/constants';

export default {
  opened: true,

  currentSeason: 'Summer',

  dateRange: { start: '2020-06-17', end: '2020-07-31' },

  availableSets: [
    ...SEASONAL_SETS.summer,
  ],

  pinnedSets: {
    healer: 'summer2020SeaGlassHealerSet',
    rogue: 'summer2020CrocodileRogueSet',
    warrior: 'summer2020RainbowTroutWarriorSet',
    wizard: 'summer2020OarfishMageSet',
  },

  availableSpells: [
    'seafoam',
  ],

  availableQuests: [
  ],

  featuredSet: 'summer2019WaterLilyMageSet',
};
