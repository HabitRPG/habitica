import i18n from '../../i18n';
import {
  NotAuthorized,
} from '../../libs/errors';

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

    this.extractAndValidateParams();

    let resultObj = this.executeChanges();

    if (this.analytics) {
      this.sendToAnalytics(this.analyticsData());
    }

    return resultObj;
  }

  sendToAnalytics (additionalData) {
    let analyticsData ={
      ...additionalData,
      uuid: this.user._id,
      category: 'behavior',
      headers: this.req.headers,
    };

    if (this.multiplePurchaseAllowed()) {
      analyticsData.quantityPurchased = this.quantity;
    }

    this.analytics.track('acquire item', analyticsData;
  }
}

export class AbstractGoldItemOperation extends AbstractBuyOperation {
  constructor (user, req, analytics) {
    super(user, req, analytics);
  }

  canUserPurchase (item) {
    this.item = item;
    let userGold = this.user.stats.gp;

    if (userGold < item.value * this.quantity) {
      throw new NotAuthorized(this.i18n('messageNotEnoughGold'));
    }

    if (item.canOwn && !item.canOwn(this.user)) {
      throw new NotAuthorized(this.i18n('cannotBuyItem'));
    }
  }
}
