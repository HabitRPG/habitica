import _ from 'lodash' ;
import analytics from '../../../libs/api-v3/analyticsService';
import async from 'async';
import cc from 'coupon-code';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from '../../../libs/api-v3/email';
import members from '../members';
import moment from 'moment';
import mongoose from 'mongoose';
import nconf from 'nconf';
import pushNotify from '../../../libs/api-v3/pushNotifications';
import shared from '../../../../../common' ;

import amazon from './amazon';
import iap from './iap';
import paypal from './paypal';
import stripe from './stripe';

const IS_PROD = nconf.get('NODE_ENV') === 'production';

let api = {};

function revealMysteryItems (user) {
  _.each(shared.content.gear.flat, function findMysteryItems (item) {
    if (
      item.klass === 'mystery' &&
        moment().isAfter(shared.content.mystery[item.mystery].start) &&
        moment().isBefore(shared.content.mystery[item.mystery].end) &&
        !user.items.gear.owned[item.key] &&
        user.purchased.plan.mysteryItems.indexOf(item.key) !== -1
      ) {
      user.purchased.plan.mysteryItems.push(item.key);
    }
  });
}

api.createSubscription = function createSubscription (data, cb) {
  let recipient = data.gift ? data.gift.member : data.user;
  let plan = recipient.purchased.plan;
  let block = shared.content.subscriptionBlocks[data.gift ? data.gift.subscription.key : data.sub.key];
  let months = Number(block.months);

  if (data.gift) {
    if (plan.customerId && !plan.dateTerminated) { // User has active plan
      plan.extraMonths += months;
    } else {
      plan.dateTerminated = moment(plan.dateTerminated).add({months}).toDate();
      if (!plan.dateUpdated) plan.dateUpdated = new Date();
    }
    if (!plan.customerId) plan.customerId = 'Gift'; // don't override existing customer, but all sub need a customerId
  } else {
    _(plan).merge({ // override with these values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: new Date(),
      gemsBought: 0,
      paymentMethod: data.paymentMethod,
      extraMonths: Number(plan.extraMonths) +
        Number(plan.dateTerminated ? moment(plan.dateTerminated).diff(new Date(), 'months', true) : 0),
      dateTerminated: null,
      // Specify a lastBillingDate just for Amazon Payments
      // Resetted every time the subscription restarts
      lastBillingDate: data.paymentMethod === 'Amazon Payments' ? new Date() : undefined,
    }).defaults({ // allow non-override if a plan was previously used
      dateCreated: new Date(),
      mysteryItems: [],
    }).value();
  }

  // Block sub perks
  let perks = Math.floor(months / 3);
  if (perks) {
    plan.consecutive.offset += months;
    plan.consecutive.gemCapExtra += perks * 5;
    if (plan.consecutive.gemCapExtra > 25) plan.consecutive.gemCapExtra = 25;
    plan.consecutive.trinkets += perks;
  }
  revealMysteryItems(recipient);
  if (IS_PROD) {
    if (!data.gift) txnEmail(data.user, 'subscription-begins');

    let analyticsData = {
      uuid: data.user._id,
      itemPurchased: 'Subscription',
      sku: `${data.paymentMethod.toLowerCase()}-subscription`,
      purchaseType: 'subscribe',
      paymentMethod: data.paymentMethod,
      quantity: 1,
      gift: Boolean(data.gift),
      purchaseValue: block.price,
    };
    analytics.trackPurchase(analyticsData);
  }
  data.user.purchased.txnCount++;
  if (data.gift) {
    members.sendMessage(data.user, data.gift.member, data.gift);

    let byUserName = getUserInfo(data.user, ['name']).name;

    if (data.gift.member.preferences.emailNotifications.giftedSubscription !== false) {
      txnEmail(data.gift.member, 'gifted-subscription', [
        {name: 'GIFTER', content: byUserName},
        {name: 'X_MONTHS_SUBSCRIPTION', content: months},
      ]);
    }

    if (data.gift.member._id !== data.user._id) { // Only send push notifications if sending to a user other than yourself
      pushNotify.sendNotify(data.gift.member, shared.i18n.t('giftedSubscription'), `${months} months - by ${byUserName}`);
    }
  }
  async.parallel([
    function saveGiftingUserData (cb2) {
      data.user.save(cb2);
    },
    function saveRecipientUserData (cb2) {
      if (data.gift) {
        data.gift.member.save(cb2);
      } else {
        cb2(null);
      }
    },
  ], cb);
};

