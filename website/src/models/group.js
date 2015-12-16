import mongoose from 'mongoose';
import { model as User} from './user';
import shared from '../../../common';
import _  from 'lodash';
// var async = require('async');
import logger from '../libs/api-v3/logger';
// var Challenge = require('./../models/challenge').model;
import firebase from '../libs/api-v2/firebase';
import baseModel from '../libs/api-v3/baseModel';
import Q from 'q';

let Schema = mongoose.Schema;

// NOTE once Firebase is enabled any change to groups' members in MongoDB will have to be run through the API
// changes made directly to the db will cause Firebase to get out of sync
export let schema = new Schema({
  name: {type: String, required: true},
  description: String,
  leader: {type: String, ref: 'User'},
  members: [{type: String, ref: 'User'}], // TODO do we need this? could depend on back-ref instead (User.find({group:GID})
  invites: [{type: String, ref: 'User'}], // TODO do we need this? could depend on back-ref instead (User.find({group:GID})
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
  memberCount: {type: Number, default: 0},
  challengeCount: {type: Number, default: 0},
  balance: {type: Number, default: 0},
  logo: String,
  leaderMessage: String,
  challenges: [{type: String, ref: 'Challenge'}], // TODO do we need this? could depend on back-ref instead (Challenge.find({group:GID}))
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
  noSet: ['_id'],
});

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

// FIXME this isn't always triggered, since we sometimes use update() or findByIdAndUpdate()
// @see https://github.com/LearnBoost/mongoose/issues/964 -> Add update pre?
// TODO necessary?
schema.pre('save', function preSaveGroup (next) {
  // removeDuplicates(this);
  this.memberCount = _.size(this.members);
  this.challengeCount = _.size(this.challenges);
  return next();
});

schema.pre('remove', true, function preRemoveGroup (next, done) {
  next();
  let group = this;

  // Remove invitations when group is deleted
  // TODO verify it works fir everything
  User.find({
    // TODO remove need for guilds s in migration? same for id -> _id
    [`invitations.${group.type}${group.type === 'guild' ? 's' : ''}.id`]: group._id,
  }).exec()
  .then(users => {
    return Q.all(users.map(user => {
      if (group.type === 'party') {
        user.invitations.party = {};
      } else {
        let i = _.findIndex(user.invitations.guilds, {id: group._id});
        user.invitations.guilds.splice(i, 1);
      }
      return user.save(); // TODO update?
    }));
  })
  .then(done)
  .catch(done);
});

schema.post('remove', function postRemoveGroup (group) {
  firebase.deleteGroup(group._id);
});

schema.methods.toJSON = function groupToJSON () {
  let doc = this.toObject();
  // removeDuplicates(doc);
  doc._isMember = this._isMember; // TODO ?

  // TODO migration
  // fix(groups): temp fix to remove chat entries stored as strings (not sure why that's happening..).
  // Required as angular 1.3 is strict on dupes, and no message.id to `track by`
  _.remove(doc.chat, msg => !msg.id);

  // TODO should not be needed here
  // @see pre('save') comment above
  this.memberCount = _.size(this.members);
  this.challengeCount = _.size(this.challenges);

  return doc;
};

// TODO move to its own model
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

schema.methods.sendChat = function sendChat (message, user) {
  this.chat.unshift(chatDefaults(message, user));
  this.chat.splice(200);

  // Kick off chat notifications in the background. // TODO refactor
  let lastSeenUpdate = {$set: {}, $inc: {_v: 1}}; // TODO standardize this _v inc at the user level
  lastSeenUpdate.$set[`newMessages.${this._id}`] = {name: this.name, value: true};

  if (this._id === 'habitrpg') {
    // TODO For Tavern, only notify them if their name was mentioned
    // var profileNames = [] // get usernames from regex of @xyz. how to handle space-delimited profile names?
    // User.update({'profile.name':{$in:profileNames}},lastSeenUpdate,{multi:true}).exec();
  } else {
    User.update({
      _id: {$in: this.members, $ne: user ? user._id : ''},
    }, lastSeenUpdate, {multi: true}).exec();
  }
};

function _cleanQuestProgress (merge) {
  // TODO clone? (also in sendChat message)
  let clean = {
    key: null,
    progress: {
      up: 0,
      down: 0,
      collect: {},
    },
    completed: null,
    RSVPNeeded: false, // TODO absolutely change this cryptic name
  };

  if (merge) { // TODO why does it do 2 merges?
    _.merge(clean, _.omit(merge, 'progress'));
    _.merge(clean.progress, merge.progress);
  }

  return clean;
}

schema.statics.cleanQuestProgress = _cleanQuestProgress;

