import get from 'lodash/get';
import {
  ATTRIBUTES,
} from '../../constants';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import i18n from '../../i18n';
import commonMessages from '../../libs/commonMessages';

module.exports = function allocate (user, req = {}) {
  let stat = get(req, 'query.stat', 'str');

  if (ATTRIBUTES.indexOf(stat) === -1) {
    throw new BadRequest(commonMessages('invalidAttribute', {attr: stat}));
  }

  if (user.stats.points > 0) {
    user.stats[stat]++;
    user.stats.points--;
    if (stat === 'int') {
      user.stats.mp++;
    }
  } else {
    throw new NotAuthorized(i18n.t('notEnoughAttrPoints', req.language));
  }

  return [
    user.stats,
  ];
};
