import content from '../../content/index';
import {
  NotAuthorized,
} from '../../libs/errors';

import { AbstractGoldItemOperation } from './abstractBuyOperation';

export class BuyHealthPotionOperation extends AbstractGoldItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return true;
  }

  extractAndValidateParams (user) {
    const item = content.potion;
    const userHp = user.stats.hp;

    super.canUserPurchase(user, item);

    if (userHp >= 50) {
      throw new NotAuthorized(this.i18n('messageHealthAlreadyMax'));
    }

    if (userHp <= 0) {
      throw new NotAuthorized(this.i18n('messageHealthAlreadyMin'));
    }
  }

  executeChanges (user, item) {
    user.stats.hp += 15 * this.quantity;
    if (user.stats.hp > 50) {
      user.stats.hp = 50;
    }

    this.subtractCurrency(user, item, this.quantity);

    const message = this.i18n('messageBought', {
      itemText: this.item.text(this.req.language),
    });

    return [
      this.user.stats,
      message,
    ];
  }
}
