import get from 'lodash/get';
import {
  BadRequest,
} from '../../libs/errors';
import {BuyArmoireOperation} from './buyArmoire';
import {BuyHealthPotionOperation} from './buyHealthPotion';
import {BuyMarketGearOperation} from './buyMarketGear';
import buyMysterySet from './buyMysterySet';
import {BuyQuestWithGoldOperation} from './buyQuest';
import {BuySpellOperation} from './buySpell';
import purchaseOp from './purchase';
import hourglassPurchase from './hourglassPurchase';
import errorMessage from '../../libs/errorMessage';
import {BuyGemOperation} from './buyGem';
import {BuyQuestWithGemOperation} from './buyQuestGem';

// @TODO: remove the req option style. Dependency on express structure is an anti-pattern
// We should either have more params or a set structure validated by a Type checker

// @TODO: when we are sure buy is the only function used, let's move the buy files to a folder

module.exports = function buy (user, req = {}, analytics) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  // @TODO: Slowly remove the need for key and use type instead
  // This should eventually be the 'factory' function with vendor classes
  let type = get(req, 'type');
  if (!type) type = get(req, 'params.type');
  if (!type) type = key;

  let buyRes;

  switch (type) {
    case 'armoire': {
      const buyOp = new BuyArmoireOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    case 'mystery':
      buyRes = buyMysterySet(user, req, analytics);
      break;
    case 'potion': {
      const buyOp = new BuyHealthPotionOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    case 'gems': {
      const buyOp = new BuyGemOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    case 'quests': {
      const buyOp = new BuyQuestWithGemOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    case 'eggs':
    case 'hatchingPotions':
    case 'food':
    case 'gear':
    case 'bundles':
      buyRes = purchaseOp(user, req, analytics);
      break;
    case 'pets':
    case 'mounts':
      buyRes = hourglassPurchase(user, req, analytics);
      break;
    case 'quest': {
      const buyOp = new BuyQuestWithGoldOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    case 'special': {
      const buyOp = new BuySpellOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
    default: {
      const buyOp = new BuyMarketGearOperation(user, req, analytics);

      buyRes = buyOp.purchase();
      break;
    }
  }

  return buyRes;
};
