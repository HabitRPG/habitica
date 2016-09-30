import common from '../../../common';
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
