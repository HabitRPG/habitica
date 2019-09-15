import content from '../../content/index';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';

import {AbstractHourglassItemOperation} from './abstractBuyOperation';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';

export class BuyHourglassMountOperation extends AbstractHourglassItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));


    if (!includes(keys(content.timeTravelStable.mounts), key)) {
      throw new NotAuthorized(this.i18n('notAllowedHourglass'));
    }

    if (user.items.mounts[key]) {
      throw new NotAuthorized(this.i18n('mountsAlreadyOwned'));
    }

    this.canUserPurchase(user, {
      key,
    });
  }

  executeChanges (user) {
    user.items.mounts[this.key] = true;

    if (user.markModified) user.markModified('items.mounts');

    this.subtractCurrency(user);

    let message = this.i18n('hourglassPurchase');

    return [
      { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
      message,
    ];
  }

  analyticsData () {
    let data = super.analyticsData();
    data.itemType = 'mounts';
    return data;
  }
}
