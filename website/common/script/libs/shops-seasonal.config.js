import { SEASONAL_SETS } from '../content/constants';

export default {
  opened: true,

  currentSeason: 'Spring',

  dateRange: { start: '2020-03-19', end: '2020-04-30' },

  availableSets: [
    ...SEASONAL_SETS.spring,
  ],

  pinnedSets: {
    healer: 'spring2020IrisHealerSet',
    rogue: 'spring2020LapisLazuliRogueSet',
    warrior: 'spring2020BeetleWarriorSet',
    wizard: 'spring2020PuddleMageSet',
  },

  availableSpells: [
  ],

  availableQuests: [
    'egg',
  ],

  featuredSet: 'spring2020PuddleMageSet',
};
