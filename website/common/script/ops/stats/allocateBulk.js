import get from 'lodash/get';
import {
  ATTRIBUTES,
} from '../../constants';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import i18n from '../../i18n';

module.exports = function allocateBulk (user, req = {}) {
  const stats = get(req, 'body.stats');
  if (!stats) throw new BadRequest(i18n.t('statsObjectRequired', req.language));

  const statKeys = Object.keys(stats);
  const invalidStats = statKeys.filter(statKey => {
    return ATTRIBUTES.indexOf(statKey) === -1;
  });
  if (invalidStats.length > 0) {
    throw new BadRequest(i18n.t('invalidAttribute', {attr: invalidStats.join(',')}, req.language));
  }

  if (user.stats.points <= 0) {
    throw new NotAuthorized(i18n.t('notEnoughAttrPoints', req.language));
  }

  const newStatValues = Object.values(stats);
  const totalPointsToAllocate = newStatValues.reduce((sum, value) => {
    return sum + value;
  }, 0);
  if (user.stats.points < totalPointsToAllocate) {
    throw new NotAuthorized(i18n.t('notEnoughAttrPoints', req.language));
  }

  for (let [stat, value] of Object.entries(stats)) {
    user.stats[stat] += value;
    user.stats.points -= value;
    if (stat === 'int') user.stats.mp += value;
  }

  return [
    user.stats,
  ];
};
