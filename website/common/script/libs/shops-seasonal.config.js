import upperFirst from 'lodash/upperFirst';
import {
  getCurrentGalaKey,
} from '../content/constants';
import {
  armor,
} from '../content/gear/sets/special';

function safeGetSet (currentEvent, year, className) {
  const set = armor[`${currentEvent}${year}${className}`];
  if (set) {
    return set.set;
  }
  let checkedYear = year - 1;
  while (checkedYear >= 2014) {
    const oldSet = armor[`${currentEvent}${checkedYear}${className}`];
    if (oldSet) {
      return oldSet.set;
    }
    checkedYear -= 1;
  }
  return null;
}

function getCurrentSeasonalSets (currentEvent) {
  const now = new Date();
  const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  return {
    rogue: safeGetSet(currentEvent, year, 'Rogue'),
    warrior: safeGetSet(currentEvent, year, 'Warrior'),
    wizard: safeGetSet(currentEvent, year, 'Mage'),
    healer: safeGetSet(currentEvent, year, 'Healer'),
  };
}

export default () => {
  const currentEvent = getCurrentGalaKey();
  const pinnedSets = getCurrentSeasonalSets(currentEvent);
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
