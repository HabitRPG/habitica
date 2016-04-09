import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';
import _ from 'lodash';

module.exports = function disableClasses (user, req = {}) {
  user.stats.class = 'warrior';
  user.flags.classSelected = true;
  user.preferences.disableClasses = true;
  user.preferences.autoAllocate = true;
  user.stats.str = capByLevel(user.stats.lvl);
  user.stats.points = 0;

  if (req.v2 === true) {
    return _.pick(user, splitWhitespace('stats flags preferences'));
  } else {
    return {
      data: _.pick(user, splitWhitespace('stats flags preferences')),
    };
  }
};
