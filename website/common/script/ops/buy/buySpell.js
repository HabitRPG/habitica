import content from '../../content/index';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotFound,
} from '../../libs/errors';
import {AbstractGoldItemOperation} from './abstractBuyOperation';

export class BuySpellOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  getItemKey () {
    return this.key;
  }

  multiplePurchaseAllowed () {
    return true;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    let item = content.special[key];
    if (!item) throw new NotFound(this.i18n('spellNotFound', {spellId: key}));

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
