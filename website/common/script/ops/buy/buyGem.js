import pick from 'lodash/pick';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import {AbstractGoldItemOperation} from './abstractBuyOperation';
import get from 'lodash/get';
import planGemLimits from '../../libs/planGemLimits';

export class BuyGemOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return true;
  }

  getItemValue () {
    return planGemLimits.convRate;
  }

  getItemKey () {
    return 'gem';
  }

  getItemType () {
    return 'gems';
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    let convCap = planGemLimits.convCap;
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
      throw new NotAuthorized(this.i18n('reachedGoldToGemCap', {convCap: this.convCap}));
    }

    if (user.purchased.plan.gemsBought + this.quantity > this.convCap) {
      throw new NotAuthorized(this.i18n('reachedGoldToGemCapQuantity', {
        convCap: this.convCap,
        quantity: this.quantity,
      }));
    }
  }

  executeChanges (user, item) {
    user.balance += 0.25 * this.quantity;
    user.purchased.plan.gemsBought += this.quantity;

    this.subtractCurrency(user, item);

    return [
      pick(user, splitWhitespace('stats balance')),
      this.i18n('plusGem', {count: this.quantity}),
    ];
  }

  analyticsLabel () {
    return 'purchase gems';
  }
}
