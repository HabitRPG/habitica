import moment from 'moment';
import mongoose from 'mongoose';
import {
  model as User,
  nameFields,
} from './user';
import shared from '../../common';
import _  from 'lodash';
import { model as Challenge} from './challenge';
import * as Tasks from './task';
import validator from 'validator';
import { removeFromArray } from '../libs/collectionManipulators';
import payments from '../libs/payments';
import { groupChatReceivedWebhook } from '../libs/webhook';
import {
  InternalServerError,
  BadRequest,
  NotAuthorized,
} from '../libs/errors';
import baseModel from '../libs/baseModel';
import { sendTxn as sendTxnEmail } from '../libs/email';
import Bluebird from 'bluebird';
import nconf from 'nconf';
import { sendNotification as sendPushNotification } from '../libs/pushNotifications';
import pusher from '../libs/pusher';
import {
  syncableAttrs,
} from '../libs/taskManager';
import {
  schema as SubscriptionPlanSchema,
} from './subscriptionPlan';
import amazonPayments from '../libs/amazonPayments';
import stripePayments from '../libs/stripePayments';

const questScrolls = shared.content.quests;
const Schema = mongoose.Schema;

export const INVITES_LIMIT = 100; // must not be greater than MAX_EMAIL_INVITES_BY_USER
export const TAVERN_ID = shared.TAVERN_ID;

const NO_CHAT_NOTIFICATIONS = [TAVERN_ID];
const LARGE_GROUP_COUNT_MESSAGE_CUTOFF = shared.constants.LARGE_GROUP_COUNT_MESSAGE_CUTOFF;
const MAX_SUMMARY_SIZE_FOR_GUILDS = shared.constants.MAX_SUMMARY_SIZE_FOR_GUILDS;
const GUILDS_PER_PAGE = shared.constants.GUILDS_PER_PAGE;

const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';
const MAX_UPDATE_RETRIES = 5;

/*
#  Spam constants to limit people from sending too many messages too quickly
#    SPAM_MESSAGE_LIMIT - The amount of messages that can be sent in a time window
#    SPAM_WINDOW_LENGTH - The window length for spam protection in milliseconds
#    SPAM_MIN_EXEMPT_CONTRIB_LEVEL - Anyone at or above this level is exempt
*/
export const SPAM_MESSAGE_LIMIT = 2;
export const SPAM_WINDOW_LENGTH = 60000; // 1 minute
export const SPAM_MIN_EXEMPT_CONTRIB_LEVEL = 4;

export let schema = new Schema({
  name: {type: String, required: true},
  summary: {type: String, maxlength: MAX_SUMMARY_SIZE_FOR_GUILDS},
  description: String,
  leader: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  type: {type: String, enum: ['guild', 'party'], required: true},
  privacy: {type: String, enum: ['private', 'public'], default: 'private', required: true},
  chat: Array,
  /*
  #    [{
  #      timestamp: Date
  #      user: String
  #      text: String
  #      contributor: String
  #      uuid: String
  #      id: String
  #    }]
  */
  leaderOnly: { // restrict group actions to leader (members can't do them)
    challenges: {type: Boolean, default: false, required: true},
    // invites: {type: Boolean, default: false, required: true},
    // Some group plans prevent members from getting gems
    getGems: {type: Boolean, default: false},
  },
  memberCount: {type: Number, default: 1},
  challengeCount: {type: Number, default: 0},
  balance: {type: Number, default: 0},
  logo: String,
  leaderMessage: String,
  quest: {
    key: String,
    active: {type: Boolean, default: false},
    leader: {type: String, ref: 'User'},
    progress: {
      hp: Number,
      collect: {type: Schema.Types.Mixed, default: () => {
        return {};
      }}, // {feather: 5, ingot: 3}
      rage: Number, // limit break / "energy stored in shell", for explosion-attacks
    },

    // Shows boolean for each party-member who has accepted the quest. Eg {UUID: true, UUID: false}. Once all users click
    // 'Accept', the quest begins. If a false user waits too long, probably a good sign to prod them or boot them.
    // TODO when booting user, remove from .joined and check again if we can now start the quest
    members: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    extra: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
  },
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
  },
  purchased: {
    plan: {type: SubscriptionPlanSchema, default: () => {
      return {};
    }},
  },
  managers: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},
  categories: [{
    slug: {type: String},
    name: {type: String},
  }],
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['_id', 'balance', 'quest', 'memberCount', 'chat', 'challengeCount', 'tasksOrder', 'purchased', 'managers'],
  private: ['purchased.plan'],
  toJSONTransform (plainObj, originalDoc) {
    if (plainObj.purchased) plainObj.purchased.active = originalDoc.isSubscribed();
  },
});

schema.pre('init', function ensureSummaryIsFetched (next, group) {
  // The Vue website makes the summary be mandatory for all new groups, but the
  // Angular website did not, and the API does not yet for backwards-compatibilty.
  // When any guild without a summary is fetched from the database, this code
  // supplies the name as the summary. This can be removed when all guilds have
  // a summary and the API makes it mandatory (a breaking change!)
  // NOTE: the Tavern and parties do NOT need summaries so ensure they don't break
  // if we remove this code.
  if (!group.summary) {
    group.summary = group.name ? group.name.substring(0, MAX_SUMMARY_SIZE_FOR_GUILDS) : ' ';
  }
  next();
});

// A list of additional fields that cannot be updated (but can be set on creation)
let noUpdate = ['privacy', 'type'];
schema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return this.sanitize(updateObj, noUpdate);
};

// Basic fields to fetch for populating a group info
export let basicFields = 'name type privacy leader summary categories';

schema.pre('remove', true, async function preRemoveGroup (next, done) {
  next();
  try {
    await this.removeGroupInvitations();
    done();
  } catch (err) {
    done(err);
  }
});

