import _ from 'lodash';
import autoAllocate from '../fns/autoAllocate';

module.exports = function allocateNow (user) {
  _.times(user.stats.points, () => autoAllocate(user));
  user.stats.points = 0;

  return [
    user.stats,
  ];
};
