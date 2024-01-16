import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import {
  EVENTS,
  SEASONAL_SETS,
} from '../content/constants';

const CURRENT_EVENT = find(EVENTS, event => moment().isBetween(event.start, event.end)
    && ['winter', 'spring', 'summer', 'fall'].includes(event.season));

export default {
  opened: CURRENT_EVENT,

  currentSeason: CURRENT_EVENT ? upperFirst(CURRENT_EVENT.season) : 'Closed',

  dateRange: {
    start: CURRENT_EVENT ? moment(CURRENT_EVENT.start) : moment().subtract(1, 'days').toDate(),
    end: CURRENT_EVENT ? moment(CURRENT_EVENT.end) : moment().subtract(1, 'seconds').toDate(),
  },

  availableSets: CURRENT_EVENT
    ? [
      ...SEASONAL_SETS[CURRENT_EVENT.season],
    ]
    : [],

  pinnedSets: CURRENT_EVENT
    ? {
      rogue: 'winter2024SnowyOwlRogueSet',
      warrior: 'winter2024PeppermintBarkWarriorSet',
      wizard: 'winter2024NarwhalWizardMageSet',
      healer: 'winter2024FrozenHealerSet',
    }
    : {},

  availableSpells: CURRENT_EVENT && moment().isBetween('2024-01-09T08:00-04:00', CURRENT_EVENT.end)
    ? [
      'snowball',
    ]
    : [],

  availableQuests: CURRENT_EVENT && moment().isBetween(CURRENT_EVENT.start, CURRENT_EVENT.end)
    ? [
      'evilsanta',
      'evilsanta2',
    ]
    : [],

  featuredSet: 'winter2019PoinsettiaSet',
};
