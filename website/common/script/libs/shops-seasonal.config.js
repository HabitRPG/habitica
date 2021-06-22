import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import {
  EVENTS,
  SEASONAL_SETS,
} from '../content/constants';

const CURRENT_EVENT = find(
  EVENTS, event => moment().isBetween(event.start, event.end),
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
      healer: 'summer2021ParrotHealerSet',
      rogue: 'summer2021ClownfishRogueSet',
      warrior: 'summer2021FlyingFishWarriorSet',
      wizard: 'summer2021NautilusMageSet',
    }
    : {},

  availableSpells: SHOP_OPEN && moment().isAfter('2021-07-06T08:00-04:00')
    ? [
      'seafoam',
    ]
    : [],

  availableQuests: [],

  featuredSet: 'summer2020CrocodileRogueSet',
};
