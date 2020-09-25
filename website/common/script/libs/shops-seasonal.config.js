import { SEASONAL_SETS } from '../content/constants';

export default {
  opened: true,

  currentSeason: 'Fall',

  dateRange: { start: '2020-09-22', end: '2020-10-31' },

  availableSets: [
    ...SEASONAL_SETS.fall,
  ],

  pinnedSets: {
    healer: 'fall2020DeathsHeadMothHealerSet',
    rogue: 'fall2020TwoHeadedRogueSet',
    warrior: 'fall2020WraithWarriorSet',
    wizard: 'fall2020ThirdEyeMageSet',
  },

  availableSpells: [
  ],

  availableQuests: [
  ],

  featuredSet: 'fall2020WraithWarriorSet',
};
