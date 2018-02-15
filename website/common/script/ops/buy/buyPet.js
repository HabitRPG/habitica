import content from '../../content/index';
import {
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';

import {AbstractHourglassItemOperation} from './abstractBuyOperation';
import get from 'lodash/get';
import keys from 'lodash/keys';
import includes from 'lodash/includes';

export class BuyPetOperation extends AbstractHourglassItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    if (!includes(keys(content.timeTravelStable.pets), key)) {
      throw new NotAuthorized(this.i18n('notAllowedHourglass'));
    }

    if (user.items.pets[key]) {
      throw new NotAuthorized(this.i18n('petsAlreadyOwned'));
    }

    super.canUserPurchase(user);
  }

  executeChanges (user) {
    user.items.pets[this.key] = 5;

    this.substractCurrency(user);

    return [
      {items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive},
      this.i18n('hourglassPurchase'),
    ];
  }

  analyticsData () {
    return super.analyticsData('pets');
  }
}
