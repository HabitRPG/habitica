import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import content from '../../content/index';
import get from 'lodash/get';

import {AbstractGoldItemOperation} from './abstractBuyOperation';
import errorMessage from '../../libs/errorMessage';

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

  getItemKey () {
    return this.key;
  }

  getItemValue (item) {
    return item.goldValue;
  }

  getItemType () {
    return 'quest';
  }

  extractAndValidateParams (user, req) {
    let key = this.key = get(req, 'params.key');
    if (!key) throw new BadRequest(errorMessage('missingKeyParam'));

    let item = content.quests[key];

    if (!item) throw new NotFound(errorMessage('questNotFound', {key}));

    if (!(item.category === 'gold' && item.goldValue)) {
      throw new NotAuthorized(this.i18n('questNotGoldPurchasable', {key}));
    }

    this.checkPrerequisites(user, key);

    this.canUserPurchase(user, item);
  }

  checkPrerequisites (user, questKey) {
    const item = content.quests[questKey];
    if (questKey === 'lostMasterclasser1' && !this.userAbleToStartMasterClasser(user)) {
      throw new NotAuthorized(this.i18n('questUnlockLostMasterclasser'));
    }

    if (item && item.previous && !user.achievements.quests[item.previous]) {
      throw new NotAuthorized(this.i18n('mustComplete', {quest: item.previous}));
    }
  }

  executeChanges (user, item, req) {
    if (!user.items.quests[item.key] || user.items.quests[item.key] < 0) user.items.quests[item.key] = 0;
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
