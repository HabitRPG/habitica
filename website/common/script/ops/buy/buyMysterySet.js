import get from 'lodash/get';
import each from 'lodash/each';
import merge from 'lodash/merge';
import {
  BadRequest,
  NotFound,
} from '../../libs/errors';

import content from '../../content/index';

import {AbstractHourglassItemOperation} from './abstractBuyOperation';

export class BuyMysterySetOperation extends AbstractHourglassItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    let ref = content.timeTravelerStore(user);
    let mysterySet = ref ? ref[key] : undefined;

    if (!mysterySet) {
      throw new NotFound(this.i18n('mysterySetNotFound'));
    }

    super.canUserPurchase(user, merge({key}, mysterySet));
  }

  executeChanges (user, item) {
    each(item.items, gear => {
      user.items.gear.owned[gear.key] = true;
    });

    this.substractCurrency(user);

    return [
      {items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive},
      this.i18n('hourglassPurchaseSet'),
    ];
  }

  analyticsData () {
    return super.analyticsData('Subscriber Gear Set');
  }
}
