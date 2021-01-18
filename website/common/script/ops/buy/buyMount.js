import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import content from '../../content/index';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import { removeItemByPath } from '../pinnedGearUtils';
import getItemInfo from '../../libs/getItemInfo';

import { AbstractHourglassItemOperation } from './abstractBuyOperation';

export class BuyHourglassMountOperation extends AbstractHourglassItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return false;
  }

  extractAndValidateParams (user, req) {
    this.key = get(req, 'params.key');
    const { key } = this;
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
    user.items.mounts = {
      ...user.items.mounts,
      [this.key]: true,
    };

    if (user.markModified) user.markModified('items.mounts');

    const itemInfo = getItemInfo(user, 'timeTravelersStable', { key: this.key, type: 'mounts' });
    this.subtractCurrency(user);
    removeItemByPath(user, itemInfo.path);

    const message = this.i18n('hourglassPurchase');

    return [
      { items: user.items, purchasedPlanConsecutive: user.purchased.plan.consecutive },
      message,
    ];
  }

  analyticsData () {
    const data = super.analyticsData();
    data.itemType = 'mounts';
    return data;
  }
}
