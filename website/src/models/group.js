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
import { InternalServerError } from '../libs/api-v3/errors';
import * as firebase from '../libs/api-v2/firebase';
import baseModel from '../libs/api-v3/baseModel';
import { sendTxn as sendTxnEmail } from '../libs/api-v3/email';
import Q from 'q';
import nconf from 'nconf';
import sendPushNotification from '../libs/api-v3/pushNotifications';

const questScrolls = shared.content.quests;

let Schema = mongoose.Schema;

// NOTE once Firebase is enabled any change to groups' members in MongoDB will have to be run through the API
// changes made directly to the db will cause Firebase to get out of sync
export let schema = new Schema({
  name: {type: String, required: true},
  description: String,
  leader: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  type: {type: String, enum: ['guild', 'party'], required: true},
  privacy: {type: String, enum: ['private', 'public'], default: 'private', required: true},
  // _v: {type: Number,'default': 0}, // TODO ?
  chat: Array, // TODO ?
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
    // invites: {type:Boolean, 'default':false} // TODO ?
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
    // TODO as long as quests are party only we can keep it here
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

// TODO migration
/**
 * Derby duplicated stuff. This is a temporary solution, once we're completely off derby we'll run an mongo migration
 * to remove duplicates, then take these fucntions out
 */
/* function removeDuplicates(doc){
  // Remove duplicate members
  if (doc.members) {
    var uniqMembers = _.uniq(doc.members);
    if (uniqMembers.length != doc.members.length) {
      doc.members = uniqMembers;
    }
  }
}*/

// TODO test
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

schema.statics.getGroup = async function getGroup (options = {}) {
  let {user, groupId, fields, optionalMembership = false, populateLeader = false, requireMembership = false} = options;
  let query;

  let isUserParty = groupId === 'party' || user.party._id === groupId;
  let isUserGuild = user.guilds.indexOf(groupId) !== -1;

  // When requireMembership is true check that user is member even in public guild
  if (requireMembership && !isUserParty && !isUserGuild) {
    return null;
  }

  // When optionalMembership is true it's not required for the user to be a member of the group
  if (isUserParty) {
    query = {type: 'party', _id: user.party._id};
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

schema.statics.getGroups = async function getGroups (options = {}) {
  let {user, types, groupFields = basicFields, sort = '-memberCount', populateLeader = false} = options;
  let queries = [];

  types.forEach(type => {
    switch (type) {
      case 'party':
        queries.push(this.getGroup({user, groupId: 'party', fields: groupFields, populateLeader}));
        break;
      case 'privateGuilds':
        let privateGroupQuery = this.find({
          type: 'guild',
          privacy: 'private',
          _id: {$in: user.guilds},
        }).select(groupFields);
        if (populateLeader === true) privateGroupQuery.populate('leader', nameFields);
        privateGroupQuery.sort(sort).exec();
        queries.push(privateGroupQuery);
        break;
      case 'publicGuilds':
        let publicGroupQuery = this.find({
          type: 'guild',
          privacy: 'public',
        }).select(groupFields);
        if (populateLeader === true) publicGroupQuery.populate('leader', nameFields);
        publicGroupQuery.sort(sort).exec();
        queries.push(publicGroupQuery); // TODO use lean?
        break;
      case 'tavern':
        if (types.indexOf('publicGuilds') === -1) {
          queries.push(this.getGroup({user, groupId: 'habitrpg', fields: groupFields}));
        }
        break;
    }
  });

  let groupsArray = _.reduce(await Q.all(queries), (previousValue, currentValue) => {
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

  return Q.all(userUpdates);
};

// Return true if user is a member of the group
schema.methods.isMember = function isGroupMember (user) {
  if (this._id === 'habitrpg') {
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

const NO_CHAT_NOTIFICATIONS = ['habitrpg'];
schema.methods.sendChat = function sendChat (message, user) {
  this.chat.unshift(chatDefaults(message, user));
  this.chat.splice(200);

  // Kick off chat notifications in the background. // TODO refactor
  let lastSeenUpdate = {$set: {}, $inc: {_v: 1}};
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

  // Changes quest.members to only include participating members
  // TODO: is that important? What does it matter if the non-participating members
  // are still on the object?
  // TODO: is it important to run clean quest progress on non-members like we did in v2?
  this.quest.members = _.pick(this.quest.members, _.identity);
  let nonUserQuestMembers = _.keys(this.quest.members);
  removeFromArray(nonUserQuestMembers, user._id);

  if (userIsParticipating) {
    user.party.quest.key = this.quest.key;
    user.party.quest.progress.down = 0;
    user.party.quest.progress.collect = collected;
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
      'party.quest.progress.collect': collected,
      'party.quest.completed': null,
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

// return a clean object for user.quest
function _cleanQuestProgress (merge) {
  let clean = {
    key: null,
    progress: {
      up: 0,
      down: 0,
      collect: {},
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

// Participants: Grant rewards & achievements, finish quest
// Returns the promise from update().exec()
schema.methods.finishQuest = function finishQuest (quest) {
  let questK = quest.key;
  let updates = {$inc: {}, $set: {}};

  updates.$inc[`achievements.quests.${questK}`] = 1;
  updates.$inc['stats.gp'] = Number(quest.drop.gp); // TODO are this castings necessary?
  updates.$inc['stats.exp'] = Number(quest.drop.exp);
  updates.$inc._v = 1;

  if (this._id === 'habitrpg') {
    updates.$set['party.quest.completed'] = questK; // Just show the notif
  } else {
    updates.$set['party.quest'] = _cleanQuestProgress({completed: questK}); // clear quest progress
  }

  _.each(quest.drop.items, (item) => {
    let dropK = item.key;

    switch (item.type) {
      case 'gear':
        // TODO This means they can lose their new gear on death, is that what we want?
        updates.$set[`items.gear.owned.${dropK}`] = true;
        break;
      case 'eggs':
      case 'food':
      case 'hatchingPotions':
      case 'quests':
        updates.$inc[`items.${item.type}.${dropK}`] = _.where(quest.drop.items, {type: item.type, key: item.key}).length;
        break;
      case 'pets':
        updates.$set[`items.pets.${dropK}`] = 5;
        break;
      case 'mounts':
        updates.$set[`items.mounts.${dropK}`] = true;
        break;
    }
  });

  let q = this._id === 'habitrpg' ? {} : {_id: {$in: _.keys(this.quest.members)}};
  this.quest = {};
  this.markModified('quest');
  return User.update(q, updates, {multi: true}).exec();
};

function _isOnQuest (user, progress, group) {
  return group && progress && group.quest && group.quest.active && group.quest.members[user._id] === true;
}

// Returns a promise
schema.statics.collectQuest = async function collectQuest (user, progress) {
  let group = await this.getGroup({user, groupId: 'party'});

  if (!_isOnQuest(user, progress, group)) return;
  let quest = shared.content.quests[group.quest.key];

  _.each(progress.collect, (v, k) => {
    group.quest.progress.collect[k] += v;
  });

  let foundText = _.reduce(progress.collect, (m, v, k) => {
    m.push(`${v} ${quest.collect[k].text('en')}`);
    return m;
  }, []);

  foundText = foundText ? foundText.join(', ') : 'nothing';
  group.sendChat(`\`${user.profile.name} found ${foundText}.\``);
  group.markModified('quest.progress.collect');

  // Still needs completing
  if (_.find(shared.content.quests[group.quest.key].collect, (v, k) => {
    return group.quest.progress.collect[k] < v.count;
  })) return group.save();

  await group.finishQuest(quest);
  group.sendChat('`All items found! Party has received their rewards.`');
  return group.save();
};

schema.statics.bossQuest = async function bossQuest (user, progress) {
  let group = await this.getGroup({user, groupId: 'party'});
  if (!_isOnQuest(user, progress, group)) return;

  let quest = shared.content.quests[group.quest.key];
  if (!progress || !quest) return; // FIXME why is this ever happening, progress should be defined at this point, log?

  let down = progress.down * quest.boss.str; // multiply by boss strength

  group.quest.progress.hp -= progress.up;
  // TODO Create a party preferred language option so emits like this can be localized
  group.sendChat(`\`${user.profile.name} attacks ${quest.boss.name('en')} for ${progress.up.toFixed(1)} damage.\` \`${quest.boss.name('en')} attacks party for ${Math.abs(down).toFixed(1)} damage.\``);

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
    $inc: {'stats.hp': down, _v: 1},
  }, {multi: true}).exec();
  // Apply changes the currently cronning user locally so we don't have to reload it to get the updated state
  // TODO how to mark not modified? https://github.com/Automattic/mongoose/pull/1167
  // must be notModified or otherwise could overwrite future changes
  // if (down) user.stats.hp += down;

  // Boss slain, finish quest
  if (group.quest.progress.hp <= 0) {
    group.sendChat(`\`You defeated ${quest.boss.name('en')}! Questing party members receive the rewards of victory.\``);

    // Participants: Grant rewards & achievements, finish quest
    await group.finishQuest(shared.content.quests[group.quest.key]);
    return group.save();
  }

  return group.save();
};

// to set a boss: `db.groups.update({_id:'habitrpg'},{$set:{quest:{key:'dilatory',active:true,progress:{hp:1000,rage:1500}}}})`
// we export an empty object that is then populated with the query-returned data
export let tavernQuest = {};
let tavernQ = {_id: 'habitrpg', 'quest.key': {$ne: null}};

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
  await Q.all(challengesToRemoveUserFrom);

  let promises = [];

  // If user is the last one in group and group is private, delete it
  if (group.memberCount <= 1 && group.privacy === 'private') {
    return await group.remove();
  }

  // otherwise just remove a member TODO create User.methods.removeFromGroup?
  if (group.type === 'guild') {
    promises.push(User.update({_id: user._id}, {$pull: {guilds: group._id}}).exec());
  } else {
    promises.push(User.update({_id: user._id}, {$set: {party: {}}}).exec());
  }

  // If the leader is leaving (or if the leader previously left, and this wasn't accounted for)
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
  firebase.removeUserFromGroup(group._id, user._id);

  return Q.all(promises);
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

  Q.all([
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

export const INVITES_LIMIT = 100;
export let model = mongoose.model('Group', schema);

// initialize tavern if !exists (fresh installs)
// do not run when testing as it's handled by the tests and can easily cause a race condition
if (!nconf.get('IS_TEST')) {
  model.count({_id: 'habitrpg'}, (err, ct) => {
    if (err) throw err;
    if (ct > 0) return;
    new model({ // eslint-disable-line babel/new-cap
      _id: 'habitrpg',
      leader: '9', // TODO change this user id
      name: 'HabitRPG',
      type: 'guild',
      privacy: 'public',
    }).save({
      validateBeforeSave: false, // _id = 'habitrpg' would not be valid otherwise
    });
  });
}