// return a clean object for user.quest
function _cleanQuestProgress (merge) {
  let clean = {
    key: null,
    progress: {
      up: 0,
      down: 0,
      collect: {},
      collectedItems: 0,
    },
    completed: null,
    RSVPNeeded: false,
  };

  if (merge) {
    _.merge(clean, _.omit(merge, 'progress'));
    if (merge.progress) _.merge(clean.progress, merge.progress);
  }

  return clean;
}

schema.statics.getGroup = async function getGroup (options = {}) {
  let {user, groupId, fields, optionalMembership = false, populateLeader = false, requireMembership = false} = options;
  let query;

  let isUserParty = groupId === 'party' || user.party._id === groupId;
  let isUserGuild = user.guilds.indexOf(groupId) !== -1;
  let isTavern = ['habitrpg', TAVERN_ID].indexOf(groupId) !== -1;

  // When requireMembership is true check that user is member even in public guild
  if (requireMembership && !isUserParty && !isUserGuild && !isTavern) {
    return null;
  }

  // When optionalMembership is true it's not required for the user to be a member of the group
  if (isUserParty) {
    query = {type: 'party', _id: user.party._id};
  } else if (isTavern) {
    query = {_id: TAVERN_ID};
  } else if (optionalMembership === true) {
    query = {_id: groupId};
  } else if (isUserGuild) {
    query = {type: 'guild', _id: groupId};
  } else {
    query = {type: 'guild', privacy: 'public', _id: groupId};
  }

  let mQuery = this.findOne(query);
  if (fields) mQuery.select(fields);
  if (populateLeader === true) mQuery.populate('leader', nameFields);
  let group = await mQuery.exec();

  if (!group) {
    if (groupId === user.party._id) {
      // reset party object to default state
      user.party = {};
    } else {
      removeFromArray(user.guilds, groupId);
    }
    await user.save();
  }

  return group;
};

export const VALID_QUERY_TYPES = ['party', 'guilds', 'privateGuilds', 'publicGuilds', 'tavern'];

schema.statics.getGroups = async function getGroups (options = {}) {
  let {
    user, types, groupFields = basicFields,
    sort = '-memberCount', populateLeader = false,
    paginate = false, page = 0, // optional pagination for public guilds
    filters = {},
  } = options;
  let queries = [];

  // Throw error if an invalid type is supplied
  let areValidTypes = types.every(type => VALID_QUERY_TYPES.indexOf(type) !== -1);
  if (!areValidTypes) throw new BadRequest(shared.i18n.t('groupTypesRequired'));

  types.forEach(type => {
    switch (type) {
      case 'party': {
        queries.push(this.getGroup({user, groupId: 'party', fields: groupFields, populateLeader}));
        break;
      }
      case 'guilds': {
        let query = {
          type: 'guild',
          _id: {$in: user.guilds},
        };
        _.assign(query, filters);
        let userGuildsQuery = this.find(query).select(groupFields);
        if (populateLeader === true) userGuildsQuery.populate('leader', nameFields);
        userGuildsQuery.sort(sort).exec();
        queries.push(userGuildsQuery);
        break;
      }
      case 'privateGuilds': {
        let query = {
          type: 'guild',
          privacy: 'private',
          _id: {$in: user.guilds},
        };
        _.assign(query, filters);
        let privateGuildsQuery = this.find(query).select(groupFields);
        if (populateLeader === true) privateGuildsQuery.populate('leader', nameFields);
        privateGuildsQuery.sort(sort).exec();
        queries.push(privateGuildsQuery);
        break;
      }
      // NOTE: when returning publicGuilds we use `.lean()` so all mongoose methods won't be available.
      // Docs are going to be plain javascript objects
      case 'publicGuilds': {
        let query = {
          type: 'guild',
          privacy: 'public',
        };
        _.assign(query, filters);
        let publicGuildsQuery = this.find(query).select(groupFields);
        if (populateLeader === true) publicGuildsQuery.populate('leader', nameFields);
        if (paginate === true) publicGuildsQuery.limit(GUILDS_PER_PAGE).skip(page * GUILDS_PER_PAGE);
        publicGuildsQuery.sort(sort).lean().exec();
        queries.push(publicGuildsQuery);
        break;
      }
      case 'tavern': {
        if (types.indexOf('publicGuilds') === -1) {
          queries.push(this.getGroup({user, groupId: TAVERN_ID, fields: groupFields}));
        }
        break;
      }
    }
  });

  let groupsArray = _.reduce(await Bluebird.all(queries), (previousValue, currentValue) => {
    if (_.isEmpty(currentValue)) return previousValue; // don't add anything to the results if the query returned null or an empty array
    return previousValue.concat(Array.isArray(currentValue) ? currentValue : [currentValue]); // otherwise concat the new results to the previousValue
  }, []);

  return groupsArray;
};

// When converting to json remove chat messages with more than 1 flag and remove all flags info
// unless the user is an admin or said chat is posted by that user
// Not putting into toJSON because there we can't access user
// It also removes the _meta field that can be stored inside a chat message
schema.statics.toJSONCleanChat = function groupToJSONCleanChat (group, user) {
  let toJSON = group.toJSON();

  if (!user.contributor.admin) {
    _.remove(toJSON.chat, chatMsg => {
      chatMsg.flags = {};
      if (chatMsg._meta) chatMsg._meta = undefined;
      return user._id !== chatMsg.uuid && chatMsg.flagCount >= 2;
    });
  }

  return toJSON;
};

/**
 * Checks invitation uuids and emails for possible errors.
 *
 * @param  uuids  An array of user ids
 * @param  emails  An array of emails
 * @param  res  Express res object for use with translations
 * @throws BadRequest An error describing the issue with the invitations
 */
