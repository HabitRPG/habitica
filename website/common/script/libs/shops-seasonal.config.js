import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import {
  EVENTS,
  SEASONAL_SETS,
} from '../content/constants';

const CURRENT_EVENT = find(
  EVENTS, event => moment().isBetween(event.start, event.end)
    && ['winter', 'spring', 'summer', 'fall'].includes(event.season),
);

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
      rogue: 'winter2023RibbonRogueSet',
      warrior: 'winter2023WalrusWarriorSet',
      wizard: 'winter2023FairyLightsMageSet',
      healer: 'winter2023CardinalHealerSet',
    }
    : {},
  availableSpells: CURRENT_EVENT && moment().isBetween('2022-12-27T08:00-05:00', CURRENT_EVENT.end)
    ? [
      'snowball',
    ]
    : [],

  availableQuests: CURRENT_EVENT && CURRENT_EVENT.season === 'winter'
    ? [
      'evilsanta',
      'evilsanta2',
    ]
    : [],

  featuredSet: 'winter2022PomegranateMageSet',
};
