import { SEASONAL_SETS } from '../content/constants';

module.exports = {
  opened: true,

  currentSeason: 'Summer',

  dateRange: { start: '2019-06-18', end: '2019-07-31' },

  availableSets: [
    ...SEASONAL_SETS.summer,
  ],

  pinnedSets: {
    wizard: 'summer2019WaterLilyMageSet',
    warrior: 'summer2019SeaTurtleWarriorSet',
    rogue: 'summer2019HammerheadRogueSet',
    healer: 'summer2019ConchHealerSet',
  },

  availableSpells: [
  ],

  availableQuests: [
  ],

  featuredSet: 'summer2018BettaFishWarriorSet',
};
