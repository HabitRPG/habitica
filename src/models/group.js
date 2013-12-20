var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('habitrpg-shared');
var _ = require('lodash');
var async = require('async');

var GroupSchema = new Schema({
  _id: {type: String, 'default': shared.uuid},
  name: String,
  description: String,
  leader: {type: String, ref: 'User'},
  members: [{type: String, ref: 'User'}],
  invites: [{type: String, ref: 'User'}],
  type: {type: String, "enum": ['guild', 'party']},
  privacy: {type: String, "enum": ['private', 'public']},
  //_v: {type: Number,'default': 0},
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

  memberCount: {type: Number, 'default': 0},
  challengeCount: {type: Number, 'default': 0},
  balance: Number,
  logo: String,
  leaderMessage: String,
  challenges: [{type:'String', ref:'Challenge'}], // do we need this? could depend on back-ref instead (Challenge.find({group:GID}))
  quest: {
    key: String,
    active: {type:Boolean, 'default':false},
    progress:{
      hp: Number,
      collected: Schema.Types.Mixed,
    },

    //Shows boolean for each party-member who has accepted the quest. Eg {UUID: true, UUID: false}. Once all users click
    //'Accept', the quest begins. If a false user waits too long, probably a good sign to prod them or boot them.
    //TODO when booting user, remove from .joined and check again if we can now start the quest
    members: Schema.Types.Mixed
  }
}, {
  strict: 'throw',
  minimize: false // So empty objects are returned
});

/**
 * Derby duplicated stuff. This is a temporary solution, once we're completely off derby we'll run an mongo migration
 * to remove duplicates, then take these fucntions out
 */
function removeDuplicates(doc){
  // Remove duplicate members
  if (doc.members) {
    var uniqMembers = _.uniq(doc.members);
    if (uniqMembers.length != doc.members.length) {
      doc.members = uniqMembers;
    }
  }
}

// FIXME this isn't always triggered, since we sometimes use update() or findByIdAndUpdate()
// @see https://github.com/LearnBoost/mongoose/issues/964
GroupSchema.pre('save', function(next){
  removeDuplicates(this);
  this.memberCount = _.size(this.members);
  this.challengeCount = _.size(this.challenges);
  next();
})

GroupSchema.methods.toJSON = function(){
  var doc = this.toObject();
  removeDuplicates(doc);
  doc._isMember = this._isMember;

  // @see pre('save') comment above
  this.memberCount = _.size(this.members);
  this.challengeCount = _.size(this.challenges);

  return doc;
}

GroupSchema.methods.sendChat = function(message, user){
  var group = this;
  var message = {
    id: shared.uuid(),
    text: message,
    timestamp: +(new Date)
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
  group.chat.unshift(message);
  group.chat.splice(200);
}

GroupSchema.methods.hurtBoss = function(delta, cb) {
  var group = this;
  group.quest.progress.hp -= delta;
  var hp = group.quest.progress.hp;
  if (group.quest.progress.hp <= 0) {
    var key = group.quest.key,
      quest = shared.content.quests[key];

    var parallel = _.reduce(group.members, function(m,v,k){

      // Achievement
      _.defaults(v.achievements, {quests:{}})
      if (!v.achievements.quests[key]) v.achievements.quests[key] = 0;
      v.achievements.quests[key]++;
      v.markModified('achievements');

      // Drops
      v.stats.gp += +quest.drop.gp;
      v.stats.exp += +quest.drop.exp;
      switch (quest.drop.type) {
        case 'gear':
          // TODO This means they can lose their new gear on death, is that what we want?
          v.items.gear.owned[quest.drop.key] = true;
          break;
        case 'eggs':
        case 'food':
        case 'hatchingPotions':
          if (!v.items.hatchingPotions[quest.drop.key]) v.items.hatchingPotions[quest.drop.key] = 0;
          v.items.hatchingPotions[quest.drop.key]++;
          break;
        case 'pets':
          if (!v.items.pets[quest.drop.key]) v.items.pets[quest.drop.key] = 5;
          break;
        case 'mounts':
          v.items.mounts[quest.drop.key] = true;
          break;
      }

      v.party.quest.key = undefined;
      v.party.quest.collection = {};
      v.markModified('party.quest');

      v._v++;
      m.push(function(cb3){ v.save(cb3); })
      return m;
    }, []);

    // Finish the quest
    group.quest = {};group.markModified('quest');
    group.sendChat('`' + quest.name + ' has been slain! Party has received their rewards`');

    parallel.push(function(cb3){
      group.save(cb3);
    })
    async.parallel(parallel,cb);
  }
  else {
    group.save(cb);
  }
  return hp;
}

module.exports.schema = GroupSchema;
module.exports.model = mongoose.model("Group", GroupSchema);
