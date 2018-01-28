import moment from 'moment';
import common from '../../../common';

import Bluebird from 'bluebird';
import {
  chatDefaults,
  TAVERN_ID,
  model as Group,
} from '../group';

import { defaults, map, flatten, flow, compact, uniq, partialRight } from 'lodash';
import { model as UserNotification } from '../userNotification';
import schema from './schema';
import payments from '../../libs/payments';
import amazonPayments from '../../libs/amazonPayments';
import stripePayments from '../../libs/stripePayments';
import paypalPayments from '../../libs/paypalPayments';

const daysSince = common.daysSince;

schema.methods.isSubscribed = function isSubscribed () {
  const now = new Date();
  const plan = this.purchased.plan;
  return plan && plan.customerId && (!plan.dateTerminated || moment(plan.dateTerminated).isAfter(now));
};

schema.methods.hasNotCancelled = function hasNotCancelled () {
  let plan = this.purchased.plan;
  return this.isSubscribed() && !plan.dateTerminated;
};

// Get an array of groups ids the user is member of
schema.methods.getGroups = function getUserGroups () {
  let userGroups = this.guilds.slice(0); // clone this.guilds so we don't modify the original
  if (this.party._id) userGroups.push(this.party._id);
  userGroups.push(TAVERN_ID);
  return userGroups;
};

/* eslint-disable no-unused-vars */ // The checks below all get access to sndr and rcvr, but not all use both
const INTERACTION_CHECKS = Object.freeze({
  always: [
    // Revoked chat privileges block all interactions to prevent the evading of harassment protections
    // See issue #7971 for some discussion
    (sndr, rcvr) => sndr.flags.chatRevoked && 'chatPrivilegesRevoked',

    // Direct user blocks prevent all interactions
    (sndr, rcvr) => rcvr.inbox.blocks.includes(sndr._id) && 'notAuthorizedToSendMessageToThisUser',
    (sndr, rcvr) => sndr.inbox.blocks.includes(rcvr._id) && 'notAuthorizedToSendMessageToThisUser',
  ],

  'send-private-message': [
    // Private messaging has an opt-out, which does not affect other interactions
    (sndr, rcvr) => rcvr.inbox.optOut && 'notAuthorizedToSendMessageToThisUser',

    // We allow a player to message themselves so they can test how PMs work or send their own notes to themselves
  ],

  'transfer-gems': [
    // Unlike private messages, gems can't be sent to oneself
    (sndr, rcvr) => rcvr._id === sndr._id && 'cannotSendGemsToYourself',
  ],
});
/* eslint-enable no-unused-vars */

export const KNOWN_INTERACTIONS = Object.freeze(Object.keys(INTERACTION_CHECKS).filter(key => key !== 'always'));

// Get an array of error message keys that would be thrown if the given interaction was attempted
schema.methods.getObjectionsToInteraction = function getObjectionsToInteraction (interaction, receiver) {
  if (!KNOWN_INTERACTIONS.includes(interaction)) {
    throw new Error(`Unknown kind of interaction: "${interaction}", expected one of ${KNOWN_INTERACTIONS.join(', ')}`);
  }

  let sender = this;
  let checks = [
    INTERACTION_CHECKS.always,
    INTERACTION_CHECKS[interaction],
  ];

  let executeChecks = partialRight(map, (check) => check(sender, receiver));

  return flow(
    flatten,
    executeChecks,
    compact, // Remove passed checks (passed checks return falsy; failed checks return message keys)
    uniq
  )(checks);
};


/**
 * Sends a message to a this. Archives a copy in sender's inbox.
 *
 * @param  userToReceiveMessage  The receiver
 * @param  options
 * @param  options.receiverMsg   The message to send to the receiver
 * @param  options.senderMsg     The message to archive instead of receiverMsg
 * @return N/A
 */
