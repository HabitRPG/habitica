import moment from 'moment';
import {
  defaults, map, flatten, flow, compact, uniq, partialRight, remove,
} from 'lodash';
import common from '../../../common';

import { // eslint-disable-line import/no-cycle
  TAVERN_ID,
  model as Group,
} from '../group';

import {
  messageDefaults,
  setUserStyles,
  inboxModel as Inbox,
} from '../message';

import { model as UserNotification } from '../userNotification';
import schema from './schema'; // eslint-disable-line import/no-cycle
import payments from '../../libs/payments/payments'; // eslint-disable-line import/no-cycle
import * as inboxLib from '../../libs/inbox'; // eslint-disable-line import/no-cycle
import amazonPayments from '../../libs/payments/amazon'; // eslint-disable-line import/no-cycle
import stripePayments from '../../libs/payments/stripe'; // eslint-disable-line import/no-cycle
import paypalPayments from '../../libs/payments/paypal'; // eslint-disable-line import/no-cycle
import { model as NewsPost } from '../newsPost';
import { TransactionModel as Transaction } from '../transaction';

const { daysSince } = common;

schema.methods.isSubscribed = function isSubscribed () {
  const now = new Date();
  const { plan } = this.purchased;
  return plan && plan.customerId
    && (!plan.dateTerminated || moment(plan.dateTerminated).isAfter(now));
};

schema.methods.hasNotCancelled = function hasNotCancelled () {
  const { plan } = this.purchased;
  return Boolean(this.isSubscribed() && !plan.dateTerminated);
};

schema.methods.hasCancelled = function hasCancelled () {
  const { plan } = this.purchased;
  return Boolean(this.isSubscribed() && plan.dateTerminated);
};

// Get an array of groups ids the user is member of
schema.methods.getGroups = function getUserGroups () {
  const userGroups = this.guilds.slice(0); // clone this.guilds so we don't modify the original
  if (this.party._id) userGroups.push(this.party._id);
  userGroups.push(TAVERN_ID);
  return userGroups;
};

/* eslint-disable no-unused-vars */
// The checks below all get access to sndr and rcvr, but not all use both
const INTERACTION_CHECKS = Object.freeze({
  always: [
    // Revoked chat privileges block all interactions
    // to prevent the evading of harassment protections
    // See issue #7971 for some discussion
    (sndr, rcvr) => sndr.flags.chatRevoked && 'chatPrivilegesRevoked',

    // Direct user blocks prevent all interactions
    (sndr, rcvr) => rcvr.inbox.blocks.includes(sndr._id) && 'notAuthorizedToSendMessageToThisUser',
    (sndr, rcvr) => sndr.inbox.blocks.includes(rcvr._id) && 'blockedToSendToThisUser',
  ],

  'send-private-message': [
    // Private messaging has an opt-out, which does not affect other interactions
    (sndr, rcvr) => rcvr.inbox.optOut && 'notAuthorizedToSendMessageToThisUser',

    // We allow a player to message themselves so they can test how PMs work
    // or send their own notes to themselves
  ],

  'transfer-gems': [
    // Unlike private messages, gems can't be sent to oneself
    (sndr, rcvr) => rcvr._id === sndr._id && 'cannotSendGemsToYourself',
  ],

  'group-invitation': [
    // uses the checks that are in the 'always' array
  ],
});
/* eslint-enable no-unused-vars */

export const KNOWN_INTERACTIONS = Object.freeze(Object.keys(INTERACTION_CHECKS) // eslint-disable-line import/prefer-default-export, max-len
  .filter(key => key !== 'always'));

// Get an array of error message keys that would be thrown if the given interaction was attempted
schema.methods.getObjectionsToInteraction = function getObjectionsToInteraction (interaction, receiver) { // eslint-disable-line max-len
  if (!KNOWN_INTERACTIONS.includes(interaction)) {
    throw new Error(`Unknown kind of interaction: "${interaction}", expected one of ${KNOWN_INTERACTIONS.join(', ')}`);
  }

  const sender = this;
  const checks = [
    INTERACTION_CHECKS.always,
    INTERACTION_CHECKS[interaction],
  ];

  const executeChecks = partialRight(map, check => check(sender, receiver));

  return flow(
    flatten,
    executeChecks,
    compact, // Remove passed checks (passed checks return falsy; failed checks return message keys)
    uniq,
  )(checks);
};

