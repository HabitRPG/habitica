import mongoose from 'mongoose';
import {
  model as User,
  nameFields,
} from './user';
import shared from '../../../common';
import _  from 'lodash';
import { model as Challenge} from './challenge';
import validator from 'validator';
import { removeFromArray } from '../libs/api-v3/collectionManipulators';
import {
  InternalServerError,
  BadRequest,
} from '../libs/api-v3/errors';
import * as firebase from '../libs/api-v2/firebase';
import baseModel from '../libs/api-v3/baseModel';
import { sendTxn as sendTxnEmail } from '../libs/api-v3/email';
import Bluebird from 'bluebird';
import nconf from 'nconf';
import sendPushNotification from '../libs/api-v3/pushNotifications';

const questScrolls = shared.content.quests;
const Schema = mongoose.Schema;

export const INVITES_LIMIT = 100;
export const TAVERN_ID = shared.TAVERN_ID;

const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';

// NOTE once Firebase is enabled any change to groups' members in MongoDB will have to be run through the API
// changes made directly to the db will cause Firebase to get out of sync
export let schema = new Schema({
  name: {type: String, required: true},
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
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['_id', 'balance', 'quest', 'memberCount', 'chat', 'challengeCount'],
});

// A list of additional fields that cannot be updated (but can be set on creation)
let noUpdate = ['privacy', 'type'];
schema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return this.sanitize(updateObj, noUpdate);
};

// Basic fields to fetch for populating a group info
export let basicFields = 'name type privacy';

schema.pre('remove', true, async function preRemoveGroup (next, done) {
  next();
  try {
    await this.removeGroupInvitations();
    done();
  } catch (err) {
    done(err);
  }
});

