import content from '../../content/index';
import get from 'lodash/get';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';

import {AbstractGoldItemOperation} from './abstractBuyOperation';

export class BuyQuestWithGoldOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return true;
  }

  userAbleToStartMasterClasser (user) {
    return user.achievements.quests.dilatoryDistress3 &&
      user.achievements.quests.mayhemMistiflying3 &&
      user.achievements.quests.stoikalmCalamity3 &&
      user.achievements.quests.taskwoodsTerror3;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(this.i18n('missingKeyParam'));

    if (key === 'lostMasterclasser1' && !this.userAbleToStartMasterClasser(user)) {
      throw new NotAuthorized(this.i18n('questUnlockLostMasterclasser'));
    }

    let item = content.quests[key];

    if (!item) throw new NotFound(this.i18n('questNotFound', {key}));

    if (!(item.category === 'gold' && item.goldValue)) {
      throw new NotAuthorized(this.i18n('questNotGoldPurchasable', {key}));
    }

    super.canUserPurchase(user, item, item.goldValue);
  }

  executeChanges (user, item, req) {
    user.items.quests[item.key] = user.items.quests[item.key] || 0;
    user.items.quests[item.key] += this.quantity;

    this.substractCurrency(user, item.goldValue, this.quantity);

    return [
      user.items.quests,
      this.i18n('messageBought', {
        itemText: item.text(req.language),
      }),
    ];
  }

  analyticsData () {
    return {
      itemKey: this.key,
      itemType: 'Market',
      acquireMethod: 'Gold',
      goldCost: this.item.goldValue,
    };
  }
}
