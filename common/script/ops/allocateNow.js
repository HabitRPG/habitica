import _ from 'lodash';
import autoAllocate from '../fns/autoAllocate';

module.exports = function allocateNow (user, req = {}) {
  _.times(user.stats.points, () => autoAllocate(user));
  user.stats.points = 0;

  if (req.v2 === true) {
    return _.pick(user, 'stats');
  } else {
    return {
      data: _.pick(user, 'stats'),
    };
  }
};
