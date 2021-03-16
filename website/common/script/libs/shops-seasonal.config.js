import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import {
  EVENTS,
  SEASONAL_SETS,
} from '../content/constants';

const CURRENT_EVENT = find(EVENTS, event => moment().isBetween(event.start, event.end));

const SHOP_OPEN = CURRENT_EVENT && ['winter', 'spring', 'summer', 'fall'].includes(CURRENT_EVENT.season);

export default {
  opened: SHOP_OPEN,

  currentSeason: SHOP_OPEN ? upperFirst(CURRENT_EVENT.season) : 'Closed',

  dateRange: { start: '2020-12-17', end: '2021-01-31' },

  availableSets: SHOP_OPEN
    ? [
      ...SEASONAL_SETS.winter,
    ]
    : [],

  pinnedSets: SHOP_OPEN
    ? {
      healer: 'winter2021ArcticExplorerHealerSet',
      rogue: 'winter2021HollyIvyRogueSet',
      warrior: 'winter2021IceFishingWarriorSet',
      wizard: 'winter2021WinterMoonMageSet',
    }
    : {},

  availableSpells: moment().isBetween('2020-12-29T08:00-04:00', '2021-01-31T20:00-04:00')
    ? [
      'snowball',
    ]
    : [],

  availableQuests: SHOP_OPEN
    ? [
      'evilsanta',
      'evilsanta2',
    ]
    : [],

  featuredSet: 'winter2020CarolOfTheMageSet',
};
