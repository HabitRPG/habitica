import i18n from '../../i18n';
import {
  NotAuthorized,
  NotImplementedError,
  BadRequest,
} from '../../libs/errors';
import _merge from 'lodash/merge';
import _get from 'lodash/get';

export class AbstractBuyOperation {
  /**
   * @param {User} user - the User-Object
   * @param {Request} req - the Request-Object
   * @param {analytics} analytics
   */
  constructor (user, req, analytics) {
    this.user = user;
    this.req = req || {};
    this.analytics = analytics;

    let quantity = _get(req, 'quantity');

    this.quantity = quantity ? Number(quantity) : 1;
    if (this.quantity < 1 || !Number.isInteger(this.quantity)) throw new BadRequest(this.i18n('invalidQuantity'));
  }

  /**
   * Returns the item value
   * @param item
   * @returns {number}
   */
  getItemValue (item) {
    return item.value;
  }

  /**
   * Returns the item key
   * @param item
   * @returns {String}
   */
  getItemKey (item) {
    return item.key;
  }

  /**
   * Returns the item type
   * @param item
   * @returns {String}
   */
  getItemType (item) {
    if (!item.type)
      throw new NotImplementedError('item doesn\'t have a type property');

    return item.type;
  }

  /**
   * Shortcut to get the translated string without passing `req.language`
   * @param {String} key - translation key
   * @param {*=} params
   * @returns {*|string}
   */
  // eslint-disable-next-line no-unused-vars
  i18n (key, params = {}) {
    return i18n.t.apply(null, [...arguments, this.req.language]);
  }

  /**
   * If the Operation allows purchasing items by quantity
   * @returns Boolean
   */
  multiplePurchaseAllowed () {
    throw new NotImplementedError('multiplePurchaseAllowed');
  }

  /**
   * Method is called to save the params as class-fields in order to access them
   */
  extractAndValidateParams () {
    throw new NotImplementedError('extractAndValidateParams');
  }

  executeChanges () {
    throw new NotImplementedError('executeChanges');
  }

  analyticsData () {
    throw new NotImplementedError('sendToAnalytics');
  }

  purchase () {
    if (!this.multiplePurchaseAllowed() && this.quantity > 1) {
      throw new NotAuthorized(this.i18n('messageNotAbleToBuyInBulk'));
    }

    this.extractAndValidateParams(this.user, this.req);

    let resultObj = this.executeChanges(this.user, this.item, this.req);

    if (this.analytics) {
      this.sendToAnalytics(this.analyticsData());
    }

    return resultObj;
  }

  analyticsLabel () {
    return 'acquire item';
  }

  sendToAnalytics (additionalData = {}) {
    // spread-operator produces an "unexpected token" error
    let analyticsData = _merge(additionalData, {
      // ...additionalData,
      uuid: this.user._id,
      category: 'behavior',
      headers: this.req.headers,
    });

    if (this.multiplePurchaseAllowed()) {
      analyticsData.quantityPurchased = this.quantity;
    }

    this.analytics.track(this.analyticsLabel(), analyticsData);
  }
}

export class AbstractGoldItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  canUserPurchase (user, item) {
    this.item = item;
    let itemValue = this.getItemValue(item);

    let userGold = user.stats.gp;

    if (userGold < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n('messageNotEnoughGold'));
    }

    if (item && item.canOwn && !item.canOwn(user)) {
      throw new NotAuthorized(this.i18n('cannotBuyItem'));
    }
  }

  subtractCurrency (user, item) {
    let itemValue = this.getItemValue(item);

    user.stats.gp -= itemValue * this.quantity;
  }

  analyticsData () {
    return {
      itemKey: this.getItemKey(this.item),
      itemType: this.getItemType(this.item),
      acquireMethod: 'Gold',
      goldCost: this.getItemValue(this.item),
    };
  }
}

export class AbstractGemItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  canUserPurchase (user, item) {
    this.item = item;
    let itemValue = this.getItemValue(item);

    if (!item.canBuy(user)) {
      throw new NotAuthorized(this.i18n('messageNotAvailable'));
    }

    if (!user.balance || user.balance < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n('notEnoughGems'));
    }
  }

  subtractCurrency (user, item) {
    let itemValue = this.getItemValue(item);

    user.balance -= itemValue * this.quantity;
  }

  analyticsData () {
    return {
      itemKey: this.getItemKey(this.item),
      itemType: this.getItemType(this.item),
      acquireMethod: 'Gems',
      gemCost: this.getItemValue(this.item) * 4,
    };
  }
}
