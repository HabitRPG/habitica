import _ from 'lodash' ;
import analytics from './analyticsService';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from './email';
import moment from 'moment';
import { sendNotification as sendPushNotification } from './pushNotifications';
import shared from '../../common' ;

let api = {};

function revealMysteryItems (user) {
  _.each(shared.content.gear.flat, function findMysteryItems (item) {
    if (
      item.klass === 'mystery' &&
        moment().isAfter(shared.content.mystery[item.mystery].start) &&
        moment().isBefore(shared.content.mystery[item.mystery].end) &&
        !user.items.gear.owned[item.key] &&
        user.purchased.plan.mysteryItems.indexOf(item.key) === -1
      ) {
      user.purchased.plan.mysteryItems.push(item.key);
    }
  });
}

function _dateDiff (earlyDate, lateDate) {
  if (!earlyDate || !lateDate || moment(lateDate).isBefore(earlyDate)) return 0;

  return moment(lateDate).diff(earlyDate, 'months', true);
}

api.createSubscription = async function createSubscription (data) {
  let recipient = data.gift ? data.gift.member : data.user;
  let plan = recipient.purchased.plan;
  let block = shared.content.subscriptionBlocks[data.gift ? data.gift.subscription.key : data.sub.key];
  let months = Number(block.months);
  let today = new Date();

  if (data.gift) {
    if (plan.customerId && !plan.dateTerminated) { // User has active plan
      plan.extraMonths += months;
    } else {
      if (!plan.dateUpdated) plan.dateUpdated = today;
      if (moment(plan.dateTerminated).isAfter()) {
        plan.dateTerminated = moment(plan.dateTerminated).add({months}).toDate();
      } else {
        plan.dateTerminated = moment().add({months}).toDate();
      }
    }

    if (!plan.customerId) plan.customerId = 'Gift'; // don't override existing customer, but all sub need a customerId
  } else {
    if (!plan.dateTerminated) plan.dateTerminated = today;

    _(plan).merge({ // override with these values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: today,
      paymentMethod: data.paymentMethod,
      extraMonths: Number(plan.extraMonths) + _dateDiff(today, plan.dateTerminated),
      dateTerminated: null,
      // Specify a lastBillingDate just for Amazon Payments
      // Resetted every time the subscription restarts
      lastBillingDate: data.paymentMethod === 'Amazon Payments' ? today : undefined,
    }).defaults({ // allow non-override if a plan was previously used
      gemsBought: 0,
      dateCreated: today,
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

  if (!data.gift) {
    txnEmail(data.user, 'subscription-begins');
  }

  analytics.trackPurchase({
    uuid: data.user._id,
    itemPurchased: 'Subscription',
    sku: `${data.paymentMethod.toLowerCase()}-subscription`,
    purchaseType: 'subscribe',
    paymentMethod: data.paymentMethod,
    quantity: 1,
    gift: Boolean(data.gift),
    purchaseValue: block.price,
    headers: data.headers,
  });

  data.user.purchased.txnCount++;

  if (data.gift) {
    let message = `\`Hello ${data.gift.member.profile.name}, ${data.user.profile.name} has sent you ${shared.content.subscriptionBlocks[data.gift.subscription.key].months} months of subscription!\``;
    if (data.gift.message) message += ` ${data.gift.message}`;

    data.user.sendMessage(data.gift.member, message);

    let byUserName = getUserInfo(data.user, ['name']).name;

    if (data.gift.member.preferences.emailNotifications.giftedSubscription !== false) {
      txnEmail(data.gift.member, 'gifted-subscription', [
        {name: 'GIFTER', content: byUserName},
        {name: 'X_MONTHS_SUBSCRIPTION', content: months},
      ]);
    }

    if (data.gift.member._id !== data.user._id) { // Only send push notifications if sending to a user other than yourself
      if (data.gift.member.preferences.pushNotifications.giftedSubscription !== false) {
        sendPushNotification(data.gift.member,
          {
            title: shared.i18n.t('giftedSubscription'),
            message: shared.i18n.t('giftedSubscriptionInfo', {months, name: byUserName}),
            identifier: 'giftedSubscription',
            payload: {replyTo: data.user._id},
          }
        );
      }
    }
  }

  await data.user.save();
  if (data.gift) await data.gift.member.save();
};

// Sets their subscription to be cancelled later
api.cancelSubscription = async function cancelSubscription (data) {
  let plan = data.user.purchased.plan;
  let now = moment();
  let remaining = data.nextBill ? moment(data.nextBill).diff(new Date(), 'days') : 30;
  let extraDays = Math.ceil(30.5 * plan.extraMonths);
  let nowStr = `${now.format('MM')}/${moment(plan.dateUpdated).format('DD')}/${now.format('YYYY')}`;
  let nowStrFormat = 'MM/DD/YYYY';

  plan.dateTerminated =
    moment(nowStr, nowStrFormat)
    .add({days: remaining})
    .add({days: extraDays})
    .toDate();

  plan.extraMonths = 0; // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated

  await data.user.save();

  txnEmail(data.user, 'cancel-subscription');

  analytics.track('unsubscribe', {
    uuid: data.user._id,
    gaCategory: 'commerce',
    gaLabel: data.paymentMethod,
    paymentMethod: data.paymentMethod,
    headers: data.headers,
  });
};

api.buyGems = async function buyGems (data) {
  let amt = data.amount || 5;
  amt = data.gift ? data.gift.gems.amount / 4 : amt;

  (data.gift ? data.gift.member : data.user).balance += amt;
  data.user.purchased.txnCount++;

  if (!data.gift) txnEmail(data.user, 'donation');

  analytics.trackPurchase({
    uuid: data.user._id,
    itemPurchased: 'Gems',
    sku: `${data.paymentMethod.toLowerCase()}-checkout`,
    purchaseType: 'checkout',
    paymentMethod: data.paymentMethod,
    quantity: 1,
    gift: Boolean(data.gift),
    purchaseValue: amt,
    headers: data.headers,
  });

  if (data.gift) {
    let byUsername = getUserInfo(data.user, ['name']).name;
    let gemAmount = data.gift.gems.amount || 20;

    let message = `\`Hello ${data.gift.member.profile.name}, ${data.user.profile.name} has sent you ${gemAmount} gems!\``;
    if (data.gift.message) message += ` ${data.gift.message}`;
    data.user.sendMessage(data.gift.member, message);

    if (data.gift.member.preferences.emailNotifications.giftedGems !== false) {
      txnEmail(data.gift.member, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount},
      ]);
    }

    if (data.gift.member._id !== data.user._id) { // Only send push notifications if sending to a user other than yourself
      if (data.gift.member.preferences.pushNotifications.giftedGems !== false) {
        sendPushNotification(
          data.gift.member,
          {
            title: shared.i18n.t('giftedGems'),
            message: shared.i18n.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}),
            identifier: 'giftedGems',
          }
        );
      }
    }

    await data.gift.member.save();
  }

  await data.user.save();
};

module.exports = api;
