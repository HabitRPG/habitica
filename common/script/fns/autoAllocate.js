import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

/*
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
 */

function getStatToAllocate (user) {
  let suggested;

  switch (user.preferences.allocationMode) {
    case 'flat':
      let stats = _.pick(user.stats, splitWhitespace('con str per int'));
      return _.invert(stats)[_.min(stats)];
    case 'classbased':
      let lvlDiv7 = user.stats.lvl / 7;
      let ideal = [lvlDiv7 * 3, lvlDiv7 * 2, lvlDiv7, lvlDiv7];

      let preference;
      switch (user.stats.class) {
        case 'wizard':
          preference = ['int', 'per', 'con', 'str'];
          break;
        case 'rogue':
          preference = ['per', 'str', 'int', 'con'];
          break;
        case 'healer':
          preference = ['con', 'int', 'str', 'per'];
          break;
        default:
          preference = ['str', 'con', 'per', 'int'];
      }

      let diff = [
        user.stats[preference[0]] - ideal[0],
        user.stats[preference[1]] - ideal[1],
        user.stats[preference[2]] - ideal[2],
        user.stats[preference[3]] - ideal[3],
      ];

      suggested = _.findIndex(diff, (val) => {
        if (val === _.min(diff)) return true;
      });

      return suggested !== -1 ? preference[suggested] : 'str';
    case 'taskbased':
      suggested = _.invert(user.stats.training)[_.max(user.stats.training)];

      let training = user.stats.training;
      training.str = 0;
      training.int = 0;
      training.con = 0;
      training.per = 0;

      return suggested || 'str';
    default:
      return 'str';
  }
}

module.exports = function autoAllocate (user) {
  return user.stats[getStatToAllocate(user)]++;
};
