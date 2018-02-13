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

  extractAndValidateParams () {
    let item = content.potion;
    let userHp = this.user.stats.hp;

    super.canUserPurchase(item);

    if (userHp >= 50) {
      throw new NotAuthorized(this.i18n('messageHealthAlreadyMax'));
    }

    if (userHp <= 0) {
      throw new NotAuthorized(this.i18n('messageHealthAlreadyMin'));
    }
  }

  executeChanges () {
    this.user.stats.hp += 15 * this.quantity;
    if (this.user.stats.hp > 50) {
      this.user.stats.hp = 50;
    }

    this.user.stats.gp -= this.item.value * this.quantity;

    let message = this.i18n('messageBought', {
      itemText: this.item.text(this.req.language),
    });

    return [
      this.user.stats,
      message,
    ];
  }

  analyticsData () {
    return {
      itemKey: 'Potion',
      acquireMethod: 'Gold',
      goldCost: this.item.value,
    };
  }
}
