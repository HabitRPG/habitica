import _ from 'lodash';
import moment from 'moment';

import analytics from '../analyticsService';
import slack from '../slack';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from '../email';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  NotAuthorized,
  NotFound,
} from '../errors';
import shared from '../../../common';
import { sendNotification as sendPushNotification } from '../pushNotifications';

// @TODO: Abstract to shared/constant
const JOINED_GROUP_PLAN = 'joined group plan';

function revealMysteryItems (user) {
  const pushedItems = [];

  _.each(shared.content.gear.flat, function findMysteryItems (item) {
    if (
      item.klass === 'mystery' &&
        moment().isAfter(shared.content.mystery[item.mystery].start) &&
        moment().isBefore(shared.content.mystery[item.mystery].end) &&
        !user.items.gear.owned[item.key] &&
        user.purchased.plan.mysteryItems.indexOf(item.key) === -1
    ) {
      user.purchased.plan.mysteryItems.push(item.key);
      pushedItems.push(item.key);
    }
  });
  if (pushedItems.length > 0) {
    user.addNotification('NEW_MYSTERY_ITEMS', { items: pushedItems });
  }
}

// @TODO: Abstract to payment helper
function _dateDiff (earlyDate, lateDate) {
  if (!earlyDate || !lateDate || moment(lateDate).isBefore(earlyDate)) return 0;

  return moment(lateDate).diff(earlyDate, 'months', true);
}

async function createSubscription (data) {
  let recipient = data.gift ? data.gift.member : data.user;
  let block = shared.content.subscriptionBlocks[data.gift ? data.gift.subscription.key : data.sub.key];
  let autoRenews = data.autoRenews !== undefined ? data.autoRenews : true;
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

    await this.addSubscriptionToGroupUsers(group);
  }

  plan = recipient.purchased.plan;

  if (data.gift || !autoRenews) {
    if (plan.customerId && !plan.dateTerminated) { // User has active plan
      plan.extraMonths += months;
    } else {
      if (!recipient.isSubscribed() || !plan.dateUpdated) plan.dateUpdated = today;
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

    Object.assign(plan, { // override plan with new values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: today,
      paymentMethod: data.paymentMethod,
      extraMonths: Number(plan.extraMonths) + _dateDiff(today, plan.dateTerminated),
      dateTerminated: null,
      // Specify a lastBillingDate just for Amazon Payments
      // Resetted every time the subscription restarts
      lastBillingDate: data.paymentMethod === 'Amazon Payments' ? today : undefined,
      nextPaymentProcessing: data.nextPaymentProcessing,
      nextBillingDate: data.nextBillingDate,
      additionalData: data.additionalData,
      lastReminderDate: null,
      owner: data.user._id,
    });

    // allow non-override if a plan was previously used
    if (!plan.gemsBought) plan.gemsBought = 0;
    if (!plan.dateCreated) plan.dateCreated = today;
    if (!plan.mysteryItems) plan.mysteryItems = [];

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
    recipient.items.pets['Jackalope-RoyalPurple'] = 5;
    recipient.markModified('items.pets');
    revealMysteryItems(recipient);
  }

  // @TODO: Create a factory pattern for use cases
  if (!data.gift && data.customerId !== this.constants.GROUP_PLAN_CUSTOMER_ID) {
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

    data.user.sendMessage(data.gift.member, { receiverMsg, senderMsg, save: false });

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

  if (group) await group.save();
  if (data.user && data.user.isModified()) await data.user.save();
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
    months: group ? 1 : months,
    groupId,
  });
}

// Cancels a subscription or group plan, setting termination to happen later
async function cancelSubscription (data) {
  let plan;
  let group;
  let cancelType = 'unsubscribe';
  let groupId;
  let emailType;
  let emailMergeData = [];
  let sendEmail = true;

  if (data.groupId) {
    // cancelling a group plan
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
    emailMergeData.push({name: 'GROUP_NAME', content: group.name});

    await this.cancelGroupUsersSubscription(group);
  } else {
    // cancelling a user subscription
    plan = data.user.purchased.plan;
    emailType = 'cancel-subscription';
    // When cancelling because the user joined a group plan, no cancel-subscription email is sent
    // because the group-member-join email says the subscription is cancelled.
    if (data.cancellationReason && data.cancellationReason === JOINED_GROUP_PLAN) sendEmail = false;
  }

  let now = moment();
  let defaultRemainingDays = 30;

  if (plan.customerId === this.constants.GROUP_PLAN_CUSTOMER_ID) {
    defaultRemainingDays = 2;
    sendEmail = false; // because group-member-cancel email has already been sent
  }

  let remaining = data.nextBill ? moment(data.nextBill).diff(new Date(), 'days', true) : defaultRemainingDays;
  if (plan.extraMonths < 0) plan.extraMonths = 0;
  let extraDays = Math.ceil(30.5 * plan.extraMonths);
  let nowStr = `${now.format('MM')}/${now.format('DD')}/${now.format('YYYY')}`;
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

  if (sendEmail) txnEmail(data.user, emailType, emailMergeData);

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
}

module.exports = {
  createSubscription,
  cancelSubscription,
};