/**
 * Sends a message to a user. Archives a copy in sender's inbox.
 *
 * @param  userToReceiveMessage  The receiver
 * @param  options
 * @param  options.receiverMsg   The message to send to the receiver
 * @param  options.senderMsg     The message to archive instead of receiverMsg
 * @return N/A
 */
schema.methods.sendMessage = async function sendMessage (userToReceiveMessage, options) {
  const sender = this;
  const senderMsg = options.senderMsg || options.receiverMsg;
  // whether to save users after sending the message, defaults to true
  const saveUsers = options.save !== false;

  const newReceiverMessage = new Inbox({
    ownerId: userToReceiveMessage._id,
  });
  Object.assign(newReceiverMessage, messageDefaults(options.receiverMsg, sender));
  setUserStyles(newReceiverMessage, sender);

  userToReceiveMessage.inbox.newMessages += 1;
  userToReceiveMessage._v += 1;

  /* @TODO disabled until mobile is ready

  let excerpt;

  if (!options.receiverMsg) {
    excerpt = '';
  } else if (options.receiverMsg.length < 100) {
    excerpt = options.receiverMsg;
  } else {
    excerpt = options.receiverMsg.substring(0, 100);
  }
  userToReceiveMessage.addNotification('NEW_INBOX_MESSAGE', {
    sender: {
      id: sender._id,
      name: sender.profile.name,
    },
    excerpt,
    messageId: newMessage.id,
  });

  */

  const sendingToYourself = userToReceiveMessage._id === sender._id;

  // Do not add the message twice when sending it to yourself
  let newSenderMessage;

  if (!sendingToYourself) {
    newSenderMessage = new Inbox({
      sent: true,
      ownerId: sender._id,
    });
    Object.assign(newSenderMessage, messageDefaults(senderMsg, userToReceiveMessage));
    setUserStyles(newSenderMessage, sender);
  }

  const promises = [newReceiverMessage.save()];
  if (!sendingToYourself) promises.push(newSenderMessage.save());

  if (saveUsers) {
    promises.push(sender.save());
    if (!sendingToYourself) promises.push(userToReceiveMessage.save());
  }

  await Promise.all(promises);

  return sendingToYourself ? newReceiverMessage : newSenderMessage;
};

/**
 * Creates a notification based on the input parameters and adds
 * it to the local user notifications array.
 * This does not save the notification to the database or interact with the database in any way.
 *
 * @param  type  The type of notification to add to the this.
 * Possible values are defined in the UserNotificaiton Schema
 * @param  data  The data to add to the notification
 * @param  seen  If the notification should be marked as seen
 */
schema.methods.addNotification = function addUserNotification (type, data = {}, seen = false) {
  this.notifications.push({
    type,
    data,
    seen,
  });
};

/**
 * Creates a notification based on the type and data input parameters
  and saves that new notification
 * to the database directly using an update statement.
 * The local copy of these users are not updated by
 * this operation. Use this function when you want to add a notification to a user(s),
 * but do not have
 * the user document(s) opened.
 *
 * @param  query A Mongoose query defining the users to add the notification to.
 * @param  type  The type of notification to add to the this.
 * Possible values are defined in the UserNotificaiton Schema
 * @param  data  The data to add to the notification
 */
schema.statics.pushNotification = async function pushNotification (
  query, type, data = {}, seen = false,
) {
  const newNotification = new UserNotification({ type, data, seen });

  const validationResult = newNotification.validateSync();
  if (validationResult) {
    throw validationResult;
  }

  await this.updateMany(
    query,
    { $push: { notifications: newNotification.toObject() } },
  ).exec();
};

/**
 * Adds an achievement and a related notification to the user.
 *
 * @param  achievement The key identifying the achievement to award.
 */
schema.methods.addAchievement = function addAchievement (achievement) {
  const achievementData = common.content.achievements[achievement];
  if (!achievementData) throw new Error(`Achievement ${achievement} does not exist.`);

  this.achievements[achievement] = true;

  this.notifications.push({
    type: 'ACHIEVEMENT',
    data: {
      achievement,
    },
    seen: false,
  });
};

/**
 * Adds an achievement and a related notification to the user, saving it directly to the database
 * To be used when the user object is not loaded or we don't want to use `user.save`
 *
 * @param  query A Mongoose query defining the users to add the notification to.
 * @param  achievement The key identifying the achievement to award.
 */
