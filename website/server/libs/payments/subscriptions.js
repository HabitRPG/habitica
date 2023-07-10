// TODO these files need to refactored.

import _ from 'lodash';
import moment from 'moment';

import { getAnalyticsServiceByEnvironment } from '../analyticsService';
import * as slack from '../slack'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  getUserInfo,
  sendTxn as txnEmail,
} from '../email';
import { // eslint-disable-line import/no-cycle
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  NotAuthorized,
  NotFound,
} from '../errors';
import shared from '../../../common';
import { sendNotification as sendPushNotification } from '../pushNotifications'; // eslint-disable-line import/no-cycle
import calculateSubscriptionTerminationDate from './calculateSubscriptionTerminationDate';
import { getCurrentEventList } from '../worldState'; // eslint-disable-line import/no-cycle
import { paymentConstants } from './constants';
import { addSubscriptionToGroupUsers, cancelGroupUsersSubscription } from './groupPayments'; // eslint-disable-line import/no-cycle

// @TODO: Abstract to shared/constant
const JOINED_GROUP_PLAN = 'joined group plan';
const analytics = getAnalyticsServiceByEnvironment();

function _findMysteryItems (user, dateMoment) {
  const pushedItems = [];
  _.each(shared.content.gear.flat, item => {
    if (
      item.klass === 'mystery'
        && shared.content.mystery[item.mystery]
        && dateMoment.isSameOrAfter(shared.content.mystery[item.mystery].start)
        && dateMoment.isSameOrBefore(moment(shared.content.mystery[item.mystery].end).endOf('day'))
        && !user.items.gear.owned[item.key]
        && user.purchased.plan.mysteryItems.indexOf(item.key) === -1
    ) {
      user.purchased.plan.mysteryItems.push(item.key);
      pushedItems.push(item.key);
    }
  });
  return pushedItems;
}

function revealMysteryItems (user, elapsedMonths = 1) {
  let monthsToCheck = elapsedMonths;
  let pushedItems = [];

  do {
    monthsToCheck -= 1;
    pushedItems = pushedItems.concat(_findMysteryItems(user, moment().subtract(monthsToCheck, 'months')));
  }
  while (monthsToCheck > 0);

  if (pushedItems.length > 0) {
    user.addNotification('NEW_MYSTERY_ITEMS', { items: pushedItems });
  }
}

// @TODO: Abstract to payment helper
function _dateDiff (earlyDate, lateDate) {
  if (!earlyDate || !lateDate || moment(lateDate).isBefore(earlyDate)) return 0;

  return moment(lateDate).diff(earlyDate, 'months', true);
}