schema.methods.sendMessage = async function sendMessage (userToReceiveMessage, options) {
  let sender = this;
  let senderMsg = options.senderMsg || options.receiverMsg;

  common.refPush(userToReceiveMessage.inbox.messages, chatDefaults(options.receiverMsg, sender));
  userToReceiveMessage.inbox.newMessages++;
  userToReceiveMessage._v++;
  userToReceiveMessage.markModified('inbox.messages');

  common.refPush(sender.inbox.messages, defaults({sent: true}, chatDefaults(senderMsg, userToReceiveMessage)));
  sender.markModified('inbox.messages');

  let promises = [userToReceiveMessage.save(), sender.save()];
  await Bluebird.all(promises);
};

/**
 * Creates a notification based on the input parameters and adds it to the local user notifications array.
 * This does not save the notification to the database or interact with the database in any way.
 *
 * @param  type  The type of notification to add to the this. Possible values are defined in the UserNotificaiton Schema
 * @param  data  The data to add to the notification
 */
schema.methods.addNotification = function addUserNotification (type, data = {}) {
  this.notifications.push({
    type,
    data,
  });
};

/**
 * Creates a notification based on the type and data input parameters and saves that new notification
 * to the database directly using an update statement. The local copy of these users are not updated by
 * this operation. Use this function when you want to add a notification to a user(s), but do not have
 * the user document(s) opened.
 *
 * @param  query A Mongoose query defining the users to add the notification to.
 * @param  type  The type of notification to add to the this. Possible values are defined in the UserNotificaiton Schema
 * @param  data  The data to add to the notification
 */
schema.statics.pushNotification = async function pushNotification (query, type, data = {}) {
  let newNotification = new UserNotification({type, data});
  let validationResult = newNotification.validateSync();
  if (validationResult) {
    throw validationResult;
  }
  await this.update(query, {$push: {notifications: newNotification}}, {multi: true}).exec();
};

