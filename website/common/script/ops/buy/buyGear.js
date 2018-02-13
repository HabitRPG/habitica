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

export class BuyGearOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  extractAndValidateParams () {
    let key = this.key = get(this.req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    let item = content.gear.flat[key];

    if (!item) throw new NotFound(this.i18n('itemNotFound', {key}));

    super.canUserPurchase(item);

    if (this.user.items.gear.owned[item.key]) {
      throw new NotAuthorized(this.i18n('equipmentAlreadyOwned'));
    }

    let itemIndex = Number(item.index);

    if (Number.isInteger(itemIndex) && content.classes.includes(item.klass)) {
      let previousLevelGear = key.replace(/[0-9]/, itemIndex - 1);
      let hasPreviousLevelGear = this.user.items.gear.owned[previousLevelGear];
      let checkIndexToType = itemIndex > (item.type === 'weapon' || item.type === 'shield' && item.klass === 'rogue' ? 0 : 1);

      if (checkIndexToType && !hasPreviousLevelGear) {
        throw new NotAuthorized(this.i18n('previousGearNotOwned'));
      }
    }
  }

  executeChanges () {
    let message;

    if (this.user.preferences.autoEquip) {
      this.user.items.gear.equipped[this.item.type] = this.item.key;
      message = handleTwoHanded(this.user, this.item, undefined, this.req);
    }

    removePinnedGearAddPossibleNewOnes(this.user, `gear.flat.${this.item.key}`, this.item.key);

    if (this.item.last) ultimateGear(this.user);

    this.user.stats.gp -= this.item.value;

    if (!message) {
      message = this.i18n('messageBought', {
        itemText: this.item.text(this.req.language),
      });
    }

    return [
      pick(this.user, splitWhitespace('items achievements stats flags')),
      message,
    ];
  }

  analyticsData () {
    return {
      itemKey: this.key,
      acquireMethod: 'Gold',
      goldCost: this.item.value,
    };
  }
}
