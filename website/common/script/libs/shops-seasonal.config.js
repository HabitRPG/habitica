import { SEASONAL_SETS} from '../content/constants';

module.exports = {
  // opened: false,
  opened: true,

  // used for the seasonalShop.notes
  // currentSeason: 'Closed',
  currentSeason: 'Fall',

  dateRange: { start: '2017-09-21', end: '2017-10-31' },

  availableSets: [
    ...SEASONAL_SETS.fall,
  ],

  pinnedSets: {
    warrior: 'fall2017HabitoweenSet',
    wizard: 'fall2017MasqueradeSet',
    rogue: 'fall2017TrickOrTreatSet',
    healer: 'fall2017HauntedHouseSet',
  },

  availableSpells: [
    // 'spookySparkles',
  ],

  availableQuests: [
  ],

  featuredSet: 'battleRogueSet',
};
