import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import content from '../../content/index';
import get from 'lodash/get';

import {AbstractGoldItemOperation} from './abstractBuyOperation';
import commonMessages from '../../libs/commonMessages';

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

  getItemValue (item) {
    return item.goldValue;
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(commonMessages('missingKeyParam'));

    if (key === 'lostMasterclasser1' && !this.userAbleToStartMasterClasser(user)) {
      throw new NotAuthorized(this.i18n('questUnlockLostMasterclasser'));
    }

    let item = content.quests[key];

    if (!item) throw new NotFound(commonMessages('questNotFound', {key}));

    if (!(item.category === 'gold' && item.goldValue)) {
      throw new NotAuthorized(this.i18n('questNotGoldPurchasable', {key}));
    }

    this.canUserPurchase(user, item);
  }

  executeChanges (user, item, req) {
    user.items.quests[item.key] = user.items.quests[item.key] || 0;
    user.items.quests[item.key] += this.quantity;

    this.subtractCurrency(user, item, this.quantity);

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
      goldCost: this.getItemValue(this.item.goldValue),
    };
  }
}