schema.statics.addAchievementUpdate = async function addAchievementUpdate (query, achievement) {
  const achievementData = common.content.achievements[achievement];
  if (!achievementData) throw new Error(`Achievement ${achievement} does not exist.`);

  const newNotification = new UserNotification({
    type: 'ACHIEVEMENT',
    data: {
      achievement,
    },
    seen: false,
  });

  const validationResult = newNotification.validateSync();
  if (validationResult) throw validationResult;

  await this.updateMany(
    query,
    {
      $push: { notifications: newNotification.toObject() },
      $set: { [`achievements.${achievement}`]: true },
    },
  ).exec();
};

// Static method to add/remove properties to a JSON User object,
// For example for when the user is returned using `.lean()` and thus doesn't
// have access to any mongoose helper
schema.statics.transformJSONUser = function transformJSONUser (jsonUser, addComputedStats = false) {
  // Add id property
  jsonUser.id = jsonUser._id;

  // Remove username if not verified
  if (!jsonUser.flags.verifiedUsername) jsonUser.auth.local.username = null;

  if (addComputedStats) this.addComputedStatsToJSONObj(jsonUser.stats, jsonUser);
};

// Returns true if the user has read the last news post
schema.methods.checkNewStuff = function checkNewStuff () {
  const lastNewsPost = NewsPost.lastNewsPost();
  return Boolean(lastNewsPost && this.flags && this.flags.lastNewStuffRead !== lastNewsPost._id);
};

// Add stats.toNextLevel, stats.maxMP and stats.maxHealth
// to a JSONified User stats object
schema.statics.addComputedStatsToJSONObj = function addComputedStatsToUserJSONObj (
  userStatsJSON,
  user,
) {
  // NOTE: if an item is manually added to this.stats then
  // common/fns/predictableRandom must be tweaked so the new item is not considered.
  // Otherwise the client will have it while the server won't and the results will be different.
  userStatsJSON.toNextLevel = common.tnl(user.stats.lvl);
  userStatsJSON.maxHealth = common.maxHealth;
  userStatsJSON.maxMP = common.statsComputed(user).maxMP;

  return userStatsJSON;
};

/**
 * Cancels a subscription.
 *
 * @param  options
 * @param  options.user  The user object who is purchasing
 * @param  options.groupId  The id of the group purchasing a subscription
 * @param  options.headers  The request headers (only for Amazon subscriptions)
 * @param  options.cancellationReason  A text string to control sending an email
 *
 * @return a Promise from api.cancelSubscription()
 */
// @TODO: There is currently a three way relation between the user,
// payment methods and the payment helper
// This creates some odd Dependency Injection issues. To counter that,
// we use the user as the third layer
// To negotiate between the payment providers and the payment helper
// (which probably has too many responsibilities)
// In summary, currently is is best practice to use this method to cancel a user subscription,
// rather than calling the
// payment helper.
schema.methods.cancelSubscription = async function cancelSubscription (options = {}) {
  const { plan } = this.purchased;

  options.user = this;
  if (plan.paymentMethod === amazonPayments.constants.PAYMENT_METHOD) {
    return amazonPayments.cancelSubscription(options);
  } if (plan.paymentMethod === stripePayments.constants.PAYMENT_METHOD) {
    return stripePayments.cancelSubscription(options);
  } if (plan.paymentMethod === paypalPayments.constants.PAYMENT_METHOD) {
    return paypalPayments.subscribeCancel(options);
  }
  // Android and iOS subscriptions cannot be cancelled by Habitica.

  return payments.cancelSubscription(options);
};

schema.methods.getUtcOffset = function getUtcOffset () {
  return common.fns.getUtcOffset(this);
};

