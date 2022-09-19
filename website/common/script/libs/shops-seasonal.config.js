import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import {
  EVENTS,
  SEASONAL_SETS,
} from '../content/constants';

const CURRENT_EVENT = find(
  EVENTS, event => moment().isBetween(event.start, event.end) && Boolean(event.season),
);

const SHOP_OPEN = CURRENT_EVENT && ['winter', 'spring', 'summer', 'fall'].includes(CURRENT_EVENT.season);

export default {
  opened: SHOP_OPEN,

  currentSeason: SHOP_OPEN ? upperFirst(CURRENT_EVENT.season) : 'Closed',

  dateRange: {
    start: CURRENT_EVENT ? moment(CURRENT_EVENT.start) : moment().subtract(1, 'days').toDate(),
    end: CURRENT_EVENT ? moment(CURRENT_EVENT.end) : moment().subtract(1, 'seconds').toDate(),
  },

  availableSets: SHOP_OPEN
    ? [
      ...SEASONAL_SETS[CURRENT_EVENT.season],
    ]
    : [],

  pinnedSets: SHOP_OPEN
    ? {
      healer: 'fall2022WatcherHealerSet',
      rogue: 'fall2022KappaRogueSet',
      warrior: 'fall2022OrcWarriorSet',
      wizard: 'fall2022HarpyMageSet',
    }
    : {},
  availableSpells: SHOP_OPEN && moment().isBetween('2022-10-04T08:00-05:00', CURRENT_EVENT.end)
    ? [
      'spookySparkles',
    ]
    : [],

  availableQuests: SHOP_OPEN && CURRENT_EVENT.season === 'spring'
    ? [
      'egg',
    ]
    : [],

  featuredSet: 'fall2021BrainEaterMageSet',
};
