import _ from 'lodash';
import nconf from 'nconf';
import analytics from './analyticsService';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from './email';
import moment from 'moment';
import { sendNotification as sendPushNotification } from './pushNotifications';
import shared from '../../common';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../models/group';
import { model as User } from '../models/user';
import {
  NotAuthorized,
  NotFound,
} from './errors';
import slack from './slack';

const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL');
const JOINED_GROUP_PLAN = 'joined group plan';

let api = {};

api.constants = {
  UNLIMITED_CUSTOMER_ID: 'habitrpg', // Users with the customerId have an unlimted free subscription
  GROUP_PLAN_CUSTOMER_ID: 'group-plan',
  GROUP_PLAN_PAYMENT_METHOD: 'Group Plan',
  GOOGLE_PAYMENT_METHOD: 'Google',
  IOS_PAYMENT_METHOD: 'Apple',
};

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

/**
 * Add a subscription to members of a group
 *
 * @param  group  The Group Model that is subscribed to a group plan
 *
 * @return undefined
 */
api.addSubscriptionToGroupUsers = async function addSubscriptionToGroupUsers (group) {
  let members;
  if (group.type === 'guild') {
    members = await User.find({guilds: group._id}).select('_id purchased items auth profile.name').exec();
  } else {
    members = await User.find({'party._id': group._id}).select('_id purchased items auth profile.name').exec();
  }

  let promises = members.map((member) => {
    return this.addSubToGroupUser(member, group);
  });

  await Promise.all(promises);
};

/**
 * Add a subscription to a new member of a group
 *
 * @param  member  The new member of the group
 *
 * @return undefined
 */
api.addSubToGroupUser = async function addSubToGroupUser (member, group) {
  // These EMAIL_TEMPLATE constants are used to pass strings into templates that are
  // stored externally and so their values must not be changed.
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE = 'Google_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS = 'iOS_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GROUP_PLAN = 'group_plan_free_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_LIFETIME_FREE = 'lifetime_free_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL = 'normal_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_UNKNOWN = 'unknown_type_of_subscription';
  const EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE = 'no_subscription';

  // When changing customerIdsToIgnore or paymentMethodsToIgnore, the code blocks below for
  // the `group-member-join` email template will probably need to be changed.
  let customerIdsToIgnore = [this.constants.GROUP_PLAN_CUSTOMER_ID, this.constants.UNLIMITED_CUSTOMER_ID];
  let paymentMethodsToIgnore = [this.constants.GOOGLE_PAYMENT_METHOD, this.constants.IOS_PAYMENT_METHOD];
  let previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NONE;
  let leader = await User.findById(group.leader).exec();

  let data = {
    user: {},
    sub: {
      key: 'group_plan_auto',
    },
    customerId: 'group-plan',
    paymentMethod: 'Group Plan',
    headers: {},
  };

  let plan = {
    planId: 'group_plan_auto',
    customerId: 'group-plan',
    dateUpdated: new Date(),
    gemsBought: 0,
    paymentMethod: 'groupPlan',
    extraMonths: 0,
    dateTerminated: null,
    lastBillingDate: null,
    dateCreated: new Date(),
    mysteryItems: [],
    consecutive: {
      trinkets: 0,
      offset: 0,
      gemCapExtra: 0,
    },
  };

  let memberPlan = member.purchased.plan;
  if (member.isSubscribed()) {
    let customerHasCancelledGroupPlan = memberPlan.customerId === this.constants.GROUP_PLAN_CUSTOMER_ID && !member.hasNotCancelled();
    let ignorePaymentPlan = paymentMethodsToIgnore.indexOf(memberPlan.paymentMethod) !== -1;
    let ignoreCustomerId = customerIdsToIgnore.indexOf(memberPlan.customerId) !== -1;

    if (ignorePaymentPlan) {
      txnEmail({email: TECH_ASSISTANCE_EMAIL}, 'admin-user-subscription-details', [
        {name: 'PROFILE_NAME', content: member.profile.name},
        {name: 'UUID', content: member._id},
        {name: 'EMAIL', content: getUserInfo(member, ['email']).email},
        {name: 'PAYMENT_METHOD', content: memberPlan.paymentMethod},
        {name: 'PURCHASED_PLAN', content: JSON.stringify(memberPlan)},
        {name: 'ACTION_NEEDED', content: 'User has joined group plan and has been told to cancel their subscription then email us. Ensure they do that then give them free sub.'},
        // TODO User won't get email instructions if they've opted out of all emails. See if we can make this email an exception and if not, report here whether they've opted out.
      ]);
    }

    if ((ignorePaymentPlan || ignoreCustomerId) && !customerHasCancelledGroupPlan) {
      // member has been added to group plan but their subscription will not be changed
      // automatically so they need a special message in the email
      if (memberPlan.paymentMethod === this.constants.GOOGLE_PAYMENT_METHOD) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GOOGLE;
      } else if (memberPlan.paymentMethod === this.constants.IOS_PAYMENT_METHOD) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_IOS;
      } else if (memberPlan.customerId === this.constants.UNLIMITED_CUSTOMER_ID) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_LIFETIME_FREE;
      } else if (memberPlan.customerId === this.constants.GROUP_PLAN_CUSTOMER_ID) {
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_GROUP_PLAN;
      } else {
        // this triggers a generic message in the email template in case we forget
        // to update this code for new special cases
        previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_UNKNOWN;
      }
      txnEmail(member, 'group-member-join', [
        {name: 'LEADER', content: leader.profile.name},
        {name: 'GROUP_NAME', content: group.name},
        {name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: previousSubscriptionType},
      ]);
      return;
    }

    if (member.hasNotCancelled()) {
      await member.cancelSubscription({cancellationReason: JOINED_GROUP_PLAN});
      previousSubscriptionType = EMAIL_TEMPLATE_SUBSCRIPTION_TYPE_NORMAL;
    }

    let today = new Date();
    plan = member.purchased.plan.toObject();
    let extraMonths = Number(plan.extraMonths);
    if (plan.dateTerminated) extraMonths += _dateDiff(today, plan.dateTerminated);

    _(plan).merge({ // override with these values
      planId: 'group_plan_auto',
      customerId: 'group-plan',
      dateUpdated: today,
      paymentMethod: 'groupPlan',
      extraMonths,
      dateTerminated: null,
      lastBillingDate: null,
      owner: member._id,
    }).defaults({ // allow non-override if a plan was previously used
      gemsBought: 0,
      dateCreated: today,
      mysteryItems: [],
    }).value();
  }

  // save unused hourglass and mystery items
  plan.consecutive.trinkets = memberPlan.consecutive.trinkets;
  plan.mysteryItems = memberPlan.mysteryItems;

  member.purchased.plan = plan;
  member.items.mounts['Jackalope-RoyalPurple'] = true;

  data.user = member;
  await this.createSubscription(data);

  txnEmail(data.user, 'group-member-join', [
    {name: 'LEADER', content: leader.profile.name},
    {name: 'GROUP_NAME', content: group.name},
    {name: 'PREVIOUS_SUBSCRIPTION_TYPE', content: previousSubscriptionType},
  ]);
};


