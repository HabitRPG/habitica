import get from 'lodash/get';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import content from '../../content/index';

import errorMessage from '../../libs/errorMessage';
import { AbstractGemItemOperation } from './abstractBuyOperation';

export class BuyQuestWithGemOperation extends AbstractGemItemOperation { // eslint-disable-line import/prefer-default-export, max-len
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    return true;
  }

  getItemKey () {
    return this.key;
  }

  getItemValue (item) { // eslint-disable-line class-methods-use-this
    return item.value / 4;
  }

  getItemType () { // eslint-disable-line class-methods-use-this
    return 'quest';
  }

  extractAndValidateParams (user, req) {
    this.key = get(req, 'params.key');
    const { key } = this;
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    const item = content.quests[key];

    if (!item) throw new NotFound(errorMessage('questNotFound', { key }));

    if (item.category === 'gold') {
      throw new NotAuthorized(this.i18n('questNotGemPurchasable', { key }));
    }

    this.canUserPurchase(user, item);
  }

  canUserPurchase (user, item) {
    if (item && item.prereqQuests) {
      for (const prereq of item.prereqQuests) {
        if (!user.achievements.quests[prereq]) {
          throw new NotAuthorized(this.i18n('mustComplete', { quest: prereq }));
        }
      }
    }

    super.canUserPurchase(user, item);
  }

  async executeChanges (user, item, req) {
    if (
      !user.items.quests[item.key]
      || user.items.quests[item.key] < 0
    ) user.items.quests[item.key] = 0;
    user.items.quests = {
      ...user.items.quests,
      [item.key]: user.items.quests[item.key] + this.quantity,
    };
    if (user.markModified) user.markModified('items.quests');

    await this.subtractCurrency(user, item, this.quantity);

    return [
      user.items.quests,
      this.i18n('messageBought', {
        itemText: item.text(req.language),
      }),
    ];
  }
}
