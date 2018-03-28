import i18n from '../../i18n';
import get from 'lodash/get';
import {
  BadRequest,
} from '../../libs/errors';
import buyHealthPotion from './buyHealthPotion';
import buyArmoire from './buyArmoire';
import {BuyMarketGearOperation} from './buyMarketGear';
import buyMysterySet from './buyMysterySet';
import buyQuest from './buyQuest';
import buySpecialSpell from './buySpecialSpell';
import purchaseOp from './purchase';
import hourglassPurchase from './hourglassPurchase';

// @TODO: remove the req option style. Dependency on express structure is an anti-pattern
// We should either have more parms or a set structure validated by a Type checker

// @TODO: when we are sure buy is the only function used, let's move the buy files to a folder

module.exports = function buy (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  // @TODO: Slowly remove the need for key and use type instead
  // This should evenutally be the 'factory' function with vendor classes
  let type = get(req, 'type');
  if (!type) type = get(req, 'params.type');
  if (!type) type = key;

  let buyRes;

  switch (type) {
    case 'armoire':
      buyRes = buyArmoire(user, req, analytics);
      break;
    case 'mystery':
      buyRes = buyMysterySet(user, req, analytics);
      break;
    case 'potion':
      buyRes = buyHealthPotion(user, req, analytics);
      break;
    case 'eggs':
    case 'hatchingPotions':
    case 'food':
    case 'quests':
    case 'gear':
    case 'bundles':
    case 'gems':
      buyRes = purchaseOp(user, req, analytics);
      break;
    case 'pets':
    case 'mounts':
      buyRes = hourglassPurchase(user, req, analytics);
      break;
    case 'quest':
      buyRes = buyQuest(user, req, analytics);
      break;
    case 'special':
      buyRes = buySpecialSpell(user, req, analytics);
      break;
    case 'spell':
      buyRes = buySpecialSpell(user, req, analytics);
      break;
    default: {
      const buyOp = new BuyMarketGearOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
  }

  return buyRes;
};
