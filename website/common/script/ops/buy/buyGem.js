import pick from 'lodash/pick';
import get from 'lodash/get';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import { AbstractGoldItemOperation } from './abstractBuyOperation';
import planGemLimits from '../../libs/planGemLimits';
import updateUserBalance from '../updateUserBalance';

export class BuyGemOperation extends AbstractGoldItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return true;
  }

  getItemValue () { // eslint-disable-line class-methods-use-this
    return planGemLimits.convRate;
  }

  getItemKey () { // eslint-disable-line class-methods-use-this
    return 'gem';
  }

  getItemType () { // eslint-disable-line class-methods-use-this
    return 'gems';
  }

  extractAndValidateParams (user, req) {
    this.key = get(req, 'params.key');
    const { key } = this;
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    let { convCap } = planGemLimits;
    convCap += user.purchased.plan.consecutive.gemCapExtra;

    // todo better name?
    this.convCap = convCap;

    this.canUserPurchase(user);
  }

  canUserPurchase (user, item) {
    if (!user.purchased || !user.purchased.plan || !user.purchased.plan.customerId) {
      throw new NotAuthorized(this.i18n('mustSubscribeToPurchaseGems'));
    }

    super.canUserPurchase(user, item);

    if (user.purchased.plan.gemsBought >= this.convCap) {
      throw new NotAuthorized(this.i18n('maxBuyGems', { convCap: this.convCap }));
    }

    if (user.purchased.plan.gemsBought + this.quantity > this.convCap) {
      throw new NotAuthorized(this.i18n('reachedGoldToGemCapQuantity', {
        convCap: this.convCap,
        quantity: this.quantity,
      }));
    }
  }

  executeChanges (user, item) {
    updateUserBalance(user, 0.25 * this.quantity, 'buy_gold');
    user.purchased.plan.gemsBought += this.quantity;

    this.subtractCurrency(user, item);

    return [
      pick(user, splitWhitespace('stats balance')),
      this.i18n('plusGem', { count: this.quantity }),
    ];
  }

  analyticsLabel () { // eslint-disable-line class-methods-use-this
    return 'purchase gems';
  }
}
