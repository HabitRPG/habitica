import upperFirst from 'lodash/upperFirst';
import {
  getCurrentGalaKey,
} from '../content/constants';
import {
  armor,
} from '../content/gear/sets/special';

const CURRENT_EVENT_KEY = getCurrentGalaKey();

function getCurrentSeasonalSets () {
  const year = new Date().getFullYear();
  return {
    rogue: armor[`${CURRENT_EVENT_KEY}${year}Rogue`].set,
    warrior: armor[`${CURRENT_EVENT_KEY}${year}Warrior`].set,
    wizard: armor[`${CURRENT_EVENT_KEY}${year}Mage`].set,
    healer: armor[`${CURRENT_EVENT_KEY}${year}Healer`].set,
  };
}

export default {
  currentSeason: CURRENT_EVENT_KEY ? upperFirst(CURRENT_EVENT_KEY) : 'Closed',
  pinnedSets: getCurrentSeasonalSets(),
  featuredSet: 'winter2019PoinsettiaSet',
};
