import moment from 'moment';
import { SEASONAL_SETS } from '../content/constants';

const SHOP_OPEN = moment().isBetween('2020-12-17T08:00-04:00', '2021-01-31T20:00-04:00');

export default {
  opened: SHOP_OPEN,

  currentSeason: SHOP_OPEN ? 'Winter' : 'Closed',

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

  availableSpells: moment().isBetween('2020-12-17T08:00-04:00', '2021-01-31T20:00-04:00')
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