async function prepareSubscriptionValues (data) {
  let recipient = data.gift ? data.gift.member : data.user;
  const block = shared.content.subscriptionBlocks[data.gift
    ? data.gift.subscription.key
    : data.sub.key];
  const autoRenews = data.autoRenews !== undefined ? data.autoRenews : true;
  const updatedFrom = data.updatedFrom
    ? shared.content.subscriptionBlocks[data.updatedFrom.key]
    : undefined;
  let months;
  if (updatedFrom && Number(updatedFrom.months) !== 1) {
    if (Number(updatedFrom.months) > Number(block.months)) {
      months = 0;
    } else if (data.updatedFrom.logic === 'payDifference') {
      months = Math.max(0, Number(block.months) - Number(updatedFrom.months));
    } else if (data.updatedFrom.logic === 'payFull') {
      months = Number(block.months);
    } else if (data.updatedFrom.logic === 'refundAndRepay') {
      const originalMonths = Number(updatedFrom.months);
      let currentCycleBegin = moment(recipient.purchased.plan.dateCurrentTypeCreated);
      const today = moment();
      while (currentCycleBegin.isBefore()) {
        currentCycleBegin = currentCycleBegin.add({ months: originalMonths });
      }
      // Subtract last iteration again, because we overshot
      currentCycleBegin = currentCycleBegin.subtract({ months: originalMonths });
      // For simplicity we round every month to 30 days since moment can not add half months
      if (currentCycleBegin.add({ days: (originalMonths * 30) / 2.0 }).isBefore(today)) {
        // user is in second half of their subscription cycle. Give them full benefits.
        months = Number(block.months);
      } else {
        // user is in first half of their subscription cycle. Give them the difference.
        months = Math.max(0, Number(block.months) - Number(updatedFrom.months));
      }
    }
  }
  if (months === undefined) {
    months = Number(block.months);
  }
  const today = new Date();
  let group;
  let groupId;
  let itemPurchased = 'Subscription';
  let purchaseType = 'subscribe';
  let emailType = 'subscription-begins';
  let recipientIsSubscribed = recipient.isSubscribed();
  const isNewSubscription = !recipientIsSubscribed;

  //  If we are buying a group subscription
  if (data.groupId) {
    const groupFields = basicGroupFields.concat(' purchased');
    group = await Group.getGroup({
      user: data.user, groupId: data.groupId, populateLeader: false, groupFields,
    });

    if (group) {
      analytics.track(
        data.groupID,
        data.demographics,
      );
    }

    if (!group) {
      throw new NotFound(shared.i18n.t('groupNotFound'));
    }

    if (!group.leader === data.user._id) {
      throw new NotAuthorized(shared.i18n.t('onlyGroupLeaderCanManageSubscription'));
    }

    if (group.privacy !== 'private') {
      throw new NotAuthorized(shared.i18n.t('onlyPrivateGuildsCanUpgrade'));
    }

    recipient = group;
    itemPurchased = 'Group-Subscription';
    purchaseType = 'group-subscribe';
    emailType = 'group-subscription-begins';
    recipientIsSubscribed = group.hasActiveGroupPlan();
    groupId = group._id;
    recipient.purchased.plan.quantity = data.sub.quantity;

    await addSubscriptionToGroupUsers(group);
  }

  const { plan } = recipient.purchased;

  if (isNewSubscription) {
    plan.perkMonthCount = 0;
  }

  if (data.gift || !autoRenews) {
    if (plan.customerId && !plan.dateTerminated) { // User has active plan
      plan.extraMonths += months;
    } else {
      if (!recipientIsSubscribed || !plan.dateUpdated) {
        plan.dateUpdated = today;
      }

      if (moment(plan.dateTerminated).isAfter()) {
        plan.dateTerminated = moment(plan.dateTerminated).add({ months }).toDate();
      } else {
        plan.dateTerminated = moment().add({ months }).toDate();
        plan.dateCreated = today;
      }
      plan.dateCurrentTypeCreated = today;
    }

    if (!plan.customerId) {
      plan.customerId = 'Gift';
    }

    // don't override existing customer, but all sub need a customerId
  } else {
    if (!plan.dateTerminated) {
      plan.dateTerminated = today;
    }

    Object.assign(plan, { // override plan with new values
      planId: block.key,
      customerId: data.customerId,
      dateUpdated: today,
      dateCurrentTypeCreated: today,
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
    if (!plan.gemsBought) {
      plan.gemsBought = 0;
    }

    if (!plan.dateCreated) {
      plan.dateCreated = today;
    }

    if (!plan.mysteryItems) {
      plan.mysteryItems = [];
    }

    if (data.subscriptionId) {
      plan.subscriptionId = data.subscriptionId;
    }
  }

  return {
    block,
    months,
    plan,
    recipient,
    autoRenews,
    group,
    groupId,
    itemPurchased,
    purchaseType,
    emailType,
    isNewSubscription,
  };
}

async function createSubscription (data) {
  const {
    block,
    months,
    plan,
    recipient,
    autoRenews,
    group,
    groupId,
    itemPurchased,
    purchaseType,
    emailType,
    isNewSubscription,
  } = await prepareSubscriptionValues(data);

  // Block sub perks
  if (months > 1 && (!data.gift || !isNewSubscription)) {
    if (!data.gift && !groupId) {
      plan.consecutive.offset = block.months;
    }
  } else if (months === 1) {
    plan.consecutive.offset = 0;
  }
  if (months > 1 || data.gift) {
    await plan.incrementPerkCounterAndReward(recipient._id, months);
  } else {
    // Make sure the perkMonthCount field is initialized.
    await plan.incrementPerkCounterAndReward(recipient._id, 0);
  }

  if (recipient !== group) {
    recipient.items.pets['Jackalope-RoyalPurple'] = 5;
    recipient.markModified('items.pets');
    revealMysteryItems(recipient);
  }

  // @TODO: Create a factory pattern for use cases
  if (!data.gift && data.customerId !== paymentConstants.GROUP_PLAN_CUSTOMER_ID) {
    txnEmail(data.user, emailType);
  }

  if (!group && !data.promo) data.user.purchased.txnCount += 1;

  if (!data.promo) {
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
      headers: data.headers || { 'x-client': 'habitica-web' },
      firstPurchase: !group && data.user.purchased.txnCount === 1,
    });
  }

  if (data.gift) {
    const byUserName = getUserInfo(data.user, ['name']).name;

    // generate the message in both languages, so both users can understand it
    const languages = [data.user.preferences.language, data.gift.member.preferences.language];
    if (data.promo) {
      let receiverMsg = shared.i18n.t(`giftedSubscription${data.promo}Promo`, {
        username: data.gift.member.profile.name,
        monthCount: shared.content.subscriptionBlocks[data.gift.subscription.key].months,
      }, languages[0]);

      receiverMsg = `\`${receiverMsg}\``;
      data.user.sendMessage(data.gift.member, { receiverMsg, save: false });
    } else {
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
    }

    if (data.gift.member.preferences.emailNotifications.giftedSubscription !== false) {
      if (data.promo) {
        txnEmail(data.gift.member, 'gift-one-get-one', [
          { name: 'GIFTEE_USERNAME', content: data.promoUsername },
          { name: 'X_MONTHS_SUBSCRIPTION', content: months },
        ]);
      } else {
        txnEmail(data.gift.member, 'gifted-subscription', [
          { name: 'GIFTER', content: byUserName },
          { name: 'X_MONTHS_SUBSCRIPTION', content: months },
        ]);
      }
    }

    // Only send push notifications if sending to a user other than yourself
    if (data.gift.member._id !== data.user._id) {
      const currentEventList = getCurrentEventList();
      const currentEvent = _.find(currentEventList, event => Boolean(event.promo));
      if (currentEvent && currentEvent.promo === 'g1g1') {
        const promoData = {
          user: data.user,
          gift: {
            member: data.user,
            subscription: {
              key: data.gift.subscription.key,
            },
          },
          paymentMethod: data.paymentMethod,
          promo: 'Winter',
          promoUsername: data.gift.member.auth.local.username,
        };
        await createSubscription(promoData);
      }

      if (data.gift.member.preferences.pushNotifications.giftedSubscription !== false) {
        sendPushNotification(data.gift.member,
          {
            title: shared.i18n.t('giftedSubscription', languages[1]),
            message: shared.i18n.t('giftedSubscriptionInfo', { months, name: byUserName }, languages[1]),
            identifier: 'giftedSubscription',
            payload: { replyTo: data.user._id },
          });
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
    autoRenews,
  });
}

// Cancels a subscription or group plan, setting termination to happen later
async function cancelSubscription (data) {
  let plan;
  let group;
  let cancelType = 'unsubscribe';
  let groupId;
  let emailType;
  const emailMergeData = [];
  let sendEmail = true;

  if (data.groupId) {
    // cancelling a group plan
    const groupFields = basicGroupFields.concat(' purchased');
    group = await Group.getGroup({
      user: data.user, groupId: data.groupId, populateLeader: false, groupFields,
    });

    if (!group) {
      throw new NotFound(shared.i18n.t('groupNotFound'));
    }

    const allowedManagers = [group.leader, group.purchased.plan.owner];

    if (allowedManagers.indexOf(data.user._id) === -1) {
      throw new NotAuthorized(shared.i18n.t('onlyGroupLeaderCanManageSubscription'));
    }
    plan = group.purchased.plan;
    emailType = 'group-cancel-subscription';
    emailMergeData.push({ name: 'GROUP_NAME', content: group.name });

    await cancelGroupUsersSubscription(group);
  } else {
    // cancelling a user subscription
    plan = data.user.purchased.plan;
    emailType = 'cancel-subscription';
    // When cancelling because the user joined a group plan, no cancel-subscription email is sent
    // because the group-member-join email says the subscription is cancelled.
    if (data.cancellationReason && data.cancellationReason === JOINED_GROUP_PLAN) sendEmail = false;
  }

  if (plan.customerId === paymentConstants.GROUP_PLAN_CUSTOMER_ID) {
    sendEmail = false; // because group-member-cancel email has already been sent
  }

  plan.dateTerminated = calculateSubscriptionTerminationDate(
    data.nextBill, plan, paymentConstants.GROUP_PLAN_CUSTOMER_ID,
  );

  // clear extra time. If they subscribe again, it'll be recalculated from p.dateTerminated
  plan.extraMonths = 0;

  if (group) {
    await group.save();
  } else {
    await data.user.save();
  }

  if (sendEmail) {
    txnEmail(data.user, emailType, emailMergeData);
  }

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

export {
  createSubscription,
  cancelSubscription,
  revealMysteryItems,
};
