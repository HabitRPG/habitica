import get from 'lodash/get';
import {
  BadRequest,
  NotFound,
} from '../../libs/errors';
import content from '../../content/index';

import errorMessage from '../../libs/errorMessage';
import { AbstractGemItemOperation } from './abstractBuyOperation';

export class BuyPetWithGemOperation extends AbstractGemItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return false;
  }

  getItemKey () {
    return this.key;
  }

  getItemValue (item) { // eslint-disable-line class-methods-use-this
    return item.value / 4;
  }

  getItemType () { // eslint-disable-line class-methods-use-this
    return 'pet';
  }

  extractAndValidateParams (user, req) {
    this.key = get(req, 'params.key');
    const { key } = this;
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    const item = content.petInfo[key];

    if (!item) throw new NotFound(errorMessage('petNotFound', { key }));

    this.canUserPurchase(user, item);
  }

  canUserPurchase (user, item) {
    if (item && user.items.pets[item.key]) {
      throw new BadRequest(this.i18n('petsAlreadyOwned'));
    }

    super.canUserPurchase(user, item);
  }

  async executeChanges (user, item, req) {
    user.items.pets[item.key] = 5;
    if (user.markModified) user.markModified('items.pets');

    await this.subtractCurrency(user, item);

    return [
      user.items.pets,
      this.i18n('messageBought', {
        itemText: item.text(req.language),
      }),
    ];
  }
}
