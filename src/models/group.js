var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('habitrpg-shared');
var _ = require('lodash');
var async = require('async');
var User = require('./user').model;

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

GroupSchema.methods.bossAttack = function(user, tally, cb) {
  var group = this;
  var questK = group.quest.key;
  var quest = shared.content.quests[questK];
  var dropK = quest.drop.key;
  var down = tally.down * quest.stats.str; // multiply by boss strength

  group.quest.progress.hp -= tally.up;
  group.sendChat("`<" + user.profile.name + "> attacks <" + quest.name + "> for " + (tally.up.toFixed(1)) + " damage, <" + quest.name + "> attacks party for " + (down.toFixed(1)) + " damage.`");
  //var hp = group.quest.progress.hp;

  // Everyone takes damage
  var series = [
    function(cb2){
      mongoose.models.User.update({_id:{$in: _.keys(group.quest.members)}}, {$inc:{'stats.hp':down, _v:1}}, {multi:true}, cb2);
    }
  ]

  // Boss slain, finish quest
  if (group.quest.progress.hp <= 0) {
    series.push(function(cb2){
      async.parallel([
        // Participants: Grant rewards & achievements, finish quest
        function(cb3){
          var updates = {$inc:{},$set:{}};
          updates['$inc']['achievements.quests.'+questK] = 1;
          updates['$inc']['stats.gp'] = +quest.drop.gp;
          updates['$inc']['stats.exp'] = +quest.drop.exp;
          updates['$inc']['_v'] = 1;
          updates['$unset'] = {'party.quest.key':undefined};
          updates['$set']['party.quest.collection'] = {};

          switch (quest.drop.type) {
            case 'gear':
              // TODO This means they can lose their new gear on death, is that what we want?
              updates['$set']['items.gear.owned.'+dropK] = true;
              break;
            case 'eggs':
            case 'food':
            case 'hatchingPotions':
              updates['$inc']['items.'+quest.drop.type+'.'+dropK] = 1;
              break;
            case 'pets':
              updates['$set']['items.pets.'+dropK] = 5;
              break;
            case 'mounts':
              updates['$set']['items.mounts.'+dropK] = true;
              break;
          }
          // FIXME this is TERRIBLE practice. Looks like there are circular dependencies in the models, such that `var User` at
          // this point is undefined. So we get around that by loading from mongoose only once we get to this point
          mongoose.models.User.update({_id:{$in: _.keys(group.quest.members)}},updates,{multi:true},cb3);
        },
        // Group: finish quest
        function(cb3){
          group.quest = {};group.markModified('quest');
          group.sendChat('`' + quest.name + ' has been slain! Party has received their rewards`');
          group.save(cb3);
        }
      ],cb2);
    })
  }

  series.push(function(cb2){group.save(cb2)});
  async.series(series,cb);
  //return hp;
}

module.exports.schema = GroupSchema;
module.exports.model = mongoose.model("Group", GroupSchema);
