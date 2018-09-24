import content from '../../content/index';
import {
  NotAuthorized,
} from '../../libs/errors';

import { AbstractGoldItemOperation} from './abstractBuyOperation';

export class BuyHealthPotionOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return true;
  }

  extractAndValidateParams (user) {
    let item = content.potion;
    let userHp = user.stats.hp;

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

    let message = this.i18n('messageBought', {
      itemText: this.item.text(this.req.language),
    });

    return [
      this.user.stats,
      message,
    ];
  }
}
