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
    start: SHOP_OPEN ? moment(CURRENT_EVENT.start) : moment().subtract(1, 'days').toDate(),
    end: SHOP_OPEN ? moment(CURRENT_EVENT.end) : moment().subtract(1, 'seconds').toDate(),
  },

  availableSets: SHOP_OPEN
    ? [
      ...SEASONAL_SETS[CURRENT_EVENT.season],
    ]
    : [],

  pinnedSets: SHOP_OPEN
    ? {
      healer: 'spring2021WillowHealerSet',
      rogue: 'spring2021TwinFlowerRogueSet',
      warrior: 'spring2021SunstoneWarriorSet',
      wizard: 'spring2021SwanMageSet',
    }
    : {},

  availableSpells: SHOP_OPEN && moment().isAfter('2021-04-06T08:00-05:00')
    ? [
      'shinySeed',
    ]
    : [],

  availableQuests: SHOP_OPEN && moment().isAfter('2021-03-30T08:00-05:00')
    ? [
      'egg',
    ]
    : [],

  featuredSet: 'spring2020PuddleMageSet',
};
