import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb) {
  var stat;
  stat = req.query.stat || 'str';
  if (user.stats.points > 0) {
    user.stats[stat]++;
    user.stats.points--;
    if (stat === 'int') {
      user.stats.mp++;
    }
  }
  return typeof cb === "function" ? cb(null, _.pick(user, splitWhitespace('stats'))) : void 0;
};