// Participants: Grant rewards & achievements, finish quest
// TODO transform in promise
schema.methods.finishQuest = function finishQuest (quest, cb) {
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
  User.update(q, updates, {multi: true}, cb);
};

function _isOnQuest (user, progress, group) {
  return group && progress && group.quest && group.quest.active && group.quest.members[user._id] === true;
}

// TODO use promise
schema.statics.collectQuest = function collectQuest (user, progress, cb) {
  this.findOne({
    type: 'party',
    members: {$in: [user._id]},
  }).then(group => {
    if (!_isOnQuest(user, progress, group)) return cb();
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
    })) return group.save(cb);

    // TODO use promise
    group.finishQuest(quest, () => {
      group.sendChat('`All items found! Party has received their rewards.`');
      group.save(cb);
    });
  })
  .catch(cb);
};

// to set a boss: `db.groups.update({_id:'habitrpg'},{$set:{quest:{key:'dilatory',active:true,progress:{hp:1000,rage:1500}}}})`
// we export an empty object that is then populated with the query-returned data
export let tavernQuest = {};

process.nextTick(function(){
  mongoose.model('Group').findOne({_id: 'habitrpg', 'quest.key': {$ne: null}}, (err, tavern) => {
    // TODO handle error?
    if (!tavern) return; // No tavern quest

    // Using _assign so we don't lose the reference to the exported tavernQuest
    _.assign(tavernQuest, tavern.quest.toObject());
  });
});

schema.statics.tavernBoss = function tavernBoss (user, progress) {
  if (!progress) return;

  // hack: prevent crazy damage to world boss
  let dmg = Math.min(900, Math.abs(progress.up || 0));
  let rage = -Math.min(900, Math.abs(progress.down || 0));

  async.waterfall([
    function(cb){
      mongoose.model('Group').findOne(tavernQ,cb);
    },
    function(tavern,cb){
      if (!(tavern && tavern.quest && tavern.quest.key)) return cb(true);

      var quest = shared.content.quests[tavern.quest.key];
      if (tavern.quest.progress.hp <= 0) {
        tavern.sendChat(quest.completionChat('en'));
        tavern.finishQuest(quest, function(){});
        tavern.save(cb);
        _.assign(module.exports.tavernQuest, {extra: null});
      } else {
        // Deal damage. Note a couple things here, str & def are calculated. If str/def are defined in the database,
        // use those first - which allows us to update the boss on the go if things are too easy/hard.
        if (!tavern.quest.extra) tavern.quest.extra = {};
        tavern.quest.progress.hp -= dmg / (tavern.quest.extra.def || quest.boss.def);
        tavern.quest.progress.rage -= rage * (tavern.quest.extra.str || quest.boss.str);
        if (tavern.quest.progress.rage >= quest.boss.rage.value) {
          if (!tavern.quest.extra.worldDmg) tavern.quest.extra.worldDmg = {};
          var wd = tavern.quest.extra.worldDmg;
          var scene = wd.quests ? wd.seasonalShop ? wd.tavern ? false : 'tavern' : 'seasonalShop' : 'quests'; // Burnout attacks Ian, Seasonal Sorceress, tavern
          if (!scene) {
            tavern.sendChat('`'+quest.boss.name('en')+' tries to unleash '+quest.boss.rage.title('en')+', but is too tired.`');
            tavern.quest.progress.rage = 0 //quest.boss.rage.value;
          } else {
            tavern.sendChat(quest.boss.rage[scene]('en'));
            tavern.quest.extra.worldDmg[scene] = true;
            tavern.quest.extra.worldDmg.recent = scene;
            tavern.markModified('quest.extra.worldDmg');
            tavern.quest.progress.rage = 0;
            if (quest.boss.rage.healing) {
              tavern.quest.progress.hp += (quest.boss.rage.healing * tavern.quest.progress.hp);
            }
          }
        }
        if (quest.boss.desperation && (tavern.quest.progress.hp < quest.boss.desperation.threshold) && !tavern.quest.extra.desperate) {
          tavern.sendChat(quest.boss.desperation.text('en'));
          tavern.quest.extra.desperate = true;
          tavern.quest.extra.def = quest.boss.desperation.def;
          tavern.quest.extra.str = quest.boss.desperation.str;
          tavern.markModified('quest.extra');
        }

        _.assign(module.exports.tavernQuest, tavern.quest.toObject());
        tavern.save(cb);
      }
    }
  ],function(err,res){
    if (err === true) return; // no current quest
    if (err) return logger.error(err);
    dmg = rage = null;
  })
}

