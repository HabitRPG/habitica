import i18n from '../i18n';
import get from 'lodash/get';
import {
  BadRequest,
} from '../libs/errors';
import buyHealthPotion from './buyHealthPotion';
import buyArmoire from './buyArmoire';
import buyGear from './buyGear';
import buyMysterySet from './buyMysterySet';
import buyQuest from './buyQuest';
import buySpecialSpell from './buySpecialSpell';

// @TODO: remove the req option style. Dependency on express structure is an anti-pattern
// We should either have more parms or a set structure validated by a Type checker

// @TODO: when we are sure buy is the only function used, let's move the buy files to a folder

module.exports = function buy (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  // @TODO: Slowly remove the need for key and use type instead
  // This should evenutally be the 'factory' function with vendor classes
  let type = get(req, 'type');
  if (!type) type = key;

  // @TODO: For now, builk purchasing is here, but we should probably have a parent vendor
  // class that calls the factory and handles larger operations. If there is more than just bulk
  let quantity = 1;
  if (req.quantity) quantity = req.quantity;

  let buyRes;

  for (let i = 0; i < quantity; i += 1) {
    if (type === 'potion') {
      buyRes = buyHealthPotion(user, req, analytics);
    } else if (type === 'armoire') {
      buyRes = buyArmoire(user, req, analytics);
    } else if (type === 'mystery') {
      buyRes = buyMysterySet(user, req, analytics);
    } else if (type === 'quest') {
      buyRes = buyQuest(user, req, analytics);
    } else if (type === 'special') {
      buyRes = buySpecialSpell(user, req, analytics);
    } else {
      buyRes = buyGear(user, req, analytics);
    }
  }

  return buyRes;
};
