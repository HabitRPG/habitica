import min from 'lodash/min';
import pick from 'lodash/pick';
import values from 'lodash/values';
import invert from 'lodash/invert';
import findIndex from 'lodash/findIndex';
import max from 'lodash/max';

import splitWhitespace from '../libs/splitWhitespace';

/*
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
 */

function getStatToAllocate (user) {
  let suggested;

  let statsObj = user.stats.toObject ? user.stats.toObject() : user.stats;

  switch (user.preferences.allocationMode) {
    case 'flat': {
      let stats = pick(statsObj, splitWhitespace('con str per int'));
      return invert(stats)[min(values(stats))];
    }
    case 'classbased': {
      let preference;
      let lvlDiv7 = statsObj.lvl / 7;
      let ideal = [lvlDiv7 * 3, lvlDiv7 * 2, lvlDiv7, lvlDiv7];

      switch (statsObj.class) {
        case 'wizard': {
          preference = ['int', 'per', 'con', 'str'];
          break;
        }
        case 'rogue': {
          preference = ['per', 'str', 'int', 'con'];
          break;
        }
        case 'healer': {
          preference = ['con', 'int', 'str', 'per'];
          break;
        }
        default: {
          preference = ['str', 'con', 'per', 'int'];
        }
      }

      let diff = [
        statsObj[preference[0]] - ideal[0],
        statsObj[preference[1]] - ideal[1],
        statsObj[preference[2]] - ideal[2],
        statsObj[preference[3]] - ideal[3],
      ];

      suggested = findIndex(diff, (val) => {
        if (val === min(diff)) return true;
      });

      return suggested !== -1 ? preference[suggested] : 'str';
    }
    case 'taskbased': {
      suggested = invert(statsObj.training)[max(values(statsObj.training))];

      user.stats.training.str = 0;
      user.stats.training.int = 0;
      user.stats.training.con = 0;
      user.stats.training.per = 0;

      return suggested || 'str';
    }
    default: {
      return 'str';
    }
  }
}

module.exports = function autoAllocate (user) {
  let statToIncrease = getStatToAllocate(user);

  return user.stats[statToIncrease]++;
};
