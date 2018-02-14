import content from '../../content/index';
import {
  NotAuthorized,
} from '../../libs/errors';

import {AbstractHourglassItemOperation} from './abstractBuyOperation';
import get from 'lodash/get';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import {BadRequest} from '../../../../server/libs/errors';

export class BuyMountOperation extends AbstractHourglassItemOperation {
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

    super.canUserPurchase(user);
  }

  executeChanges (user) {
    user.items.mounts[this.key] = true;

    this.substractCurrency(user);

    return [
      {items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive},
      this.i18n('hourglassPurchase'),
    ];
  }

  analyticsData () {
    return {
      itemKey: this.key,
      itemType: 'mounts',
      acquireMethod: 'Hourglass',
    };
  }
}
