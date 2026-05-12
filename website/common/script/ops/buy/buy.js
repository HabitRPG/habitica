import get from 'lodash/get';
import {
  BadRequest,
} from '../../libs/errors';
import { BuyArmoireOperation } from './buyArmoire';
import { BuyHealthPotionOperation } from './buyHealthPotion';
import { BuyMarketGearOperation } from './buyMarketGear';
import buyMysterySet from './buyMysterySet';
import { BuyQuestWithGoldOperation } from './buyQuestGold';
import { BuySpellOperation } from './buySpell';
import purchaseOp from './purchase';
import hourglassPurchase from './hourglassPurchase';
import { errorMessage } from '../../libs/errorMessage';
import { BuyGemOperation } from './buyGem';
import { BuyQuestWithGemOperation } from './buyQuestGem';
import { BuyPetWithGemOperation } from './buyPetGem';
import { BuyHourglassMountOperation } from './buyMount';

// @TODO: remove the req option style. Dependency on express structure is an anti-pattern
// We should either have more params or a set structure validated by a Type checker

// @TODO: when we are sure buy is the only function used, let's move the buy files to a folder

export default async function buy (
  user,
  req = {},
  options = { quantity: 1, hourglass: false },
) {
  const key = get(req, 'params.key');
  const { hourglass } = options;
  const { quantity } = options;
  if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

  // @TODO: Slowly remove the need for key and use type instead
  // This should eventually be the 'factory' function with vendor classes
  let type = get(req, 'type');
  if (!type) type = get(req, 'params.type');
  if (!type) type = key;

  let buyRes;

  switch (type) {
    case 'armoire': {
      const buyOp = new BuyArmoireOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    case 'backgrounds':
      if (!hourglass) throw new BadRequest(errorMessage('useUnlockForCosmetics'));
      buyRes = await hourglassPurchase(user, req);
      break;
    case 'mystery':
      buyRes = await buyMysterySet(user, req);
      break;
    case 'potion': {
      const buyOp = new BuyHealthPotionOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    case 'gems': {
      const buyOp = new BuyGemOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    case 'quests': {
      if (hourglass) {
        buyRes = await hourglassPurchase(user, req, quantity);
      } else {
        const buyOp = new BuyQuestWithGemOperation(user, req);

        buyRes = await buyOp.purchase();
      }
      break;
    }
    case 'eggs':
    case 'hatchingPotions':
    case 'food':
    case 'gear':
    case 'bundles':
      buyRes = await purchaseOp(user, req);
      break;
    case 'mounts': {
      const buyOp = new BuyHourglassMountOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    case 'pets':
      if (key === 'Gryphatrice-Jubilant') {
        const buyOp = new BuyPetWithGemOperation(user, req);
        buyRes = await buyOp.purchase();
      } else {
        buyRes = hourglassPurchase(user, req);
      }
      break;
    case 'quest': {
      const buyOp = new BuyQuestWithGoldOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    case 'special': {
      const buyOp = new BuySpellOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
    default: {
      const buyOp = new BuyMarketGearOperation(user, req);

      buyRes = await buyOp.purchase();
      break;
    }
  }

  return buyRes;
}
