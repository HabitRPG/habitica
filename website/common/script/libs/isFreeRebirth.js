import moment from 'moment';
import { MAX_LEVEL } from '../constants';

export default function isFreeRebirth (user) {
  let daysFromLastFreeRebirth = user.flags.lastFreeRebirth;

  if (daysFromLastFreeRebirth) {
    daysFromLastFreeRebirth = moment().diff(moment(user.flags.lastFreeRebirth), 'days');
  } else {
    daysFromLastFreeRebirth = 999;
  }

  return user.stats.lvl >= MAX_LEVEL && daysFromLastFreeRebirth >= 45;
}