schema.statics.validateInvitations = async function getInvitationError (uuids, emails, res, group = null) {
  let uuidsIsArray = Array.isArray(uuids);
  let emailsIsArray = Array.isArray(emails);
  let emptyEmails = emailsIsArray && emails.length < 1;
  let emptyUuids = uuidsIsArray && uuids.length < 1;

  let errorString;

  if (!uuids && !emails) {
    errorString = 'canOnlyInviteEmailUuid';
  } else if (uuids && !uuidsIsArray) {
    errorString = 'uuidsMustBeAnArray';
  } else if (emails && !emailsIsArray) {
    errorString = 'emailsMustBeAnArray';
  } else if (!emails && emptyUuids) {
    errorString = 'inviteMissingUuid';
  } else if (!uuids && emptyEmails) {
    errorString = 'inviteMissingEmail';
  } else if (emptyEmails && emptyUuids) {
    errorString = 'inviteMustNotBeEmpty';
  }

  if (errorString) {
    throw new BadRequest(res.t(errorString));
  }

  let totalInvites = 0;

  if (uuids) {
    totalInvites += uuids.length;
  }

  if (emails) {
    totalInvites += emails.length;
  }

  if (totalInvites > INVITES_LIMIT) {
    throw new BadRequest(res.t('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT}));
  }

  // If party, check the limit of members
  if (group && group.type === 'party') {
    let memberCount = 0;

    // Counting the members that already joined the party
    memberCount += group.memberCount;

    // Count how many invitations currently exist in the party
    let query = {};
    query['invitations.party.id'] = group._id;
    // @TODO invitations are now stored like this: `'invitations.parties': []`
    let groupInvites = await User.count(query).exec();
    memberCount += groupInvites;

    // Counting the members that are going to be invited by email and uuids
    memberCount += totalInvites;

    if (memberCount > shared.constants.PARTY_LIMIT_MEMBERS) {
      throw new BadRequest(res.t('partyExceedsMembersLimit', {maxMembersParty: shared.constants.PARTY_LIMIT_MEMBERS}));
    }
  }
};

schema.methods.getParticipatingQuestMembers = function getParticipatingQuestMembers () {
  return Object.keys(this.quest.members).filter(member => this.quest.members[member]);
};

schema.methods.removeGroupInvitations = async function removeGroupInvitations () {
  let group = this;

  let usersToRemoveInvitationsFrom = await User.find({
    [`invitations.${group.type}${group.type === 'guild' ? 's' : ''}.id`]: group._id,
  }).exec();

  let userUpdates = usersToRemoveInvitationsFrom.map(user => {
    if (group.type === 'party') {
      removeFromArray(user.invitations.parties, { id: group._id });
      user.invitations.party = user.invitations.parties.length > 0 ? user.invitations.parties[user.invitations.parties.length - 1] : {};
      this.markModified('invitations.party');
    } else {
      removeFromArray(user.invitations.guilds, { id: group._id });
    }
    return user.save();
  });

  return Bluebird.all(userUpdates);
};

// Return true if user is a member of the group
schema.methods.isMember = function isGroupMember (user) {
  if (this._id === TAVERN_ID) {
    return true; // everyone is considered part of the tavern
  } else if (this.type === 'party') {
    return user.party._id === this._id ? true : false;
  } else { // guilds
    return user.guilds.indexOf(this._id) !== -1;
  }
};

export function chatDefaults (msg, user) {
  let message = {
    id: shared.uuid(),
    text: msg,
    timestamp: Number(new Date()),
    likes: {},
    flags: {},
    flagCount: 0,
  };

  if (user) {
    _.defaults(message, {
      uuid: user._id,
      contributor: user.contributor && user.contributor.toObject(),
      backer: user.backer && user.backer.toObject(),
      user: user.profile.name,
    });
  } else {
    message.uuid = 'system';
  }

  return message;
}

schema.methods.sendChat = function sendChat (message, user, metaData) {
  let newMessage = chatDefaults(message, user);

  // Optional data stored in the chat message but not returned
  // to the users that can be stored for debugging purposes
  if (metaData) {
    newMessage._meta = metaData;
  }

  this.chat.unshift(newMessage);

  const MAX_CHAT_COUNT = 200;
  const MAX_SUBBED_GROUP_CHAT_COUNT = 400;

  let maxCount = MAX_CHAT_COUNT;

  if (this.isSubscribed()) {
    maxCount = MAX_SUBBED_GROUP_CHAT_COUNT;
  }

  this.chat.splice(maxCount);

  // do not send notifications for guilds with more than 5000 users and for the tavern
  if (NO_CHAT_NOTIFICATIONS.indexOf(this._id) !== -1 || this.memberCount > LARGE_GROUP_COUNT_MESSAGE_CUTOFF) {
    return;
  }

  // Kick off chat notifications in the background.
  let lastSeenUpdate = {$set: {
    [`newMessages.${this._id}`]: {name: this.name, value: true},
  }};
  let query = {};

  if (this.type === 'party') {
    query['party._id'] = this._id;
  } else {
    query.guilds = this._id;
  }

  query._id = { $ne: user ? user._id : ''};

  User.update(query, lastSeenUpdate, {multi: true}).exec();

  // If the message being sent is a system message (not gone through the api.postChat controller)
  // then notify Pusher about it (only parties for now)
  if (newMessage.uuid === 'system' && this.privacy === 'private' && this.type === 'party') {
    pusher.trigger(`presence-group-${this._id}`, 'new-chat', newMessage);
  }

  return newMessage;
};

schema.methods.startQuest = async function startQuest (user) {
  // not using i18n strings because these errors are meant for devs who forgot to pass some parameters
  if (this.type !== 'party') throw new InternalServerError('Must be a party to use this method');
  if (!this.quest.key) throw new InternalServerError('Party does not have a pending quest');
  if (this.quest.active) throw new InternalServerError('Quest is already active');

  let userIsParticipating = this.quest.members[user._id];
  let quest = questScrolls[this.quest.key];
  let collected = {};
  if (quest.collect) {
    collected = _.transform(quest.collect, (result, n, itemToCollect) => {
      result[itemToCollect] = 0;
    });
  }

  this.markModified('quest');
  this.quest.active = true;
  if (quest.boss) {
    this.quest.progress.hp = quest.boss.hp;
    if (quest.boss.rage) this.quest.progress.rage = 0;
  } else if (quest.collect) {
    this.quest.progress.collect = collected;
  }

  let nonMembers = Object.keys(_.pickBy(this.quest.members, (member) => {
    return !member;
  }));

  // Changes quest.members to only include participating members
  this.quest.members = _.pickBy(this.quest.members, _.identity);
  let nonUserQuestMembers = _.keys(this.quest.members);
  removeFromArray(nonUserQuestMembers, user._id);

  // remove any users from quest.members who aren't in the party
  let partyId = this._id;
  let questMembers = this.quest.members;
  await Bluebird.map(Object.keys(this.quest.members), async (memberId) => {
    let member = await User.findOne({_id: memberId, 'party._id': partyId}).select('_id').lean().exec();

    if (!member) {
      delete questMembers[memberId];
    }
  });

  if (userIsParticipating) {
    user.party.quest.key = this.quest.key;
    user.party.quest.progress.down = 0;
    user.party.quest.completed = null;
    user.markModified('party.quest');
  }

  // Remove the quest from the quest leader items (if they are the current user)
  if (this.quest.leader === user._id) {
    user.items.quests[this.quest.key] -= 1;
    user.markModified('items.quests');
  } else { // another user is starting the quest, update the leader separately
    await User.update({_id: this.quest.leader}, {
      $inc: {
        [`items.quests.${this.quest.key}`]: -1,
      },
    }).exec();
  }

  // update the remaining users
  await User.update({
    _id: { $in: nonUserQuestMembers },
  }, {
    $set: {
      'party.quest.key': this.quest.key,
      'party.quest.progress.down': 0,
      'party.quest.completed': null,
    },
  }, { multi: true }).exec();

  // update the users who are not participating
  // Do not block updates
  User.update({
    _id: { $in: nonMembers },
  }, {
    $set: {
      'party.quest': _cleanQuestProgress(),
    },
  }, { multi: true }).exec();

  // send notifications in the background without blocking
  User.find(
    { _id: { $in: nonUserQuestMembers } },
    'party.quest items.quests auth.facebook auth.local preferences.emailNotifications preferences.pushNotifications pushDevices profile.name'
  ).exec().then((membersToNotify) => {
    let membersToEmail = _.filter(membersToNotify, (member) => {
      // send push notifications and filter users that disabled emails
      return member.preferences.emailNotifications.questStarted !== false &&
        member._id !== user._id;
    });
    sendTxnEmail(membersToEmail, 'quest-started', [
      { name: 'PARTY_URL', content: '/party' },
    ]);
    let membersToPush = _.filter(membersToNotify, (member) => {
      // send push notifications and filter users that disabled emails
      return member.preferences.pushNotifications.questStarted !== false &&
        member._id !== user._id;
    });
    _.each(membersToPush, (member) => {
      sendPushNotification(member,
        {
          title: quest.text(),
          message: `${shared.i18n.t('questStarted')}: ${quest.text()}`,
          identifier: 'questStarted',
        });
    });
  });
  this.sendChat(`\`Your quest, ${quest.text('en')}, has started.\``, null, {
    participatingMembers: this.getParticipatingQuestMembers().join(', '),
  });
};

schema.methods.sendGroupChatReceivedWebhooks = function sendGroupChatReceivedWebhooks (chat) {
  let query = {
    webhooks: {
      $elemMatch: {
        type: 'groupChatReceived',
        'options.groupId': this._id,
      },
    },
  };

  if (this.type === 'party') {
    query['party._id'] = this._id;
  } else {
    query.guilds = this._id;
  }

  User.find(query).select({webhooks: 1}).lean().exec().then((users) => {
    users.forEach((user) => {
      let { webhooks } = user;
      groupChatReceivedWebhook.send(webhooks, {
        group: this,
        chat,
      });
    });
  });
};

schema.statics.cleanQuestProgress = _cleanQuestProgress;

// returns a clean object for group.quest
schema.statics.cleanGroupQuest = function cleanGroupQuest () {
  return {
    key: null,
    active: false,
    leader: null,
    progress: {
      collect: {},
    },
    members: {},
  };
};

function _getUserUpdateForQuestReward (itemToAward, allAwardedItems) {
  let updates = {
    $set: {},
    $inc: {},
  };
  let dropK = itemToAward.key;

  switch (itemToAward.type) {
    case 'gear': {
      // TODO This means they can lose their new gear on death, is that what we want?
      updates.$set[`items.gear.owned.${dropK}`] = true;
      break;
    }
    case 'eggs':
    case 'food':
    case 'hatchingPotions':
    case 'quests': {
      updates.$inc[`items.${itemToAward.type}.${dropK}`] = _.filter(allAwardedItems, {type: itemToAward.type, key: itemToAward.key}).length;
      break;
    }
    case 'pets': {
      updates.$set[`items.pets.${dropK}`] = 5;
      break;
    }
    case 'mounts': {
      updates.$set[`items.mounts.${dropK}`] = true;
      break;
    }
  }
  updates = _.omitBy(updates, _.isEmpty);
  return updates;
}

async function _updateUserWithRetries (userId, updates, numTry = 1, query = {}) {
  query._id = userId;
  return await User.update(query, updates).exec()
    .then((raw) => {
      return raw;
    }).catch((err) => {
      if (numTry < MAX_UPDATE_RETRIES) {
        return _updateUserWithRetries(userId, updates, ++numTry);
      } else {
        throw err;
      }
    });
}

// Participants: Grant rewards & achievements, finish quest.
// Changes the group object update members
schema.methods.finishQuest = async function finishQuest (quest) {
  let questK = quest.key;
  let updates = {
    $inc: {
      [`achievements.quests.${questK}`]: 1,
      'stats.gp': Number(quest.drop.gp),
      'stats.exp': Number(quest.drop.exp),
    },
    $set: {},
  };

  if (this._id === TAVERN_ID) {
    updates.$set['party.quest.completed'] = questK; // Just show the notif
  } else {
    updates.$set['party.quest'] = _cleanQuestProgress({completed: questK}); // clear quest progress
  }

  _.each(_.reject(quest.drop.items, 'onlyOwner'), (item) => {
    _.merge(updates, _getUserUpdateForQuestReward(item, quest.drop.items));
  });

  let questOwnerUpdates = {};
  let questLeader = this.quest.leader;

  _.each(_.filter(quest.drop.items, 'onlyOwner'), (item) => {
    _.merge(questOwnerUpdates, _getUserUpdateForQuestReward(item, quest.drop.items));
  });
  _.merge(questOwnerUpdates, updates);

  let participants = this._id === TAVERN_ID ? {} : this.getParticipatingQuestMembers();
  this.quest = {};
  this.markModified('quest');

  if (this._id === TAVERN_ID) {
    return await User.update({}, updates, {multi: true}).exec();
  }

  let promises = participants.map(userId => {
    if (userId === questLeader) {
      return _updateUserWithRetries(userId, questOwnerUpdates);
    } else {
      return _updateUserWithRetries(userId, updates);
    }
  });

  if (questK === 'lostMasterclasser4') {
    let lostMasterclasserQuery = {
      'achievements.lostMasterclasser': {$ne: true},
      'achievements.quests.mayhemMistiflying1': {$gt: 0},
      'achievements.quests.mayhemMistiflying2': {$gt: 0},
      'achievements.quests.mayhemMistiflying3': {$gt: 0},
      'achievements.quests.stoikalmCalamity1': {$gt: 0},
      'achievements.quests.stoikalmCalamity2': {$gt: 0},
      'achievements.quests.stoikalmCalamity3': {$gt: 0},
      'achievements.quests.taskwoodsTerror1': {$gt: 0},
      'achievements.quests.taskwoodsTerror2': {$gt: 0},
      'achievements.quests.taskwoodsTerror3': {$gt: 0},
      'achievements.quests.dilatoryDistress1': {$gt: 0},
      'achievements.quests.dilatoryDistress2': {$gt: 0},
      'achievements.quests.dilatoryDistress3': {$gt: 0},
      'achievements.quests.lostMasterclasser1': {$gt: 0},
      'achievements.quests.lostMasterclasser2': {$gt: 0},
      'achievements.quests.lostMasterclasser3': {$gt: 0},
    };
    let lostMasterclasserUpdate = {
      $set: {'achievements.lostMasterclasser': true},
    };
    promises.concat(participants.map(userId => {
      return _updateUserWithRetries(userId, lostMasterclasserUpdate, null, lostMasterclasserQuery);
    }));
  }

  return Bluebird.all(promises);
};

function _isOnQuest (user, progress, group) {
  return group && progress && group.quest && group.quest.active && group.quest.members[user._id] === true;
}

schema.methods._processBossQuest = async function processBossQuest (options) {
  let {
    user,
    progress,
  } = options;

  let group = this;
  let quest = questScrolls[group.quest.key];
  let down = progress.down * quest.boss.str; // multiply by boss strength
  // Everyone takes damage
  let updates = {
    $inc: {'stats.hp': down},
  };

  group.quest.progress.hp -= progress.up;
  // TODO Create a party preferred language option so emits like this can be localized. Suggestion: Always display the English version too. Or, if English is not displayed to the players, at least include it in a new field in the chat object that's visible in the database - essential for admins when troubleshooting quests!
  let playerAttack = `${user.profile.name} attacks ${quest.boss.name('en')} for ${progress.up.toFixed(1)} damage.`;
  let bossAttack = CRON_SAFE_MODE || CRON_SEMI_SAFE_MODE ? `${quest.boss.name('en')} does not attack, because it respects the fact that there are some bugs\` \`post-maintenance and it doesn't want to hurt anyone unfairly. It will continue its rampage soon!` : `${quest.boss.name('en')} attacks party for ${Math.abs(down).toFixed(1)} damage.`;
  // TODO Consider putting the safe mode boss attack message in an ENV var
  group.sendChat(`\`${playerAttack}\` \`${bossAttack}\``);

  // If boss has Rage, increment Rage as well
  if (quest.boss.rage) {
    group.quest.progress.rage += Math.abs(down);
    if (group.quest.progress.rage >= quest.boss.rage.value) {
      group.sendChat(quest.boss.rage.effect('en'));
      group.quest.progress.rage = 0;

      // TODO To make Rage effects more expandable, let's turn these into functions in quest.boss.rage
      if (quest.boss.rage.healing) group.quest.progress.hp += group.quest.progress.hp * quest.boss.rage.healing;
      if (group.quest.progress.hp > quest.boss.hp) group.quest.progress.hp = quest.boss.hp;
      if (quest.boss.rage.mpDrain) {
        updates.$set = {'stats.mp': 0};
      }
    }
  }

  await User.update(
    {_id:
      {$in: this.getParticipatingQuestMembers()},
    },
    updates,
    {multi: true}
  ).exec();
  // Apply changes the currently cronning user locally so we don't have to reload it to get the updated state
  // TODO how to mark not modified? https://github.com/Automattic/mongoose/pull/1167
  // must be notModified or otherwise could overwrite future changes: if the user is saved it'll save
  // the modified user.stats.hp but that must not happen as the hp value has already been updated by the User.update above
  // if (down) user.stats.hp += down;

  // Boss slain, finish quest
  if (group.quest.progress.hp <= 0) {
    group.sendChat(`\`You defeated ${quest.boss.name('en')}! Questing party members receive the rewards of victory.\``);

    // Participants: Grant rewards & achievements, finish quest
    await group.finishQuest(shared.content.quests[group.quest.key]);
  }

  return await group.save();
};

schema.methods._processCollectionQuest = async function processCollectionQuest (options) {
  let {
    user,
    progress,
  } = options;

  let group = this;
  let quest = questScrolls[group.quest.key];
  let itemsFound = {};

  const possibleItemKeys = Object.keys(quest.collect).filter((key) => {
    return group.quest.progress.collect[key] !== quest.collect[key].count;
  });

  const possibleItemsToCollect = possibleItemKeys.reduce((accumulator, current, index) => {
    accumulator[possibleItemKeys[index]] = quest.collect[current];
    return accumulator;
  }, {});

  _.times(progress.collectedItems, () => {
    let item = shared.randomVal(possibleItemsToCollect, {key: true});

    if (!itemsFound[item]) {
      itemsFound[item] = 0;
    }
    itemsFound[item]++;
    group.quest.progress.collect[item]++;
  });

  // Add 0 for all items not found
  Object.keys(this.quest.progress.collect).forEach((item) => {
    if (!itemsFound[item]) {
      itemsFound[item] = 0;
    }
  });

  let foundText = _.reduce(itemsFound, (m, v, k) => {
    m.push(`${v} ${quest.collect[k].text('en')}`);
    return m;
  }, []);

  foundText = foundText.join(', ');
  group.sendChat(`\`${user.profile.name} found ${foundText}.\``);
  group.markModified('quest.progress.collect');

  // Still needs completing
  if (_.find(quest.collect, (v, k) => {
    return group.quest.progress.collect[k] < v.count;
  })) return await group.save();

  await group.finishQuest(quest);
  group.sendChat('`All items found! Party has received their rewards.`');

  return await group.save();
};

schema.statics.processQuestProgress = async function processQuestProgress (user, progress) {
  let group = await this.getGroup({user, groupId: 'party'});

  if (!_isOnQuest(user, progress, group)) return;

  let quest = shared.content.quests[group.quest.key];

  if (!quest) return; // TODO should this throw an error instead?

  let questType = quest.boss ? 'Boss' : 'Collection';

  await group[`_process${questType}Quest`]({
    user,
    progress,
    group,
  });
};

// to set a boss: `db.groups.update({_id:TAVERN_ID},{$set:{quest:{key:'dilatory',active:true,progress:{hp:1000,rage:1500}}}}).exec()`
// we export an empty object that is then populated with the query-returned data
export let tavernQuest = {};
let tavernQ = {_id: TAVERN_ID, 'quest.key': {$ne: null}};

// we use process.nextTick because at this point the model is not yet available
process.nextTick(() => {
  model // eslint-disable-line no-use-before-define
  .findOne(tavernQ).exec()
  .then(tavern => {
    if (!tavern) return; // No tavern quest

    // Using _assign so we don't lose the reference to the exported tavernQuest
    _.assign(tavernQuest, tavern.quest.toObject());
  })
  .catch(err => {
    throw err;
  });
});

// returns a promise
schema.statics.tavernBoss = async function tavernBoss (user, progress) {
  if (!progress) return;

  // hack: prevent crazy damage to world boss
  let dmg = Math.min(900, Math.abs(progress.up || 0));
  let rage = -Math.min(900, Math.abs(progress.down || 0));

  let tavern = await this.findOne(tavernQ).exec();
  if (!(tavern && tavern.quest && tavern.quest.key)) return;

  let quest = shared.content.quests[tavern.quest.key];

  if (tavern.quest.progress.hp <= 0) {
    tavern.sendChat(quest.completionChat('en'));
    await tavern.finishQuest(quest);
    _.assign(tavernQuest, {extra: null});
    return tavern.save();
  } else {
    // Deal damage. Note a couple things here, str & def are calculated. If str/def are defined in the database,
    // use those first - which allows us to update the boss on the go if things are too easy/hard.
    if (!tavern.quest.extra) tavern.quest.extra = {};
    tavern.quest.progress.hp -= dmg / (tavern.quest.extra.def || quest.boss.def);
    tavern.quest.progress.rage -= rage * (tavern.quest.extra.str || quest.boss.str);

    if (tavern.quest.progress.rage >= quest.boss.rage.value) {
      if (!tavern.quest.extra.worldDmg) tavern.quest.extra.worldDmg = {};

      let wd = tavern.quest.extra.worldDmg;
      // Burnout attacks Ian, Seasonal Sorceress, tavern
      // Be-Wilder attacks Alex, Matt, Bailey
      let scene = wd.market ? wd.stables ? wd.bailey ? false : 'bailey' : 'stables' : 'market'; // eslint-disable-line no-nested-ternary

      if (!scene) {
        tavern.sendChat(`\`${quest.boss.name('en')} tries to unleash ${quest.boss.rage.title('en')} but is too tired.\``);
        tavern.quest.progress.rage = 0; // quest.boss.rage.value;
      } else {
        tavern.sendChat(quest.boss.rage[scene]('en'));
        tavern.quest.extra.worldDmg[scene] = true;
        tavern.quest.extra.worldDmg.recent = scene;
        tavern.markModified('quest.extra.worldDmg');
        tavern.quest.progress.rage = 0;
        if (quest.boss.rage.healing) {
          tavern.quest.progress.hp += quest.boss.rage.healing * tavern.quest.progress.hp;
        }
      }
    }

    if (quest.boss.desperation && tavern.quest.progress.hp < quest.boss.desperation.threshold && !tavern.quest.extra.desperate) {
      tavern.sendChat(quest.boss.desperation.text('en'));
      tavern.quest.extra.desperate = true;
      tavern.quest.extra.def = quest.boss.desperation.def;
      tavern.quest.extra.str = quest.boss.desperation.str;
      tavern.markModified('quest.extra');
    }

    _.assign(tavernQuest, tavern.quest.toObject());
    return tavern.save();
  }
};

schema.methods.leave = async function leaveGroup (user, keep = 'keep-all', keepChallenges = 'leave-challenges') {
  let group = this;
  let update = {};

  if (group.memberCount <= 1 && group.privacy === 'private' && group.hasNotCancelled()) {
    throw new NotAuthorized(shared.i18n.t('cannotDeleteActiveGroup'));
  }

  if (group.leader === user._id && group.hasNotCancelled()) {
    throw new NotAuthorized(shared.i18n.t('leaderCannotLeaveGroupWithActiveGroup'));
  }

  // only remove user from challenges if it's set to leave-challenges
  if (keepChallenges === 'leave-challenges') {
    let challenges = await Challenge.find({
      _id: {$in: user.challenges},
      group: group._id,
    }).exec();

    let challengesToRemoveUserFrom = challenges.map(chal => {
      return chal.unlinkTasks(user, keep);
    });
    await Bluebird.all(challengesToRemoveUserFrom);
  }

  // Unlink group tasks)
  let assignedTasks = await Tasks.Task.find({
    'group.id': group._id,
    userId: {$exists: false},
    'group.assignedUsers': user._id,
  }).exec();
  let assignedTasksToRemoveUserFrom = assignedTasks.map(task => {
    return this.unlinkTask(task, user, keep);
  });
  await Bluebird.all(assignedTasksToRemoveUserFrom);

  let promises = [];

  // remove the group from the user's groups
  if (group.type === 'guild') {
    promises.push(User.update({_id: user._id}, {$pull: {guilds: group._id}}).exec());
  } else {
    promises.push(User.update({_id: user._id}, {$set: {party: {}}}).exec());
    // Tell the realtime clients that a user has left
    // If the user that left is still connected, they'll get disconnected
    pusher.trigger(`presence-group-${group._id}`, 'user-left', {
      userId: user._id,
    });

    update.$unset = {[`quest.members.${user._id}`]: 1};
  }

  if (group.purchased.plan.customerId) {
    promises.push(payments.cancelGroupSubscriptionForUser(user, this));
  }

  // If user is the last one in group and group is private, delete it
  if (group.memberCount <= 1 && group.privacy === 'private') {
    // double check the member count is correct so we don't accidentally delete a group that still has users in it
    let members;
    if (group.type === 'guild') {
      members = await User.find({guilds: group._id}).select('_id').exec();
    } else {
      members = await User.find({'party._id': group._id}).select('_id').exec();
    }

    _.remove(members, {_id: user._id});

    if (members.length === 0) {
      promises.push(group.remove());
      return await Bluebird.all(promises);
    }
  } else if (group.leader === user._id) { // otherwise If the leader is leaving (or if the leader previously left, and this wasn't accounted for)
    let query = group.type === 'party' ? {'party._id': group._id} : {guilds: group._id};
    query._id = {$ne: user._id};
    let seniorMember = await User.findOne(query).select('_id').exec();

    // could be missing in case of public guild (that can have 0 members) with 1 member who is leaving
    if (seniorMember) update.$set = {leader: seniorMember._id};
  }
  // otherwise If the leader is leaving (or if the leader previously left, and this wasn't accounted for)
  update.$inc = {memberCount: -1};
  if (group.leader === user._id) {
    let query = group.type === 'party' ? {'party._id': group._id} : {guilds: group._id};
    query._id = {$ne: user._id};
    let seniorMember = await User.findOne(query).select('_id').exec();

    // could be missing in case of public guild (that can have 0 members) with 1 member who is leaving
    if (seniorMember) update.$set = {leader: seniorMember._id};
  }
  promises.push(group.update(update).exec());

  return await Bluebird.all(promises);
};

/**
 * Updates all linked tasks for a group task
 *
 * @param  taskToSync  The group task that will be synced
 * @param  options.newCheckListItem  The new checklist item that needs to be synced to all assigned users
 * @param  options.removedCheckListItem  The removed checklist item that needs to be removed from all assigned users
 *
 * @return The created tasks
 */
schema.methods.updateTask = async function updateTask (taskToSync, options = {}) {
  let group = this;

  let updateCmd = {$set: {}};

  let syncableAttributes = syncableAttrs(taskToSync);
  for (let key in syncableAttributes) {
    updateCmd.$set[key] = syncableAttributes[key];
  }

  updateCmd.$set['group.approval.required'] = taskToSync.group.approval.required;
  updateCmd.$set['group.assignedUsers'] = taskToSync.group.assignedUsers;

  let taskSchema = Tasks[taskToSync.type];

  let updateQuery = {
    userId: {$exists: true},
    'group.id': group.id,
    'group.taskId': taskToSync._id,
  };

  if (options.newCheckListItem) {
    let newCheckList = {completed: false};
    newCheckList.linkId = options.newCheckListItem.id;
    newCheckList.text = options.newCheckListItem.text;
    updateCmd.$push = { checklist: newCheckList };
  }

  if (options.removedCheckListItemId) {
    updateCmd.$pull = { checklist: {linkId: {$in: [options.removedCheckListItemId]} } };
  }

  if (options.updateCheckListItems && options.updateCheckListItems.length > 0) {
    let checkListIdsToRemove = [];
    let checkListItemsToAdd = [];

    options.updateCheckListItems.forEach(function gatherChecklists (updateCheckListItem) {
      checkListIdsToRemove.push(updateCheckListItem.id);
      let newCheckList = {completed: false};
      newCheckList.linkId = updateCheckListItem.id;
      newCheckList.text = updateCheckListItem.text;
      checkListItemsToAdd.push(newCheckList);
    });

    updateCmd.$pull = { checklist: {linkId: {$in: checkListIdsToRemove} } };
    await taskSchema.update(updateQuery, updateCmd, {multi: true}).exec();

    delete updateCmd.$pull;
    updateCmd.$push = { checklist: { $each: checkListItemsToAdd } };
    await taskSchema.update(updateQuery, updateCmd, {multi: true}).exec();

    return;
  }

  // Updating instead of loading and saving for performances, risks becoming a problem if we introduce more complexity in tasks
  await taskSchema.update(updateQuery, updateCmd, {multi: true}).exec();
};

schema.methods.syncTask = async function groupSyncTask (taskToSync, user) {
  let group = this;
  let toSave = [];

  if (taskToSync.group.assignedUsers.indexOf(user._id) === -1) {
    taskToSync.group.assignedUsers.push(user._id);
  }

  // Sync tags
  let userTags = user.tags;
  let i = _.findIndex(userTags, {id: group._id});

  if (i !== -1) {
    if (userTags[i].name !== group.name) {
      // update the name - it's been changed since
      userTags[i].name = group.name;
      userTags[i].group = group._id;
    }
  } else {
    userTags.push({
      id: group._id,
      name: group.name,
      group: group._id,
    });
  }

  let findQuery = {
    'group.taskId': taskToSync._id,
    userId: user._id,
    'group.id': group._id,
  };

  let matchingTask = await Tasks.Task.findOne(findQuery).exec();

  if (!matchingTask) { // If the task is new, create it
    matchingTask = new Tasks[taskToSync.type](Tasks.Task.sanitize(syncableAttrs(taskToSync)));
    matchingTask.group.id = taskToSync.group.id;
    matchingTask.userId = user._id;
    matchingTask.group.taskId = taskToSync._id;
    user.tasksOrder[`${taskToSync.type}s`].push(matchingTask._id);
  } else {
    _.merge(matchingTask, syncableAttrs(taskToSync));
    // Make sure the task is in user.tasksOrder
    let orderList = user.tasksOrder[`${taskToSync.type}s`];
    if (orderList.indexOf(matchingTask._id) === -1 && (matchingTask.type !== 'todo' || !matchingTask.completed)) orderList.push(matchingTask._id);
  }

  matchingTask.group.approval.required = taskToSync.group.approval.required;
  matchingTask.group.assignedUsers = taskToSync.group.assignedUsers;

  //  sync checklist
  if (taskToSync.checklist) {
    taskToSync.checklist.forEach(function syncCheckList (element) {
      let newCheckList = {completed: false};
      newCheckList.linkId = element.id;
      newCheckList.text = element.text;
      matchingTask.checklist.push(newCheckList);
    });
  }

  if (!matchingTask.notes) matchingTask.notes = taskToSync.notes; // don't override the notes, but provide it if not provided
  if (matchingTask.tags.indexOf(group._id) === -1) matchingTask.tags.push(group._id); // add tag if missing

  toSave.push(matchingTask.save(), taskToSync.save(), user.save());
  return Bluebird.all(toSave);
};

schema.methods.unlinkTask = async function groupUnlinkTask (unlinkingTask, user, keep) {
  let findQuery = {
    'group.taskId': unlinkingTask._id,
    userId: user._id,
  };

  let assignedUserIndex = unlinkingTask.group.assignedUsers.indexOf(user._id);
  unlinkingTask.group.assignedUsers.splice(assignedUserIndex, 1);

  if (keep === 'keep-all') {
    await Tasks.Task.update(findQuery, {
      $set: {group: {}},
    }).exec();

    await user.save();
  } else { // keep = 'remove-all'
    let task = await Tasks.Task.findOne(findQuery).select('_id type completed').exec();
    // Remove task from user.tasksOrder and delete them
    if (task.type !== 'todo' || !task.completed) {
      removeFromArray(user.tasksOrder[`${task.type}s`], task._id);
      user.markModified('tasksOrder');
    }

    return Bluebird.all([task.remove(), user.save(), unlinkingTask.save()]);
  }
};

schema.methods.removeTask = async function groupRemoveTask (task) {
  let group = this;

  // Set the task as broken
  await Tasks.Task.update({
    userId: {$exists: true},
    'group.id': group.id,
    'group.taskId': task._id,
  }, {
    $set: {'group.broken': 'TASK_DELETED'},
  }, {multi: true}).exec();
};

// Returns true if the user has reached the spam message limit
schema.methods.checkChatSpam = function groupCheckChatSpam (user) {
  if (this._id !== TAVERN_ID) {
    return false;
  } else if (user.contributor && user.contributor.level >= SPAM_MIN_EXEMPT_CONTRIB_LEVEL) {
    return false;
  }

  let currentTime = Date.now();
  let userMessages = 0;
  for (let i = 0; i < this.chat.length; i++) {
    let message = this.chat[i];
    if (message.uuid === user._id && currentTime - message.timestamp <= SPAM_WINDOW_LENGTH) {
      userMessages++;
      if (userMessages >= SPAM_MESSAGE_LIMIT) {
        return true;
      }
    } else if (currentTime - message.timestamp > SPAM_WINDOW_LENGTH) {
      break;
    }
  }

  return false;
};

schema.methods.isSubscribed = function isSubscribed () {
  let now = new Date();
  let plan = this.purchased.plan;
  return plan && plan.customerId && (!plan.dateTerminated || moment(plan.dateTerminated).isAfter(now));
};

schema.methods.hasNotCancelled = function hasNotCancelled () {
  let plan = this.purchased.plan;
  return this.isSubscribed() && !plan.dateTerminated;
};

schema.methods.updateGroupPlan = async function updateGroupPlan (removingMember) {
  // Recheck the group plan count
  let members;
  if (this.type === 'guild') {
    members = await User.find({guilds: this._id}).select('_id').exec();
  } else {
    members = await User.find({'party._id': this._id}).select('_id').exec();
  }
  this.memberCount = members.length;

  if (this.purchased.plan.paymentMethod === stripePayments.constants.PAYMENT_METHOD) {
    await stripePayments.chargeForAdditionalGroupMember(this);
  } else if (this.purchased.plan.paymentMethod === amazonPayments.constants.PAYMENT_METHOD && !removingMember) {
    await amazonPayments.chargeForAdditionalGroupMember(this);
  }
};

export let model = mongoose.model('Group', schema);

// initialize tavern if !exists (fresh installs)
// do not run when testing as it's handled by the tests and can easily cause a race condition
if (!nconf.get('IS_TEST')) {
  model.count({_id: TAVERN_ID}, (err, ct) => {
    if (err) throw err;
    if (ct > 0) return;
    new model({ // eslint-disable-line new-cap
      _id: TAVERN_ID,
      leader: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0', // Siena Leslie
      name: 'Tavern',
      type: 'guild',
      privacy: 'public',
    }).save();
  });
}