/**
 * Cancels subscriptions of members of a group
 *
 * @param  group  The Group Model that is cancelling a group plan
 *
 * @return undefined
 */
api.cancelGroupUsersSubscription = async function cancelGroupUsersSubscription (group) {
  let members;
  if (group.type === 'guild') {
    members = await User.find({guilds: group._id}).select('_id guilds purchased').exec();
  } else {
    members = await User.find({'party._id': group._id}).select('_id guilds purchased').exec();
  }

  let promises = members.map((member) => {
    return this.cancelGroupSubscriptionForUser(member, group);
  });

  await Promise.all(promises);
};

api.cancelGroupSubscriptionForUser = async function cancelGroupSubscriptionForUser (user, group, userWasRemoved = false) {
  if (user.purchased.plan.customerId !== this.constants.GROUP_PLAN_CUSTOMER_ID) return;

  let userGroups = user.guilds.toObject();
  userGroups.push('party');

  let index = userGroups.indexOf(group._id);
  userGroups.splice(index, 1);

  let groupPlansQuery = {
    type: {$in: ['guild', 'party']},
    // privacy: 'private',
    _id: {$in: userGroups},
    'purchased.plan.dateTerminated': null,
  };

  let groupFields = `${basicGroupFields} purchased`;
  let userGroupPlans = await Group.find(groupPlansQuery).select(groupFields).exec();

  if (userGroupPlans.length === 0)  {
    let leader = await User.findById(group.leader).exec();
    const email = userWasRemoved ? 'group-member-removed' : 'group-member-cancel';

    txnEmail(user, email, [
      {name: 'LEADER', content: leader.profile.name},
      {name: 'GROUP_NAME', content: group.name},
    ]);
    await this.cancelSubscription({user});
  }
};

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

    await this.addSubscriptionToGroupUsers(group);
  }

  plan = recipient.purchased.plan;

  if (data.gift) {
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
    months: group ? 1 : months,
    groupId,
  });
};

// Cancels a subscription or group plan, setting termination to happen later
api.cancelSubscription = async function cancelSubscription (data) {
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

module.exports = api;
