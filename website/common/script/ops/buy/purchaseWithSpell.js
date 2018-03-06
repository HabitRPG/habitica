import buy from './buy';
import get from 'lodash/get';

module.exports = function purchaseWithSpell (user, req = {}, analytics) {
  const type = get(req.params, 'type');

  if (type === 'spells') {
    req.type = 'special';
  }

  return buy(user, req, analytics);
};
