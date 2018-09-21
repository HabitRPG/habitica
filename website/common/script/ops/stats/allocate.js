import get from 'lodash/get';
import {
  ATTRIBUTES,
} from '../../constants';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import i18n from '../../i18n';
import errorMessage from '../../libs/errorMessage';
import hasClass from '../../libs/hasClass';

module.exports = function allocate (user, req = {}) {
  let stat = get(req, 'query.stat', 'str');

  if (ATTRIBUTES.indexOf(stat) === -1) {
    throw new BadRequest(errorMessage('invalidAttribute', {attr: stat}));
  }

  if (!hasClass(user)) {
    throw new NotAuthorized(i18n.t('classNotSelected', req.language));
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
