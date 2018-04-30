import buy from './buy';
import get from 'lodash/get';

module.exports = function purchaseWithSpell (user, req = {}, analytics) {
  const type = get(req.params, 'type');

  return buy(user, req, analytics);
};
