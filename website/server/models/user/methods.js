import common from '../../../../common';
import Bluebird from 'bluebird';
import {
  chatDefaults,
  TAVERN_ID,
} from '../group';
import { defaults } from 'lodash';

import schema from './schema';

schema.methods.isSubscribed = function isSubscribed () {
  return !!this.purchased.plan.customerId; // eslint-disable-line no-implicit-coercion
};

// Get an array of groups ids the user is member of
schema.methods.getGroups = function getUserGroups () {
  let userGroups = this.guilds.slice(0); // clone user.guilds so we don't modify the original
  if (this.party._id) userGroups.push(this.party._id);
  userGroups.push(TAVERN_ID);
  return userGroups;
};

// Get an array of error message keys that would be thrown if the given interaction was attempted
schema.methods.getObjectionsToInteractionIfAny = function getObjectionsToInteractionIfAny (interaction, receiver) {
  let sender = this;

  /* eslint-disable no-unused-vars */
  let checks = {
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

      // NB: We allow a player to message themselves so they can test how PMs work or send their own notes to themselves
    ],

    'transfer-gems': [
      // Unlike private messages, gems can't be sent to oneself
      (sndr, rcvr) => rcvr._id === sndr._id && 'cannotSendGemsToYourself',
    ],
  };
  /* eslint-enable no-unused-vars */

  let knownInteractions = Object.keys(checks).filter((k) => k !== 'always');

  if (!knownInteractions.includes(interaction)) {
    throw new Error(`Unknown kind of interaction: "${interaction}", expected one of ${knownInteractions.join(', ')}`);
  }

  let checksToRun = checks.always.concat(checks[interaction]);
  let results = checksToRun.map((test) => test(sender, receiver));
  let objections = results.filter((objection) => Boolean(objection));

  return objections;
};

schema.methods.sendMessage = async function sendMessage (userToReceiveMessage, message) {
  let sender = this;

  common.refPush(userToReceiveMessage.inbox.messages, chatDefaults(message, sender));
  userToReceiveMessage.inbox.newMessages++;
  userToReceiveMessage._v++;
  userToReceiveMessage.markModified('inbox.messages');

  common.refPush(sender.inbox.messages, defaults({sent: true}, chatDefaults(message, userToReceiveMessage)));
  sender.markModified('inbox.messages');

  let promises = [userToReceiveMessage.save(), sender.save()];
  await Bluebird.all(promises);
};

schema.methods.addNotification = function addUserNotification (type, data = {}) {
  this.notifications.push({
    type,
    data,
  });
};

// Add stats.toNextLevel, stats.maxMP and stats.maxHealth
// to a JSONified User object
schema.methods.addComputedStatsToJSONObj = function addComputedStatsToUserJSONObj (obj) {
  // NOTE: if an item is manually added to user.stats then
  // common/fns/predictableRandom must be tweaked so the new item is not considered.
  // Otherwise the client will have it while the server won't and the results will be different.
  obj.stats.toNextLevel = common.tnl(this.stats.lvl);
  obj.stats.maxHealth = common.maxHealth;
  obj.stats.maxMP = common.statsComputed(this).maxMP;
};