schema.methods.daysUserHasMissed = function daysUserHasMissed (now, req = {}) {
  // If the user's timezone has changed (due to travel or daylight savings),
  // cron can be triggered twice in one day, so we check for that and use
  // both timezones to work out if cron should run.
  // CDS = Custom Day Start time.
  let timezoneUtcOffsetFromUserPrefs = this.getUtcOffset();
  const timezoneUtcOffsetAtLastCron = Number.isFinite(this.preferences.timezoneOffsetAtLastCron)
    ? -this.preferences.timezoneOffsetAtLastCron
    : timezoneUtcOffsetFromUserPrefs;

  let timezoneUtcOffsetFromBrowser = typeof req.header === 'function' && -Number(req.header('x-user-timezoneoffset'));
  timezoneUtcOffsetFromBrowser = Number.isFinite(timezoneUtcOffsetFromBrowser)
    ? timezoneUtcOffsetFromBrowser
    : timezoneUtcOffsetFromUserPrefs;
  // NB: All timezone offsets can be 0, so can't use `... || ...` to apply non-zero defaults

  if (timezoneUtcOffsetFromBrowser !== timezoneUtcOffsetFromUserPrefs) {
    // The user's browser has just told Habitica that the user's timezone has
    // changed so store and use the new zone.
    this.preferences.timezoneOffset = -timezoneUtcOffsetFromBrowser;
    timezoneUtcOffsetFromUserPrefs = timezoneUtcOffsetFromBrowser;
  }

  let lastCronTime = this.lastCron;
  if (this.auth.timestamps.loggedIn < lastCronTime) {
    lastCronTime = this.auth.timestamps.loggedIn;
  }
  // How many days have we missed using the user's current timezone:
  let daysMissed = daysSince(lastCronTime, defaults({ now }, this.preferences));

  if (timezoneUtcOffsetAtLastCron !== timezoneUtcOffsetFromUserPrefs) {
    // Give the user extra time based on the difference in timezones
    if (timezoneUtcOffsetAtLastCron > timezoneUtcOffsetFromUserPrefs) {
      const differenceBetweenTimezonesInMinutes = timezoneUtcOffsetAtLastCron - timezoneUtcOffsetFromUserPrefs; // eslint-disable-line max-len
      now = moment(now).subtract(differenceBetweenTimezonesInMinutes, 'minutes'); // eslint-disable-line no-param-reassign, max-len
    }

    // Since cron last ran, the user's timezone has changed.
    // How many days have we missed using the old timezone:
    const daysMissedNewZone = daysMissed;
    const daysMissedOldZone = daysSince(lastCronTime, defaults({
      now,
      timezoneUtcOffsetOverride: timezoneUtcOffsetAtLastCron,
    }, this.preferences));

    if (timezoneUtcOffsetAtLastCron > timezoneUtcOffsetFromUserPrefs) {
      // The timezone change was in the unsafe direction.
      // E.g., timezone changes from UTC+1 (utcOffset 60) to UTC+0 (offset 0).
      //    or timezone changes from UTC-4 (utcOffset -240) to UTC-5 (utcOffset -300).
      // Local time changed from, for example, 03:00 to 02:00.

      if (daysMissedOldZone > 0 && daysMissedNewZone > 0) {
        // Both old and new timezones indicate that we SHOULD run cron, so
        // it is safe to do so immediately.
        daysMissed = Math.min(daysMissedOldZone, daysMissedNewZone);
        // use minimum value to be nice to user
      } else if (daysMissedOldZone > 0) {
        // The old timezone says that cron should run; the new timezone does not.
        // This should be impossible for this direction of timezone change, but
        // just in case I'm wrong...
        // TODO
        // console.log("zone has changed - old zone says run cron,
        // NEW zone says no - stop cron now only -- SHOULD NOT HAVE GOT TO HERE",
        // timezoneOffsetAtLastCron, timezoneOffsetFromUserPrefs, now);
        // used in production for confirming this never happens
      } else if (daysMissedNewZone > 0) {
        // The old timezone says that cron should NOT run -- i.e., cron has
        // already run today, from the old timezone's point of view.
        // The new timezone says that cron SHOULD run, but this is almost
        // certainly incorrect.
        // This happens when cron occurred at a time soon after the CDS. When
        // you reinterpret that time in the new timezone, it looks like it
        // was before the CDS, because local time has stepped backwards.
        // To fix this, rewrite the cron time to a time that the new
        // timezone interprets as being in today.

        daysMissed = 0; // prevent cron running now
        const timezoneOffsetDiff = timezoneUtcOffsetFromUserPrefs - timezoneUtcOffsetAtLastCron;
        // e.g., for dangerous zone change: -300 - -240 = -60 or 600 - 660= -60

        this.lastCron = moment(lastCronTime).subtract(timezoneOffsetDiff, 'minutes');
        // NB: We don't change this.auth.timestamps.loggedin so that will still record
        // the time that the previous cron actually ran.
        // From now on we can ignore the old timezone:
        // This is still timezoneOffset for backwards compatibility reasons.
        this.preferences.timezoneOffsetAtLastCron = -timezoneUtcOffsetAtLastCron;
      } else {
        // Both old and new timezones indicate that cron should
        // NOT run.
        daysMissed = 0; // prevent cron running now
      }
    } else if (timezoneUtcOffsetAtLastCron < timezoneUtcOffsetFromUserPrefs) {
      daysMissed = daysMissedNewZone;
      // TODO: Either confirm that there is nothing that could possibly go wrong
      // here and remove the need for this else branch, or fix stuff.
      // There are probably situations where the Dailies do not reset early enough
      // for a user who was expecting the zone change and wants to use all their Dailies
      // immediately in the new zone;
      // if so, we should provide an option for easy reset of Dailies
      // (can't be automatic because there will be other situations where
      // the user was not prepared).
    }
  }

  return { daysMissed, timezoneUtcOffsetFromUserPrefs };
};

