import _ from 'lodash' ;
import analytics from './analyticsService';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from './email';
import moment from 'moment';
import { sendNotification as sendPushNotification } from './pushNotifications';
import shared from '../../common' ;
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../models/group';
import { model as Coupon } from '../models/coupon';
import { model as User } from '../models/user';
import {
  NotAuthorized,
  NotFound,
} from './errors';
import slack from './slack';
import nconf from 'nconf';
import stripeModule from 'stripe';
import amzLib from './amazonPayments';
import {
  BadRequest,
} from './errors';
import cc from 'coupon-code';

const stripe = stripeModule(nconf.get('STRIPE_API_KEY'));


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
  let block = shared.content.subscriptionBlocks[data.gift ? data.gift.subscription.key : data.sub.key];
  let months = Number(block.months);
  let today = new Date();
  let plan;
  let group;
  let groupId;
  let itemPurchased = 'Subscription';
  let purchaseType = 'subscribe';
  let emailType = 'subscription-begins';

  //  If we are buying a group subscription
  if (data.groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    group = await Group.getGroup({user: data.user, groupId: data.groupId, populateLeader: false, groupFields});

    if (!group) {
      throw new NotFound(shared.i18n.t('groupNotFound'));
    }

    if (!group.leader === data.user._id) {
      throw new NotAuthorized(shared.i18n.t('onlyGroupLeaderCanManageSubscription'));
    }

    recipient = group;
    itemPurchased = 'Group-Subscription';
    purchaseType = 'group-subscribe';
    emailType = 'group-subscription-begins';
    groupId = group._id;
    recipient.purchased.plan.quantity = data.sub.quantity;
  }

  plan = recipient.purchased.plan;

  if (data.gift) {
    if (plan.customerId && !plan.dateTerminated) { // User has active plan
      plan.extraMonths += months;
    } else {
      if (!plan.dateUpdated) plan.dateUpdated = today;
      if (moment(plan.dateTerminated).isAfter()) {
        plan.dateTerminated = moment(plan.dateTerminated).add({months}).toDate();
      } else {
        plan.dateTerminated = moment().add({months}).toDate();
        plan.dateCreated = today;
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
      owner: data.user._id,
    }).defaults({ // allow non-override if a plan was previously used
      gemsBought: 0,
      dateCreated: today,
      mysteryItems: [],
    }).value();

    if (data.subscriptionId) {
      plan.subscriptionId = data.subscriptionId;
    }
  }

  // Block sub perks
  let perks = Math.floor(months / 3);
  if (perks) {
    plan.consecutive.offset += months;
    plan.consecutive.gemCapExtra += perks * 5;
    if (plan.consecutive.gemCapExtra > 25) plan.consecutive.gemCapExtra = 25;
    plan.consecutive.trinkets += perks;
  }

  if (recipient !== group) {
    revealMysteryItems(recipient);
  }

  if (!data.gift) {
    txnEmail(data.user, emailType);
  }

  analytics.trackPurchase({
    uuid: data.user._id,
    groupId,
    itemPurchased,
    sku: `${data.paymentMethod.toLowerCase()}-subscription`,
    purchaseType,
    paymentMethod: data.paymentMethod,
    quantity: 1,
    gift: Boolean(data.gift),
    purchaseValue: block.price,
    headers: data.headers,
  });

  if (!group) data.user.purchased.txnCount++;

  if (data.gift) {
    let byUserName = getUserInfo(data.user, ['name']).name;

    // generate the message in both languages, so both users can understand it
    let languages = [data.user.preferences.language, data.gift.member.preferences.language];
    let senderMsg = shared.i18n.t('giftedSubscriptionFull', {
      username: data.gift.member.profile.name,
      sender: byUserName,
      monthCount: shared.content.subscriptionBlocks[data.gift.subscription.key].months,
    }, languages[0]);
    senderMsg = `\`${senderMsg}\``;

    let receiverMsg = shared.i18n.t('giftedSubscriptionFull', {
      username: data.gift.member.profile.name,
      sender: byUserName,
      monthCount: shared.content.subscriptionBlocks[data.gift.subscription.key].months,
    }, languages[1]);
    receiverMsg = `\`${receiverMsg}\``;

    if (data.gift.message) {
      receiverMsg += ` ${data.gift.message}`;
      senderMsg += ` ${data.gift.message}`;
    }

    data.user.sendMessage(data.gift.member, { receiverMsg, senderMsg });

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
            title: shared.i18n.t('giftedSubscription', languages[1]),
            message: shared.i18n.t('giftedSubscriptionInfo', {months, name: byUserName}, languages[1]),
            identifier: 'giftedSubscription',
            payload: {replyTo: data.user._id},
          }
        );
      }
    }
  }

  if (group) {
    await group.save();
  } else {
    await data.user.save();
  }

  if (data.gift) await data.gift.member.save();

  slack.sendSubscriptionNotification({
    buyer: {
      id: data.user._id,
      name: data.user.profile.name,
      email: getUserInfo(data.user, ['email']).email,
    },
    recipient: data.gift ? {
      id: data.gift.member._id,
      name: data.gift.member.profile.name,
      email: getUserInfo(data.gift.member, ['email']).email,
    } : {},
    paymentMethod: data.paymentMethod,
    months,
  });
};

