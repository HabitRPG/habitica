/* eslint-disable max-classes-per-file */
import _merge from 'lodash/merge';
import _get from 'lodash/get';
import i18n from '../../i18n';
import {
  NotAuthorized,
  NotImplementedError,
  BadRequest,
} from '../../libs/errors';
import updateUserBalance from '../updateUserBalance';
import updateUserHourglasses from '../updateUserHourglasses';

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

    const quantity = _get(req, 'quantity');

    this.quantity = quantity ? Number(quantity) : 1;
    if (this.quantity < 1 || !Number.isInteger(this.quantity)) throw new BadRequest(this.i18n('invalidQuantity'));
  }

  /**
   * Returns the item value
   * @param item
   * @returns {number}
   */
  getItemValue (item) { // eslint-disable-line class-methods-use-this
    return item.value;
  }

  /**
   * Returns the item key
   * @param item
   * @returns {String}
   */
  getItemKey (item) { // eslint-disable-line class-methods-use-this
    return item.key;
  }

  /**
   * Returns the item type
   * @param item
   * @returns {String}
   */
  getItemType (item) { // eslint-disable-line class-methods-use-this
    if (!item.type) throw new NotImplementedError('item doesn\'t have a type property');

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
    return i18n.t.apply(null, [...arguments, this.req.language]); // eslint-disable-line prefer-rest-params, max-len
  }

  /**
   * If the Operation allows purchasing items by quantity
   * @returns Boolean
   */
  multiplePurchaseAllowed () { // eslint-disable-line class-methods-use-this
    throw new NotImplementedError('multiplePurchaseAllowed');
  }

  /**
   * Method is called to save the params as class-fields in order to access them
   */
  extractAndValidateParams () { // eslint-disable-line class-methods-use-this
    throw new NotImplementedError('extractAndValidateParams');
  }

  async executeChanges () { // eslint-disable-line class-methods-use-this
    throw new NotImplementedError('executeChanges');
  }

  analyticsData () { // eslint-disable-line class-methods-use-this
    throw new NotImplementedError('sendToAnalytics');
  }

  async purchase () {
    if (!this.multiplePurchaseAllowed() && this.quantity > 1) {
      throw new NotAuthorized(this.i18n('messageNotAbleToBuyInBulk'));
    }

    this.extractAndValidateParams(this.user, this.req);

    const resultObj = await this.executeChanges(this.user, this.item, this.req, this.analytics);

    if (this.analytics) {
      this.sendToAnalytics(this.analyticsData());
    }

    return resultObj;
  }

  analyticsLabel () { // eslint-disable-line class-methods-use-this
    return 'buy';
  }

  sendToAnalytics (additionalData = {}) {
    // spread-operator produces an "unexpected token" error
    const analyticsData = _merge(additionalData, {
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
  canUserPurchase (user, item) {
    this.item = item;
    const itemValue = this.getItemValue(item);

    const userGold = user.stats.gp;

    if (userGold < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n('messageNotEnoughGold'));
    }

    if (item && item.canOwn && !item.canOwn(user)) {
      throw new NotAuthorized(this.i18n('cannotBuyItem'));
    }
  }

  async subtractCurrency (user, item) {
    const itemValue = this.getItemValue(item);

    user.stats.gp -= itemValue * this.quantity;
  }

  analyticsData () {
    return {
      itemKey: this.getItemKey(this.item),
      itemType: this.getItemType(this.item),
      currency: 'Gold',
      goldCost: this.getItemValue(this.item),
    };
  }
}

export class AbstractGemItemOperation extends AbstractBuyOperation {
  canUserPurchase (user, item) {
    this.item = item;
    const itemValue = this.getItemValue(item);

    if (!item.canBuy(user)) {
      throw new NotAuthorized(this.i18n('messageNotAvailable'));
    }

    if (!user.balance || user.balance < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n('notEnoughGems'));
    }
  }

  async subtractCurrency (user, item) {
    const itemValue = this.getItemValue(item);

    await updateUserBalance(user, -(itemValue * this.quantity), 'spend', item.key, item.text());
  }

  analyticsData () {
    return {
      itemKey: this.getItemKey(this.item),
      itemType: this.getItemType(this.item),
      currency: 'Gems',
      gemCost: this.getItemValue(this.item) * 4,
    };
  }
}

export class AbstractHourglassItemOperation extends AbstractBuyOperation {
  canUserPurchase (user, item) {
    this.item = item;

    if (user.purchased.plan.consecutive.trinkets <= 0) {
      throw new NotAuthorized(this.i18n('notEnoughHourglasses'));
    }
  }

  async subtractCurrency (user, item) { // eslint-disable-line class-methods-use-this
    await updateUserHourglasses(user, -1, 'spend', item.key);
  }

  analyticsData () {
    return {
      itemKey: this.item.key,
      currency: 'Hourglass',
    };
  }
}