async function getUserGroupData (user) {
  const userGroups = user.getGroups();

  const groups = await Group
    .find({
      _id: { $in: userGroups },
    })
    .select('leaderOnly leader purchased')
    .exec();

  return groups;
}

// Determine if the user can get gems: some groups restrict their members ability to obtain them.
// User is allowed to buy gems if no group has `leaderOnly.getGems` === true or if
// its the group leader
schema.methods.canGetGems = async function canObtainGems () {
  const user = this;
  const { plan } = user.purchased;

  if (!user.isSubscribed() || plan.customerId !== payments.constants.GROUP_PLAN_CUSTOMER_ID) {
    return true;
  }

  const groups = await getUserGroupData(user);

  return groups
    .every(g => !g.hasActiveGroupPlan() || g.leader === user._id || g.leaderOnly.getGems !== true);
};

schema.methods.isMemberOfGroupPlan = async function isMemberOfGroupPlan () {
  const groups = await getUserGroupData(this);

  return groups.some(g => g.hasActiveGroupPlan());
};

schema.methods.teamsLed = async function teamsLed () {
  const user = this;
  const groups = await getUserGroupData(user);

  remove(groups, group => !group.hasActiveGroupPlan);
  remove(groups, group => user._id !== group.leader);

  const groupIds = [];
  groups.forEach(group => {
    groupIds.push(group._id);
  });

  return groupIds;
};

schema.methods.isAdmin = function isAdmin () {
  return Boolean(this.contributor && this.contributor.admin);
};

schema.methods.isNewsPoster = function isNewsPoster () {
  return this.hasPermission('news');
};

schema.methods.hasPermission = function hasPermission (permission) {
  return Boolean(this.permissions && (this.permissions[permission] || this.permissions.fullAccess));
};

// When converting to json add inbox messages from the Inbox collection
// for backward compatibility in API v3.
schema.methods.toJSONWithInbox = async function userToJSONWithInbox () {
  const user = this;
  const toJSON = user.toJSON();

  if (toJSON.inbox) {
    toJSON.inbox.messages = await inboxLib.getUserInbox(user, {
      asArray: false,
    });
  }

  return toJSON;
};

schema.methods.getSecretData = function getSecretData () {
  const user = this;

  return user.secret;
};

schema.methods.updateBalance = async function updateBalance (amount,
  transactionType,
  reference,
  referenceText) {
  this.balance += amount;

  if (transactionType === 'buy_gold') {
    // Bulk these together in case the user is not using the bulk-buy feature
    const lastTransaction = await Transaction.findOne({ userId: this._id },
      null,
      { sort: { createdAt: -1 } });
    if (lastTransaction.transactionType === transactionType) {
      lastTransaction.amount += amount;
      await lastTransaction.save();
    }
  }

  await Transaction.create({
    currency: 'gems',
    userId: this._id,
    transactionType,
    amount,
    reference,
    referenceText,
    currentAmount: this.balance,
  });
};

schema.methods.updateHourglasses = async function updateHourglasses (
  amount,
  transactionType,
  reference,
  referenceText,
) {
  this.purchased.plan.consecutive.trinkets += amount;

  await Transaction.create({
    currency: 'hourglasses',
    userId: this._id,
    transactionType,
    amount,
    reference,
    referenceText,
    currentAmount: this.purchased.plan.consecutive.trinkets,
  });
};