schema.post('remove', function postRemoveGroup (group) {
  firebase.deleteGroup(group._id);
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
  return group;
};

export const VALID_QUERY_TYPES = ['party', 'guilds', 'privateGuilds', 'publicGuilds', 'tavern'];

schema.statics.getGroups = async function getGroups (options = {}) {
  let {user, types, groupFields = basicFields, sort = '-memberCount', populateLeader = false} = options;
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
        let userGuildsQuery = this.find({
          type: 'guild',
          _id: {$in: user.guilds},
        }).select(groupFields);
        if (populateLeader === true) userGuildsQuery.populate('leader', nameFields);
        userGuildsQuery.sort(sort).exec();
        queries.push(userGuildsQuery);
        break;
      }
      case 'privateGuilds': {
        let privateGuildsQuery = this.find({
          type: 'guild',
          privacy: 'private',
          _id: {$in: user.guilds},
        }).select(groupFields);
        if (populateLeader === true) privateGuildsQuery.populate('leader', nameFields);
        privateGuildsQuery.sort(sort).exec();
        queries.push(privateGuildsQuery);
        break;
      }
      // NOTE: when returning publicGuilds we use `.lean()` so all mongoose methods won't be available.
      // Docs are going to be plain javascript objects
      case 'publicGuilds': {
        let publicGuildsQuery = this.find({
          type: 'guild',
          privacy: 'public',
        }).select(groupFields);
        if (populateLeader === true) publicGuildsQuery.populate('leader', nameFields);
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
// unless the user is an admin
// Not putting into toJSON because there we can't access user
schema.statics.toJSONCleanChat = function groupToJSONCleanChat (group, user) {
  let toJSON = group.toJSON();
  if (!user.contributor.admin) {
    _.remove(toJSON.chat, chatMsg => {
      chatMsg.flags = {};
      return chatMsg.flagCount >= 2;
    });
  }
  return toJSON;
};

schema.methods.removeGroupInvitations = async function removeGroupInvitations () {
  let group = this;

  let usersToRemoveInvitationsFrom = await User.find({
    [`invitations.${group.type}${group.type === 'guild' ? 's' : ''}.id`]: group._id,
  }).exec();

  let userUpdates = usersToRemoveInvitationsFrom.map(user => {
    if (group.type === 'party') {
      user.invitations.party = {};
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

const NO_CHAT_NOTIFICATIONS = [TAVERN_ID];

schema.methods.sendChat = function sendChat (message, user) {
  this.chat.unshift(chatDefaults(message, user));
  this.chat.splice(200);

  // Kick off chat notifications in the background.
  let lastSeenUpdate = {$set: {}};
  lastSeenUpdate.$set[`newMessages.${this._id}`] = {name: this.name, value: true};

  // do not send notifications for guilds with more than 5000 users and for the tavern
  if (NO_CHAT_NOTIFICATIONS.indexOf(this._id) !== -1 || this.memberCount > 5000) {
    // TODO For Tavern, only notify them if their name was mentioned
    // var profileNames = [] // get usernames from regex of @xyz. how to handle space-delimited profile names?
    // User.update({'profile.name':{$in:profileNames}},lastSeenUpdate,{multi:true}).exec();
  } else {
    let query = {};

    if (this.type === 'party') {
      query['party._id'] = this._id;
    } else {
      query.guilds = this._id;
    }

    query._id = { $ne: user ? user._id : ''};

    User.update(query, lastSeenUpdate, {multi: true}).exec();
  }
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

  let nonMembers = Object.keys(_.pick(this.quest.members, (member) => {
    return !member;
  }));

  // Changes quest.members to only include participating members
  this.quest.members = _.pick(this.quest.members, _.identity);
  let nonUserQuestMembers = _.keys(this.quest.members);
  removeFromArray(nonUserQuestMembers, user._id);

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
    'party.quest items.quests auth.facebook auth.local preferences.emailNotifications pushDevices profile.name'
  ).exec().then((membersToNotify) => {
    let membersToEmail = _.filter(membersToNotify, (member) => {
      // send push notifications and filter users that disabled emails
      sendPushNotification(member, 'HabitRPG', `${shared.i18n.t('questStarted')}: ${quest.text()}`);

      return member.preferences.emailNotifications.questStarted !== false &&
        member._id !== user._id;
    });
    sendTxnEmail(membersToEmail, 'quest-started', [
      { name: 'PARTY_URL', content: '/#/options/groups/party' },
    ]);
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

// Participants: Grant rewards & achievements, finish quest.
// Changes the group object update members
schema.methods.finishQuest = async function finishQuest (quest) {
  let questK = quest.key;
  let updates = {$inc: {}, $set: {}};

  updates.$inc[`achievements.quests.${questK}`] = 1;
  updates.$inc['stats.gp'] = Number(quest.drop.gp);
  updates.$inc['stats.exp'] = Number(quest.drop.exp);

  if (this._id === TAVERN_ID) {
    updates.$set['party.quest.completed'] = questK; // Just show the notif
  } else {
    updates.$set['party.quest'] = _cleanQuestProgress({completed: questK}); // clear quest progress
  }

  _.each(quest.drop.items, (item) => {
    let dropK = item.key;

    switch (item.type) {
      case 'gear': {
        // TODO This means they can lose their new gear on death, is that what we want?
        updates.$set[`items.gear.owned.${dropK}`] = true;
        break;
      }
      case 'eggs':
      case 'food':
      case 'hatchingPotions':
      case 'quests': {
        updates.$inc[`items.${item.type}.${dropK}`] = _.where(quest.drop.items, {type: item.type, key: item.key}).length;
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
  });

  let q = this._id === TAVERN_ID ? {} : {_id: {$in: _.keys(this.quest.members)}};
  this.quest = {};
  this.markModified('quest');

  return await User.update(q, updates, {multi: true}).exec();
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
    }
  }

  // Everyone takes damage
  await User.update({
    _id: {$in: _.keys(group.quest.members)},
  }, {
    $inc: {'stats.hp': down},
  }, {multi: true}).exec();
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

  _.times(progress.collectedItems, () => {
    let item = shared.fns.randomVal(user, quest.collect, {key: true, seed: Math.random()});

    if (!itemsFound[item]) {
      itemsFound[item] = 0;
    }
    itemsFound[item]++;
    group.quest.progress.collect[item]++;
  });

  let foundText = _.reduce(itemsFound, (m, v, k) => {
    m.push(`${v} ${quest.collect[k].text('en')}`);
    return m;
  }, []);

  foundText = foundText.length > 0 ? foundText.join(', ') : 'nothing';
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

// to set a boss: `db.groups.update({_id:TAVERN_ID},{$set:{quest:{key:'dilatory',active:true,progress:{hp:1000,rage:1500}}}})`
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

schema.methods.leave = async function leaveGroup (user, keep = 'keep-all') {
  let group = this;

  let challenges = await Challenge.find({
    _id: {$in: user.challenges},
    group: group._id,
  });

  let challengesToRemoveUserFrom = challenges.map(chal => {
    return chal.unlinkTasks(user, keep);
  });
  await Bluebird.all(challengesToRemoveUserFrom);

  let promises = [];

  // remove the group from the user's groups
  if (group.type === 'guild') {
    promises.push(User.update({_id: user._id}, {$pull: {guilds: group._id}}).exec());
  } else {
    promises.push(User.update({_id: user._id}, {$set: {party: {}}}).exec());
  }

  // If user is the last one in group and group is private, delete it
  if (group.memberCount <= 1 && group.privacy === 'private') {
    promises.push(group.remove());
  } else { // otherwise If the leader is leaving (or if the leader previously left, and this wasn't accounted for)
    let update = {
      $inc: {memberCount: -1},
    };

    if (group.leader === user._id) {
      let query = group.type === 'party' ? {'party._id': group._id} : {guilds: group._id};
      query._id = {$ne: user._id};
      let seniorMember = await User.findOne(query).select('_id').exec();

      // could be missing in case of public guild (that can have 0 members) with 1 member who is leaving
      if (seniorMember) update.$set = {leader: seniorMember._id};
    }
    promises.push(group.update(update).exec());
  }

  firebase.removeUserFromGroup(group._id, user._id);

  return await Bluebird.all(promises);
};

// API v2 compatibility methods
schema.methods.getTransformedData = function getTransformedData (options) {
  let cb = options.cb;
  let populateMembers = options.populateMembers;
  let populateInvites = options.populateInvites;
  let populateChallenges = options.populateChallenges;

  let obj = this.toJSON();

  let queryMembers = {};
  let queryInvites = {};

  if (this.type === 'guild') {
    queryInvites['invitations.guilds.id'] = this._id;
  } else {
    queryInvites['invitations.party.id'] = this._id;
  }

  if (this.type === 'guild') {
    queryMembers.guilds = this._id;
  } else {
    queryMembers['party._id'] = this._id;
  }

  let selectDataMembers = '_id';
  let selectDataInvites = '_id';
  let selectDataChallenges = '_id';

  if (populateMembers) {
    selectDataMembers += ` ${populateMembers}`;
  }
  if (populateInvites) {
    selectDataInvites += ` ${populateInvites}`;
  }
  if (populateChallenges) {
    selectDataChallenges += ` ${populateChallenges}`;
  }

  let membersQuery = User.find(queryMembers).select(selectDataMembers);
  if (options.limitPopulation) membersQuery.limit(15);

  Bluebird.all([
    membersQuery.exec(),
    User.find(queryInvites).select(populateInvites).exec(),
    Challenge.find({group: obj._id}).select(populateMembers).exec(),
  ])
    .then((results) => {
      obj.members = results[0];
      obj.invites = results[1];
      obj.challenges = results[2];

      cb(null, obj);
    })
    .catch(cb);
};
// END API v2 compatibility methods

export let model = mongoose.model('Group', schema);

// initialize tavern if !exists (fresh installs)
// do not run when testing as it's handled by the tests and can easily cause a race condition
if (!nconf.get('IS_TEST')) {
  model.count({_id: TAVERN_ID}, (err, ct) => {
    if (err) throw err;
    if (ct > 0) return;
    new model({ // eslint-disable-line babel/new-cap
      _id: TAVERN_ID,
      leader: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0', // Siena Leslie
      name: 'Tavern',
      type: 'guild',
      privacy: 'public',
    }).save();
  });
}