api.updateStripeGroupPlan = async function updateStripeGroupPlan (group, stripeInc) {
  if (group.purchased.plan.paymentMethod !== 'Stripe') return;
  let stripeApi = stripeInc || stripe;
  let plan = shared.content.subscriptionBlocks.group_monthly;

  await stripeApi.subscriptions.update(
    group.purchased.plan.subscriptionId,
    {
      plan: plan.key,
      quantity: group.memberCount + plan.quantity - 1,
    }
  );

  group.purchased.plan.quantity = group.memberCount + plan.quantity - 1;
};

// Sets their subscription to be cancelled later
api.cancelSubscription = async function cancelSubscription (data) {
  let plan;
  let group;
  let cancelType = 'unsubscribe';
  let groupId;
  let emailType = 'cancel-subscription';

  //  If we are buying a group subscription
  if (data.groupId) {
    let groupFields = basicGroupFields.concat(' purchased');
    group = await Group.getGroup({user: data.user, groupId: data.groupId, populateLeader: false, groupFields});

    if (!group) {
      throw new NotFound(shared.i18n.t('groupNotFound'));
    }

    let allowedManagers = [group.leader, group.purchased.plan.owner];

    if (allowedManagers.indexOf(data.user._id) === -1) {
      throw new NotAuthorized(shared.i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    plan = group.purchased.plan;
    emailType = 'group-cancel-subscription';
  } else {
    plan = data.user.purchased.plan;
  }

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

  if (group) {
    await group.save();
  } else {
    await data.user.save();
  }

  txnEmail(data.user, emailType);

  if (group) {
    cancelType = 'group-unsubscribe';
    groupId = group._id;
  }

  analytics.track(cancelType, {
    uuid: data.user._id,
    groupId,
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

    // generate the message in both languages, so both users can understand it
    let languages = [data.user.preferences.language, data.gift.member.preferences.language];
    let senderMsg = shared.i18n.t('giftedGemsFull', {
      username: data.gift.member.profile.name,
      sender: byUsername,
      gemAmount,
    }, languages[0]);
    senderMsg = `\`${senderMsg}\``;

    let receiverMsg = shared.i18n.t('giftedGemsFull', {
      username: data.gift.member.profile.name,
      sender: byUsername,
      gemAmount,
    }, languages[1]);
    receiverMsg = `\`${receiverMsg}\``;

    if (data.gift.message) {
      receiverMsg += ` ${data.gift.message}`;
      senderMsg += ` ${data.gift.message}`;
    }

    data.user.sendMessage(data.gift.member, { receiverMsg, senderMsg });

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
            title: shared.i18n.t('giftedGems', languages[1]),
            message: shared.i18n.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}, languages[1]),
            identifier: 'giftedGems',
          }
        );
      }
    }

    await data.gift.member.save();
  }

  await data.user.save();
};

/**
 * Allows for purchasing a user subscription, group subscription or gems with Stripe
 *
 * @param  options
 * @param  options.token  The stripe token generated on the front end
 * @param  options.user  The user object who is purchasing
 * @param  options.gift  The gift details if any
 * @param  options.sub  The subscription data to purchase
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.email  The email enter by the user on the Stripe form
 * @param  options.headers  The request headers to store on analytics
 * @return undefined
 */
