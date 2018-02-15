import i18n from '../../i18n';
import {
  NotAuthorized,
} from '../../libs/errors';
import _merge from 'lodash/merge';

export class NotImplementedError extends Error {
  constructor (str) {
    super(`Method: '${str}' not implemented`);
  }
}

export class AbstractBuyOperation {
  /**
   * @param {User} user - the User-Object
   * @param {Request} req - the Request-Object
   * @param {analytics} analytics
   */
  constructor (user, req, analytics) {
    this.user = user;
    this.req = req;
    this.analytics = analytics;

    this.quantity = this.req.quantity || 1;
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

    this.analytics.track('acquire item', analyticsData);
  }
}

export class AbstractGoldItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  getItemValue (item) {
    return item.value;
  }

  canUserPurchase (user, item) {
    this.item = item;
    let itemValue = this.getItemValue(item);

    let userGold = user.stats.gp;

    if (userGold < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n('messageNotEnoughGold'));
    }

    if (item.canOwn && !item.canOwn(user)) {
      throw new NotAuthorized(this.i18n('cannotBuyItem'));
    }
  }

  substractCurrency (user, item, quantity = 1) {
    let itemValue = this.getItemValue(item);

    user.stats.gp -= itemValue * quantity;
  }
}

export class AbstractGemItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  getItemValue (item) {
    return item.value;
  }

  canUserPurchase (user, item, itemValue = -1) {
    this.item = item;

    if (!item.canBuy(user)) {
      throw new NotAuthorized(this.i18n('messageNotAvailable'));
    }

    if (!user.balance || user.balance < itemValue * this.quantity) {
      throw new NotAuthorized(this.i18n.t('notEnoughGems'));
    }
  }

  substractCurrency (user, item, quantity = 1) {
    let itemValue = this.getItemValue(item);

    user.balance -= itemValue * quantity;
  }
}

export class AbstractHourglassItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  canUserPurchase (user, item) {
    this.item = item;

    if (user.purchased.plan.consecutive.trinkets <= 0) {
      throw new NotAuthorized(this.i18n('notEnoughHourglasses'));
    }
  }

  substractCurrency (user) {
    user.purchased.plan.consecutive.trinkets--;
  }
}

// todo
// for items like quests which can be purchased by gold and gem
export class AbstractHybridItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  setCurrency (type) {
    switch (type) {
      case 'gem':
        this.currencyOperation = new AbstractGemItemOperation(this.user, this.req);
        break;
      case 'hourglass':
        this.currencyOperation = new AbstractHourglassItemOperation(this.user, this.req);
        break;
      default:
        this.currencyOperation = new AbstractGoldItemOperation(this.user, this.req);
        break;
    }
  }

  canUserPurchase (user, item) {
    if (!this.currencyOperation) {
      throw new Error('no currencyOperation');
    }

    return this.currencyOperation.canUserPurchase(user, item);
  }

  substractCurrency (user, item, quantity = 1) {
    if (!this.currencyOperation) {
      throw new Error('no currencyOperation');
    }

    return this.currencyOperation.substractCurrency(user, item, quantity);
  }
}
