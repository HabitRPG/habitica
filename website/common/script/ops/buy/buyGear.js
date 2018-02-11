import content from '../../content/index';
import i18n from '../../i18n';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../libs/errors';
import handleTwoHanded from '../../fns/handleTwoHanded';
import ultimateGear from '../../fns/ultimateGear';

import {removePinnedGearAddPossibleNewOnes} from '../pinnedGearUtils';

import {AbstractBuyOperation} from './abstractBuyOperation';

export class BuyGearOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  extractAndValidateParams () {
    let language = this.req.language;

    let key = this.key = get(this.req, 'params.key');
    if (!key) throw new BadRequest(i18n.t('missingKeyParam', language));

    let item = this.item = content.gear.flat[key];

    if (!item) throw new NotFound(i18n.t('itemNotFound', {key}, language));

    if (this.user.stats.gp < item.value) {
      throw new NotAuthorized(i18n.t('messageNotEnoughGold', language));
    }

    if (item.canOwn && !item.canOwn(this.user)) {
      throw new NotAuthorized(i18n.t('cannotBuyItem', language));
    }

    if (this.user.items.gear.owned[item.key]) {
      throw new NotAuthorized(i18n.t('equipmentAlreadyOwned', language));
    }

    let itemIndex = Number(item.index);

    if (Number.isInteger(itemIndex) && content.classes.includes(item.klass)) {
      let previousLevelGear = key.replace(/[0-9]/, itemIndex - 1);
      let hasPreviousLevelGear = this.user.items.gear.owned[previousLevelGear];
      let checkIndexToType = itemIndex > (item.type === 'weapon' || item.type === 'shield' && item.klass === 'rogue' ? 0 : 1);

      if (checkIndexToType && !hasPreviousLevelGear) {
        throw new NotAuthorized(i18n.t('previousGearNotOwned', language));
      }
    }
  }

  executeChanges () {
    let message;

    if (this.user.preferences.autoEquip) {
      this.user.items.gear.equipped[this.item.type] = this.item.key;
      message = handleTwoHanded(this.user, this.item, undefined, this.req);
    }

    removePinnedGearAddPossibleNewOnes(this.user, `gear.flat.${this.item.key}`, this.item.key);

    if (this.item.last) ultimateGear(this.user);

    this.user.stats.gp -= this.item.value;

    if (!message) {
      message = i18n.t('messageBought', {
        itemText: this.item.text(this.req.language),
      }, this.req.language);
    }

    return [
      pick(this.user, splitWhitespace('items achievements stats flags')),
      message,
    ];
  }

  sendToAnalytics () {
    this.analytics.track('acquire item', {
      uuid: this.user._id,
      itemKey: this.key,
      acquireMethod: 'Gold',
      goldCost: this.item.value,
      category: 'behavior',
      headers: this.req.headers,
    });
  }
}
