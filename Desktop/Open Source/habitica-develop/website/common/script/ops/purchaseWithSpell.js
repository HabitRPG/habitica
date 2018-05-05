import buy from './buy';
import purchaseOp from './purchase';
import get from 'lodash/get';

module.exports = function purchaseWithSpell (user, req = {}, analytics) {
  const type = get(req.params, 'type');

  // Set up type for buy function - different than the above type.
  req.type = 'special';

  return type === 'spells' ? buy(user, req, analytics) : purchaseOp(user, req, analytics);
};
