import get from 'lodash/get';
import pick from 'lodash/pick';
import content from '../../content/index';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotFound,
} from '../../libs/errors';
import { AbstractGoldItemOperation } from './abstractBuyOperation';
import errorMessage from '../../libs/errorMessage';

export class BuySpellOperation extends AbstractGoldItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  getItemKey () {
    return this.key;
  }

  getItemType () { // eslint-disable-line class-methods-use-this
    return 'spell';
  }

  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return true;
  }

  extractAndValidateParams (user, req) {
    this.key = get(req, 'params.key');
    const { key } = this;
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    const item = content.special[key];
    if (!item) throw new NotFound(errorMessage('spellNotFound', { spellId: key }));

    this.canUserPurchase(user, item);
  }

  executeChanges (user, item, req) {
    user.items.special[item.key] += this.quantity;

    this.subtractCurrency(user, item, this.quantity);

    return [
      pick(user, splitWhitespace('items stats')),
      this.i18n('messageBought', {
        itemText: item.text(req.language),
      }),
    ];
  }
}
