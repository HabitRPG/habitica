import times from 'lodash/times';
import autoAllocate from '../../fns/autoAllocate';

export default function allocateNow (user) {
  times(user.stats.points, () => autoAllocate(user));
  user.stats.points = 0;

  return [
    user.stats,
  ];
}
