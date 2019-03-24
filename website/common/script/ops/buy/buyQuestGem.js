import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import content from '../../content/index';
import get from 'lodash/get';

import errorMessage from '../../libs/errorMessage';
import {AbstractGemItemOperation} from './abstractBuyOperation';

export class BuyQuestWithGemOperation extends AbstractGemItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return true;
  }

  getItemKey () {
    return this.key;
  }

  getItemValue (item) {
    return item.value / 4;
  }

  getItemType () {
    return 'quest';
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    let item = content.quests[key];

    if (!item) throw new NotFound(errorMessage('questNotFound', {key}));

    if (item.category === 'gold') {
      throw new NotAuthorized(this.i18n('questNotGemPurchasable', {key}));
    }

    this.canUserPurchase(user, item);
  }

  executeChanges (user, item, req) {
    user.items.quests[item.key] = user.items.quests[item.key] || 0;
    user.items.quests[item.key] += this.quantity;
    if (user.markModified) user.markModified('items.quests');

    this.subtractCurrency(user, item, this.quantity);

    return [
      user.items.quests,
      this.i18n('messageBought', {
        itemText: item.text(req.language),
      }),
    ];
  }
}