api.payWithStripe = async function payWithStripe (options, stripeInc) {
  let {
    token,
    user,
    gift,
    sub,
    groupId,
    email,
    headers,
    coupon,
  } = options;
  let response;
  let subscriptionId;
  // @TODO: We need to mock this, but curently we don't have correct Dependency Injection
  let stripeApi = stripe;

  if (stripeInc) stripeApi = stripeInc;

  if (!token) throw new BadRequest('Missing req.body.id');

  if (sub) {
    if (sub.discount) {
      if (!coupon) throw new BadRequest(shared.i18n.t('couponCodeRequired'));
      coupon = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key}).exec();
      if (!coupon) throw new BadRequest(shared.i18n.t('invalidCoupon'));
    }

    let customerObject = {
      email,
      metadata: { uuid: user._id },
      card: token,
      plan: sub.key,
    };

    if (groupId) {
      customerObject.quantity = sub.quantity;
    }

    response = await stripeApi.customers.create(customerObject);

    if (groupId) subscriptionId = response.subscriptions.data[0].id;
  } else {
    let amount = 500; // $5

    if (gift) {
      if (gift.type === 'subscription') {
        amount = `${shared.content.subscriptionBlocks[gift.subscription.key].price * 100}`;
      } else {
        amount = `${gift.gems.amount / 4 * 100}`;
      }
    }

    response = await stripe.charges.create({
      amount,
      currency: 'usd',
      card: token,
    });
  }

  if (sub) {
    await this.createSubscription({
      user,
      customerId: response.id,
      paymentMethod: 'Stripe',
      sub,
      headers,
      groupId,
      subscriptionId,
    });
  } else {
    let method = 'buyGems';
    let data = {
      user,
      customerId: response.id,
      paymentMethod: 'Stripe',
      gift,
    };

    if (gift) {
      let member = await User.findById(gift.uuid).exec();
      gift.member = member;
      if (gift.type === 'subscription') method = 'createSubscription';
      data.paymentMethod = 'Gift';
    }

    await this[method](data);
  }
};

/**
 * Allows for purchasing a user subscription or group subscription with Amazon
 *
 * @param  options
 * @param  options.billingAgreementId  The Amazon billingAgreementId generated on the front end
 * @param  options.user  The user object who is purchasing
 * @param  options.sub  The subscription data to purchase
 * @param  options.coupon  The coupon to discount the sub
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.headers  The request headers to store on analytics
 * @return undefined
 */
api.subscribeWithAmazon = async function subscribeWithAmazon (options) {
  let {
    billingAgreementId,
    sub,
    coupon,
    user,
    groupId,
    headers,
  } = options;

  if (!sub) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));
  if (!billingAgreementId) throw new BadRequest('Missing req.body.billingAgreementId');

  if (sub.discount) { // apply discount
    if (!coupon) throw new BadRequest(shared.i18n.t('couponCodeRequired'));
    let result = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key}).exec();
    if (!result) throw new NotAuthorized(shared.i18n.t('invalidCoupon'));
  }

  await amzLib.setBillingAgreementDetails({
    AmazonBillingAgreementId: billingAgreementId,
    BillingAgreementAttributes: {
      SellerNote: 'Habitica Subscription',
      SellerBillingAgreementAttributes: {
        SellerBillingAgreementId: shared.uuid(),
        StoreName: 'Habitica',
        CustomInformation: 'Habitica Subscription',
      },
    },
  });

  await amzLib.confirmBillingAgreement({
    AmazonBillingAgreementId: billingAgreementId,
  });

  await amzLib.authorizeOnBillingAgreement({
    AmazonBillingAgreementId: billingAgreementId,
    AuthorizationReferenceId: shared.uuid().substring(0, 32),
    AuthorizationAmount: {
      CurrencyCode: 'USD',
      Amount: sub.price,
    },
    SellerAuthorizationNote: 'Habitica Subscription Payment',
    TransactionTimeout: 0,
    CaptureNow: true,
    SellerNote: 'Habitica Subscription Payment',
    SellerOrderAttributes: {
      SellerOrderId: shared.uuid(),
      StoreName: 'Habitica',
    },
  });

  await this.createSubscription({
    user,
    customerId: billingAgreementId,
    paymentMethod: 'Amazon Payments',
    sub,
    headers,
    groupId,
  });
};

module.exports = api;
