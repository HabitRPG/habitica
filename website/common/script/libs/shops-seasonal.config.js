import upperFirst from 'lodash/upperFirst';
import {
  getCurrentGalaKey,
} from '../content/constants';
import {
  armor,
} from '../content/gear/sets/special';

function getCurrentSeasonalSets (currentEvent) {
  const year = new Date().getFullYear();
  return {
    rogue: armor[`${currentEvent}${year}Rogue`].set,
    warrior: armor[`${currentEvent}${year}Warrior`].set,
    wizard: armor[`${currentEvent}${year}Mage`].set,
    healer: armor[`${currentEvent}${year}Healer`].set,
  };
}

export default () => {
  const currentEvent = getCurrentGalaKey();
  const pinnedSets = getCurrentSeasonalSets(currentEvent)
  return {
    currentSeason: currentEvent ? upperFirst(currentEvent) : 'Closed',
    pinnedSets,
    featuredSet: user => {
      if (user.stats.class) {
        return pinnedSets[user.stats.class];
      }
      return null;
    },
  };
};