schema.statics.bossQuest = function bossQuest (user, progress, cb) {
  this.findOne({type: 'party', members: {'$in': [user._id]}},function(err, group){
    if (!isOnQuest(user,progress,group)) return cb(null);
    var quest = shared.content.quests[group.quest.key];
    if (!progress || !quest) return cb(null); // FIXME why is this ever happening, progress should be defined at this point
    var down = progress.down * quest.boss.str; // multiply by boss strength

    group.quest.progress.hp -= progress.up;
    group.sendChat("`" + user.profile.name + " attacks " + quest.boss.name('en') + " for " + (progress.up.toFixed(1)) + " damage, " + quest.boss.name('en') + " attacks party for " + Math.abs(down).toFixed(1) + " damage.`"); //TODO Create a party preferred language option so emits like this can be localized

    // If boss has Rage, increment Rage as well
    if (quest.boss.rage) {
      group.quest.progress.rage += Math.abs(down);
      if (group.quest.progress.rage >= quest.boss.rage.value) {
        group.sendChat(quest.boss.rage.effect('en'));
        group.quest.progress.rage = 0;
        if (quest.boss.rage.healing) group.quest.progress.hp += (group.quest.progress.hp * quest.boss.rage.healing); //TODO To make Rage effects more expandable, let's turn these into functions in quest.boss.rage
        if (group.quest.progress.hp > quest.boss.hp) group.quest.progress.hp = quest.boss.hp;
      }
    }
    // Everyone takes damage
    var series = [
      function(cb2){
        mongoose.models.User.update({_id:{$in: _.keys(group.quest.members)}}, {$inc:{'stats.hp':down, _v:1}}, {multi:true}, cb2);
      }
    ]

    // Boss slain, finish quest
    if (group.quest.progress.hp <= 0) {
      group.sendChat('`You defeated ' + quest.boss.name('en') + '! Questing party members receive the rewards of victory.`');
      // Participants: Grant rewards & achievements, finish quest
      series.push(function(cb2){
        group.finishQuest(quest,cb2);
      });
    }

    series.push(function(cb2){group.save(cb2)});
    async.series(series,cb);
  })
}

// Remove user from this group
schema.methods.leave = function leaveGroup (user, keep, mainCb){
  if(!user) return mainCb(new Error('Missing user.'));

  if(keep && typeof keep === 'function'){
    mainCb = keep;
    keep = null;
  }
  if(typeof keep !== 'string') keep = 'keep-all'; // can be also 'remove-all'

  var group = this;

  async.parallel([
    // Remove user from group challenges
    function(cb){
      async.waterfall([
        // Find relevant challenges
        function(cb2) {
          Challenge.find({
            _id: {$in: user.challenges}, // Challenges I am in
            group: group._id // that belong to the group I am leaving
          }, cb2);
        },

        // Update each challenge
        function(challenges, cb2) {
          Challenge.update(
            {_id: {$in: _.pluck(challenges, '_id')}},
            {$pull: {members: user._id}},
            {multi: true},
            function(err) {
             cb2(err, challenges); // pass `challenges` above to cb
            }
          );
        },

        // Unlink the challenge tasks from user
        function(challenges, cb2) {
          async.waterfall(challenges.map(function(chal) {
            return function(cb3) {
              var i = user.challenges.indexOf(chal._id)
              if (~i) user.challenges.splice(i,1);
              user.unlink({cid: chal._id, keep: keep}, cb3);
            }
          }), cb2);
        }
      ], cb);
    },

    // Update the group
    function(cb){
      // If user is the last one in group and group is private, delete it
      if(group.members.length === 1 && (
          group.type === 'party' ||
          (group.type === 'guild' && group.privacy === 'private')
      )){
        group.remove(cb)
      }else{ // otherwise just remove a member
        var update = {$pull: {members: user._id}};

        // If the leader is leaving (or if the leader previously left, and this wasn't accounted for)
        var leader = group.leader;

        if(leader == user._id || !~group.members.indexOf(leader)){
          var seniorMember = _.find(group.members, function (m) {return m != user._id});

          // could not exist in case of public guild with 1 member who is leaving
          if(seniorMember){
            if (leader == user._id || !~group.members.indexOf(leader)) {
              update['$set'] = update['$set'] || {};
              update['$set'].leader = seniorMember;
            }
          }
        }

        update['$inc'] = {memberCount: -1};
        Group.update({_id: group._id}, update, cb);
      }
    }
  ], function(err){
    if(err) return mainCb(err);

    firebase.removeUserFromGroup(group._id, user._id);
    return mainCb();
  });
};

export let model = mongoose.model('Group', schema);

// initialize tavern if !exists (fresh installs)
// TODO use promise
model.count({_id: 'habitrpg'}, (err, ct) => {
  if (ct > 0) return;

  new model({
    _id: 'habitrpg',
    chat: [],
    leader: '9',
    name: 'HabitRPG',
    type: 'guild',
    privacy: 'public'
  }).save();
});
