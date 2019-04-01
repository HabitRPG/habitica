import content from '../../content/index';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import count from '../../count';
import splitWhitespace from '../../libs/splitWhitespace';
import {
  NotAuthorized,
} from '../../libs/errors';
import randomVal from '../../libs/randomVal';
import {removeItemByPath} from '../pinnedGearUtils';
import {AbstractGoldItemOperation} from './abstractBuyOperation';

// TODO this is only used on the server
// move out of common?

const YIELD_EQUIPMENT_THRESHOLD = 0.6;
const YIELD_FOOD_THRESHOLD = 0.8;

export class BuyArmoireOperation extends AbstractGoldItemOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  multiplePurchaseAllowed () {
    return false;
  }

  extractAndValidateParams (user) {
    let item = content.armoire;

    this.canUserPurchase(user, item);
  }

  executeChanges (user, item) {
    let result = {};

    let armoireResult = randomVal.trueRandom();
    let eligibleEquipment = filter(content.gear.flat, (eligible) => {
      return eligible.klass === 'armoire' && !user.items.gear.owned[eligible.key];
    });
    let armoireHasEquipment = !isEmpty(eligibleEquipment);

    if (armoireHasEquipment && (armoireResult < YIELD_EQUIPMENT_THRESHOLD || !user.flags.armoireOpened)) {
      result = this._gearResult(user, eligibleEquipment);
    } else if ((armoireHasEquipment && armoireResult < YIELD_FOOD_THRESHOLD) || armoireResult < 0.5) { // eslint-disable-line no-extra-parens
      result = this._foodResult(user);
    } else {
      result = this._experienceResult(user);
    }

    this.subtractCurrency(user, item);

    let {message, armoireResp} = result;

    if (!message) {
      message = this.i18n('messageBought', {
        itemText: this.item.text(this.req.language),
      });
    }

    let resData = pick(user, splitWhitespace('items flags'));
    if (armoireResp) resData.armoire = armoireResp;

    return [
      resData,
      message,
    ];
  }

  _trackDropAnalytics (userId, key) {
    this.analytics.track(
      'dropped item',
      {
        uuid: userId,
        itemKey: key,
        acquireMethod: 'Armoire',
        category: 'behavior',
        headers: this.req.headers,
      },
    );
  }

  _gearResult (user, eligibleEquipment) {
    eligibleEquipment.sort();
    let drop = randomVal(eligibleEquipment);

    if (user.items.gear.owned[drop.key]) {
      throw new NotAuthorized(this.i18n('equipmentAlreadyOwned'));
    }

    user.items.gear.owned[drop.key] = true;
    if (user.markModified) user.markModified('items.gear.owned');

    user.flags.armoireOpened = true;
    let message = this.i18n('armoireEquipment', {
      image: `<span class="shop_${drop.key} pull-left"></span>`,
      dropText: drop.text(this.req.language),
    });

    if (count.remainingGearInSet(user.items.gear.owned, 'armoire') === 0) {
      user.flags.armoireEmpty = true;
    }

    removeItemByPath(user, `gear.flat.${drop.key}`);

    if (this.analytics) {
      this._trackDropAnalytics(user._id, drop.key);
    }

    let armoireResp = {
      type: 'gear',
      dropKey: drop.key,
      dropText: drop.text(this.req.language),
    };

    return {
      message,
      armoireResp,
    };
  }

  _foodResult (user) {
    let drop = randomVal(filter(content.food, {
      canDrop: true,
    }));

    user.items.food[drop.key] = user.items.food[drop.key] || 0;
    user.items.food[drop.key] += 1;
    if (user.markModified) user.markModified('items.food');

    if (this.analytics) {
      this._trackDropAnalytics(user._id, drop.key);
    }

    return {
      message: this.i18n('armoireFood', {
        image: `<span class="Pet_Food_${drop.key} pull-left"></span>`,
        dropText: drop.text(this.req.language),
      }),
      armoireResp: {
        type: 'food',
        dropKey: drop.key,
        dropText: drop.textA(this.req.language),
      },
    };
  }

  _experienceResult (user) {
    let armoireExp = Math.floor(randomVal.trueRandom() * 40 + 10);
    user.stats.exp += armoireExp;

    return {
      message: this.i18n('armoireExp'),
      armoireResp: {
        type: 'experience',
        value:
        armoireExp,
      },
    };
  }
}
