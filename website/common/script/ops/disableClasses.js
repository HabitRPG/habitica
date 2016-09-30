import splitWhitespace from '../libs/splitWhitespace';
import { capByLevel } from '../statHelpers';
import _ from 'lodash';

module.exports = function disableClasses (user) {
  user.stats.class = 'warrior';
  user.flags.classSelected = true;
  user.preferences.disableClasses = true;
  user.preferences.autoAllocate = true;
  user.stats.str = capByLevel(user.stats.lvl);
  user.stats.points = 0;

  return [
    _.pick(user, splitWhitespace('stats flags preferences')),
  ];
};
