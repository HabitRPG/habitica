import content from '../../content/index';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import handleTwoHanded from '../../fns/handleTwoHanded';
import ultimateGear from '../../fns/ultimateGear';

import {removePinnedGearAddPossibleNewOnes} from '../pinnedGearUtils';

import { AbstractGoldItemOperation } from './abstractBuyOperation';
import errorMessage from '../../libs/errorMessage';

export class BuyMarketGearOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  canUserPurchase (user, item)  {
    super.canUserPurchase(user, item);

    const checkKlass = item.klass && !['special', 'armoire', user.stats.class].includes(item.klass);
    const checkSpecialClass = item.klass === 'special' && item.specialClass && item.specialClass !== user.stats.class;

    // check for different class gear
    if (checkKlass || checkSpecialClass) {
      throw new NotAuthorized(this.i18n('cannotBuyItem'));
    }
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    let item = content.gear.flat[key];
    if (!item) throw new NotFound(errorMessage('itemNotFound', {key}));

    this.canUserPurchase(user, item);

    if (user.items.gear.owned[item.key]) {
      throw new NotAuthorized(this.i18n('equipmentAlreadyOwned'));
    }

    let itemIndex = Number(item.index);

    if (Number.isInteger(itemIndex) && content.classes.includes(item.klass)) {
      let previousLevelGear = key.replace(/[0-9]/, itemIndex - 1);
      let hasPreviousLevelGear = user.items.gear.owned[previousLevelGear];
      let checkIndexToType = itemIndex > (item.type === 'weapon' || item.type === 'shield' && item.klass === 'rogue' ? 0 : 1);

      if (checkIndexToType && !hasPreviousLevelGear) {
        throw new NotAuthorized(this.i18n('previousGearNotOwned'));
      }
    }
  }

  executeChanges (user, item, req) {
    let message;

    if (user.preferences.autoEquip) {
      user.items.gear.equipped[item.type] = item.key;
      message = handleTwoHanded(user, item, undefined, req);
    }

    removePinnedGearAddPossibleNewOnes(user, `gear.flat.${item.key}`, item.key);

    if (item.last) ultimateGear(user);

    this.subtractCurrency(user, item);

    if (!message) {
      message = this.i18n('messageBought', {
        itemText: item.text(req.language),
      });
    }

    return [
      pick(user, splitWhitespace('items achievements stats flags pinnedItems')),
      message,
    ];
  }
}