// Add stats.toNextLevel, stats.maxMP and stats.maxHealth
// to a JSONified User stats object
schema.methods.addComputedStatsToJSONObj = function addComputedStatsToUserJSONObj (statsObject) {
  // NOTE: if an item is manually added to this.stats then
  // common/fns/predictableRandom must be tweaked so the new item is not considered.
  // Otherwise the client will have it while the server won't and the results will be different.
  statsObject.toNextLevel = common.tnl(this.stats.lvl);
  statsObject.maxHealth = common.maxHealth;
  statsObject.maxMP = common.statsComputed(this).maxMP;

  return statsObject;
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
// @TODO: There is currently a three way relation between the user, payment methods and the payment helper
// This creates some odd Dependency Injection issues. To counter that, we use the user as the third layer
// To negotiate between the payment providers and the payment helper (which probably has too many responsiblities)
// In summary, currently is is best practice to use this method to cancel a user subscription, rather than calling the
// payment helper.
schema.methods.cancelSubscription = async function cancelSubscription (options = {}) {
  let plan = this.purchased.plan;

  options.user = this;
  if (plan.paymentMethod === amazonPayments.constants.PAYMENT_METHOD) {
    return await amazonPayments.cancelSubscription(options);
  } else if (plan.paymentMethod === stripePayments.constants.PAYMENT_METHOD) {
    return await stripePayments.cancelSubscription(options);
  } else if (plan.paymentMethod === paypalPayments.constants.PAYMENT_METHOD) {
    return await paypalPayments.subscribeCancel(options);
  }
  // Android and iOS subscriptions cannot be cancelled by Habitica.

  return await payments.cancelSubscription(options);
};

schema.methods.daysUserHasMissed = function daysUserHasMissed (now, req = {}) {
  // If the user's timezone has changed (due to travel or daylight savings),
  // cron can be triggered twice in one day, so we check for that and use
  // both timezones to work out if cron should run.
  // CDS = Custom Day Start time.
  let timezoneOffsetFromUserPrefs = this.preferences.timezoneOffset;
  let timezoneOffsetAtLastCron = isFinite(this.preferences.timezoneOffsetAtLastCron) ? this.preferences.timezoneOffsetAtLastCron : timezoneOffsetFromUserPrefs;
  let timezoneOffsetFromBrowser = typeof req.header === 'function' && Number(req.header('x-user-timezoneoffset'));
  timezoneOffsetFromBrowser = isFinite(timezoneOffsetFromBrowser) ? timezoneOffsetFromBrowser : timezoneOffsetFromUserPrefs;
  // NB: All timezone offsets can be 0, so can't use `... || ...` to apply non-zero defaults

  if (timezoneOffsetFromBrowser !== timezoneOffsetFromUserPrefs) {
    // The user's browser has just told Habitica that the user's timezone has
    // changed so store and use the new zone.
    this.preferences.timezoneOffset = timezoneOffsetFromBrowser;
    timezoneOffsetFromUserPrefs = timezoneOffsetFromBrowser;
  }

  // How many days have we missed using the user's current timezone:
  let daysMissed = daysSince(this.lastCron, defaults({now}, this.preferences));

  if (timezoneOffsetAtLastCron !== timezoneOffsetFromUserPrefs) {
    // Give the user extra time based on the difference in timezones
    if (timezoneOffsetAtLastCron < timezoneOffsetFromUserPrefs) {
      const differenceBetweenTimezonesInMinutes = timezoneOffsetFromUserPrefs - timezoneOffsetAtLastCron;
      now = moment(now).subtract(differenceBetweenTimezonesInMinutes, 'minutes');
    }

    // Since cron last ran, the user's timezone has changed.
    // How many days have we missed using the old timezone:
    let daysMissedNewZone = daysMissed;
    let daysMissedOldZone = daysSince(this.lastCron, defaults({
      now,
      timezoneOffsetOverride: timezoneOffsetAtLastCron,
    }, this.preferences));

    if (timezoneOffsetAtLastCron < timezoneOffsetFromUserPrefs) {
      // The timezone change was in the unsafe direction.
      // E.g., timezone changes from UTC+1 (offset -60) to UTC+0 (offset 0).
      //    or timezone changes from UTC-4 (offset 240) to UTC-5 (offset 300).
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
        // console.log("zone has changed - old zone says run cron, NEW zone says no - stop cron now only -- SHOULD NOT HAVE GOT TO HERE", timezoneOffsetAtLastCron, timezoneOffsetFromUserPrefs, now); // used in production for confirming this never happens
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
        let timezoneOffsetDiff = timezoneOffsetAtLastCron - timezoneOffsetFromUserPrefs;
        // e.g., for dangerous zone change: 240 - 300 = -60 or  -660 - -600 = -60

        this.lastCron = moment(this.lastCron).subtract(timezoneOffsetDiff, 'minutes');
        // NB: We don't change this.auth.timestamps.loggedin so that will still record the time that the previous cron actually ran.
        // From now on we can ignore the old timezone:
        this.preferences.timezoneOffsetAtLastCron = timezoneOffsetFromUserPrefs;
      } else {
        // Both old and new timezones indicate that cron should
        // NOT run.
        daysMissed = 0; // prevent cron running now
      }
    } else if (timezoneOffsetAtLastCron > timezoneOffsetFromUserPrefs) {
      daysMissed = daysMissedNewZone;
      // TODO: Either confirm that there is nothing that could possibly go wrong here and remove the need for this else branch, or fix stuff.
      // There are probably situations where the Dailies do not reset early enough for a user who was expecting the zone change and wants to use all their Dailies immediately in the new zone;
      // if so, we should provide an option for easy reset of Dailies (can't be automatic because there will be other situations where the user was not prepared).
    }
  }

  return {daysMissed, timezoneOffsetFromUserPrefs};
};

async function getUserGroupData (user) {
  const userGroups = user.getGroups();

  const groups = await Group
    .find({
      _id: {$in: userGroups},
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
  const plan = user.purchased.plan;

  if (!user.isSubscribed() || plan.customerId !== payments.constants.GROUP_PLAN_CUSTOMER_ID) {
    return true;
  }

  const groups = await getUserGroupData(user);

  return groups.every(g => {
    return !g.isSubscribed() || g.leader === user._id || g.leaderOnly.getGems !== true;
  });
};

schema.methods.isMemberOfGroupPlan = async function isMemberOfGroupPlan () {
  const groups = await getUserGroupData(this);

  return groups.every(g => {
    return g.isSubscribed();
  });
};

schema.methods.isAdmin = function isAdmin () {
  return this.contributor && this.contributor.admin;
};
