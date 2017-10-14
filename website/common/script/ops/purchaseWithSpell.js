import buySpecialSpellOp from './buySpecialSpell';
import purchaseOp from './purchase';
import get from 'lodash/get';

module.exports = function purchaseWithSpell (user, req = {}, analytics) {
  const type = get(req.params, 'type');

  return type === 'spells' ? buySpecialSpellOp(user, req) : purchaseOp(user, req, analytics);
};
