import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

/*
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
 */

module.exports = function(user) {
  return user.stats[(function() {
    var diff, ideal, lvlDiv7, preference, stats, suggested;
    switch (user.preferences.allocationMode) {
      case "flat":
        stats = _.pick(user.stats, splitWhitespace('con str per int'));
        return _.invert(stats)[_.min(stats)];
      case "classbased":
        lvlDiv7 = user.stats.lvl / 7;
        ideal = [lvlDiv7 * 3, lvlDiv7 * 2, lvlDiv7, lvlDiv7];
        preference = (function() {
          switch (user.stats["class"]) {
            case "wizard":
              return ["int", "per", "con", "str"];
            case "rogue":
              return ["per", "str", "int", "con"];
            case "healer":
              return ["con", "int", "str", "per"];
            default:
              return ["str", "con", "per", "int"];
          }
        })();
        diff = [user.stats[preference[0]] - ideal[0], user.stats[preference[1]] - ideal[1], user.stats[preference[2]] - ideal[2], user.stats[preference[3]] - ideal[3]];
        suggested = _.findIndex(diff, (function(val) {
          if (val === _.min(diff)) {
            return true;
          }
        }));
        if (~suggested) {
          return preference[suggested];
        } else {
          return "str";
        }
      case "taskbased":
        suggested = _.invert(user.stats.training)[_.max(user.stats.training)];
        _.merge(user.stats.training, {
          str: 0,
          int: 0,
          con: 0,
          per: 0
        });
        return suggested || "str";
      default:
        return "str";
    }
  })()]++;
};