/**
 * Sets their subscription to be cancelled later
 */
api.cancelSubscription = function cancelSubscription (data, cb) {
  let plan = data.user.purchased.plan;
  let now = moment();
  let remaining = data.nextBill ? moment(data.nextBill).diff(new Date(), 'days') : 30;

  plan.dateTerminated =
    moment(`${now.format('MM')}/${moment(plan.dateUpdated).format('DD')}/${now.format('YYYY')}`)
    .add({days: remaining}) // end their subscription 1mo from their last payment
    .add({months: Math.ceil(plan.extraMonths)})// plus any extra time (carry-over, gifted subscription, etc) they have. FIXME: moment can't add months in fractions...
    .toDate();
  plan.extraMonths = 0; // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated

  data.user.save(cb);
  txnEmail(data.user, 'cancel-subscription');
  let analyticsData = {
    uuid: data.user._id,
    gaCategory: 'commerce',
    gaLabel: data.paymentMethod,
    paymentMethod: data.paymentMethod,
  };
  analytics.track('unsubscribe', analyticsData);
};

api.buyGems = function buyGems (data, cb) {
  let amt = data.amount || 5;
  amt = data.gift ? data.gift.gems.amount / 4 : amt;
  (data.gift ? data.gift.member : data.user).balance += amt;
  data.user.purchased.txnCount++;
  if (IS_PROD) {
    if (!data.gift) txnEmail(data.user, 'donation');

    let analyticsData = {
      uuid: data.user._id,
      itemPurchased: 'Gems',
      sku: `${data.paymentMethod.toLowerCase()}-checkout`,
      purchaseType: 'checkout',
      paymentMethod: data.paymentMethod,
      quantity: 1,
      gift: Boolean(data.gift),
      purchaseValue: amt,
    };
    analytics.trackPurchase(analyticsData);
  }

  if (data.gift) {
    let byUsername = getUserInfo(data.user, ['name']).name;
    let gemAmount = data.gift.gems.amount || 20;

    members.sendMessage(data.user, data.gift.member, data.gift);
    if (data.gift.member.preferences.emailNotifications.giftedGems !== false) {
      txnEmail(data.gift.member, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount},
      ]);
    }

    if (data.gift.member._id !== data.user._id) { // Only send push notifications if sending to a user other than yourself
      pushNotify.sendNotify(data.gift.member, shared.i18n.t('giftedGems'), `${gemAmount}  Gems - by ${byUsername}`);
    }
  }
  async.parallel([
    function saveGiftingUserData (cb2) {
      data.user.save(cb2);
    },
    function saveRecipientUserData (cb2) {
      if (data.gift) {
        data.gift.member.save(cb2);
      } else {
        cb2(null);
      }
    },
  ], cb);
};

api.validCoupon = function validCoupon (req, res, next) {
  mongoose.model('Coupon').findOne({_id: cc.validate(req.params.code), event: 'google_6mo'}, function couponErrorCheck (err, coupon) {
    if (err) return next(err);
    if (!coupon) return res.status(401).json({err: 'Invalid coupon code'});
    return res.sendStatus(200);
  });
};

api.stripeCheckout = stripe.checkout;
api.stripeSubscribeCancel = stripe.subscribeCancel;
api.stripeSubscribeEdit = stripe.subscribeEdit;

api.paypalSubscribe = paypal.createBillingAgreement;
api.paypalSubscribeSuccess = paypal.executeBillingAgreement;
api.paypalSubscribeCancel = paypal.cancelSubscription;
api.paypalCheckout = paypal.createPayment;
api.paypalCheckoutSuccess = paypal.executePayment;
api.paypalIPN = paypal.ipn;

api.amazonVerifyAccessToken = amazon.verifyAccessToken;
api.amazonCreateOrderReferenceId = amazon.createOrderReferenceId;
api.amazonCheckout = amazon.checkout;
api.amazonSubscribe = amazon.subscribe;
api.amazonSubscribeCancel = amazon.subscribeCancel;

api.iapAndroidVerify = iap.androidVerify;
api.iapIosVerify = iap.iosVerify;

module.exports = api;
