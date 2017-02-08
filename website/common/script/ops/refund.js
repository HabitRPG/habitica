import i18n from '../i18n';
import _ from 'lodash';
import {
  BadRequest,
} from '../libs/errors';
import refundGear from './refundGear';

module.exports = function refund (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let buyRes;
  if (key === 'potion') {
    // buyRes = buyHealthPotion(user, req, analytics);
  } else if (key === 'armoire') {
    // buyRes = buyArmoire(user, req, analytics);
  } else {
    buyRes = refundGear(user, req, analytics);
  }

  return buyRes;
};
