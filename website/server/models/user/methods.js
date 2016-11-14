import moment from 'moment';
import common from '../../../common';
import nconf from 'nconf';
import Bluebird from 'bluebird';
import {
  chatDefaults,
  TAVERN_ID,
} from '../group';
import { model as Group } from '../group';
import { getGroupUrl, sendTxn } from '../../libs/email';
import { defaults } from 'lodash';
import { model as UserNotification } from '../userNotification';
import slack from '../../libs/slack';
import schema from './schema';
import payments from '../../libs/payments';
import amazonPayments from '../../libs/amazonPayments';
import stripePayments from '../../libs/stripePayments';
import paypalPayments from '../../libs/paypalPayments';

const SLUR_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

schema.methods.isSubscribed = function isSubscribed () {
  let now = new Date();
  let plan = this.purchased.plan;

  return plan && plan.customerId && (!plan.dateTerminated || moment(plan.dateTerminated).isAfter(now));
};

schema.methods.hasNotCancelled = function hasNotCancelled () {
  let plan = this.purchased.plan;
  return this.isSubscribed() && !plan.dateTerminated;
};

// Get an array of groups ids the user is member of
schema.methods.getGroups = function getUserGroups () {
  let userGroups = this.guilds.slice(0); // clone user.guilds so we don't modify the original
  if (this.party._id) userGroups.push(this.party._id);
  userGroups.push(TAVERN_ID);
  return userGroups;
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
 * @param  type  The type of notification to add to the user. Possible values are defined in the UserNotificaiton Schema
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
 * @param  type  The type of notification to add to the user. Possible values are defined in the UserNotificaiton Schema
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
  // NOTE: if an item is manually added to user.stats then
  // common/fns/predictableRandom must be tweaked so the new item is not considered.
  // Otherwise the client will have it while the server won't and the results will be different.
  statsObject.toNextLevel = common.tnl(this.stats.lvl);
  statsObject.maxHealth = common.maxHealth;
  statsObject.maxMP = common.statsComputed(this).maxMP;

  return statsObject;
};


// @TODO: There is currently a three way relation between the user, payment methods and the payment helper
// This creates some odd Dependency Injection issues. To counter that, we use the user as the third layer
// To negotiate between the payment providers and the payment helper (which probably has too many responsiblities)
// In summary, currently is is best practice to use this method to cancel a user subscription, rather than calling the
// payment helper.
schema.methods.cancelSubscription = async function cancelSubscription () {
  let plan = this.purchased.plan;

  if (plan.paymentMethod === amazonPayments.constants.PAYMENT_METHOD) {
    return await amazonPayments.cancelSubscription({user: this});
  } else if (plan.paymentMethod === stripePayments.constants.PAYMENT_METHOD) {
    return await stripePayments.cancelSubscription({user: this});
  } else if (plan.paymentMethod === paypalPayments.constants.PAYMENT_METHOD) {
    return await paypalPayments.subscribeCancel({user: this});
  }

  return await payments.cancelSubscription({user: this});

// Mute a user and notify the moderators
schema.methods.muteUser = async function muteUser (message, groupId) {


// Mute a user and notify the moderators
schema.methods.muteUser = async function muteUser (message, groupId) {
  let user = this;

  user.flags.chatRevoked = true;
  // await user.save()

  let group = await Group.getGroup({
    user,
    groupId,
    optionalMembership: user.contributor.admin,
  });

  let authorEmail = user.auth.local.email;
  let groupUrl = getGroupUrl(group);

  let report =  [
    {name: 'MESSAGE_TIME', content: (new Date()).toString()},
    {name: 'MESSAGE_TEXT', content: message},

    {name: 'AUTHOR_USERNAME', content: user.profile.name},
    {name: 'AUTHOR_UUID', content: user._id},
    {name: 'AUTHOR_EMAIL', content: authorEmail},
    {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${message.uuid}`},

    {name: 'GROUP_NAME', content: group.name},
    {name: 'GROUP_TYPE', content: group.type},
    {name: 'GROUP_ID', content: group._id},
    {name: 'GROUP_URL', content: groupUrl},
  ];

  sendTxn(SLUR_REPORT_EMAILS, 'slur-report-to-mods', report);

  slack.sendSlurNotification({
    authorEmail,
    user,
    group,
    message,
  });
};
