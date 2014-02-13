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
    leader: {type:String, ref:'User'},
    progress:{
      hp: Number,
      collect: {type:Schema.Types.Mixed, 'default':{}} // {feather: 5, ingot: 3}
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
    timestamp: +(new Date),
    likes: {}
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

  // Kick off chat notifications in the background.
  var lastSeenUpdate = {$set:{}, $inc:{_v:1}};
  lastSeenUpdate['$set']['newMessages.'+group._id] = {name:group.name,value:true};
  if (group._id == 'habitrpg') {
    // TODO For Tavern, only notify them if their name was mentioned
    // var profileNames = [] // get usernames from regex of @xyz. how to handle space-delimited profile names?
    // User.update({'profile.name':{$in:profileNames}},lastSeenUpdate,{multi:true}).exec();
  } else {
    mongoose.model('User').update({_id:{$in:group.members, $ne: user ? user._id : ''}},lastSeenUpdate,{multi:true}).exec();
  }
}

var cleanQuestProgress = function(merge){
  var clean = {
    key: null,
    progress: {
      up: 0,
      down: 0,
      collect: {}
    },
    completed: null
  };
  merge = merge || {progress:{}};
  _.merge(clean, _.omit(merge,'progress'));
  _.merge(clean.progress, merge.progress);
  return clean;
}
GroupSchema.statics.cleanQuestProgress = cleanQuestProgress;

// Participants: Grant rewards & achievements, finish quest
GroupSchema.methods.finishQuest = function(quest, cb) {
  var group = this;
  var questK = quest.key;
  var updates = {$inc:{},$set:{}};

  updates['$inc']['achievements.quests.' + questK] = 1;
  updates['$inc']['stats.gp'] = +quest.drop.gp;
  updates['$inc']['stats.exp'] = +quest.drop.exp;
  updates['$inc']['_v'] = 1;
  updates['$set']['party.quest'] = cleanQuestProgress({completed:questK});

  _.each(quest.drop.items, function(item){
    var dropK = item.key;
    switch (item.type) {
      case 'gear':
        // TODO This means they can lose their new gear on death, is that what we want?
        updates['$set']['items.gear.owned.'+dropK] = true;
        break;
      case 'eggs':
      case 'food':
      case 'hatchingPotions':
      case 'quests':
        updates['$inc']['items.'+item.type+'.'+dropK] = _.where(quest.drop.items,{type:item.type,key:item.key}).length;
        break;
      case 'pets':
        updates['$set']['items.pets.'+dropK] = 5;
        break;
      case 'mounts':
        updates['$set']['items.mounts.'+dropK] = true;
        break;
    }
  })
  var members = _.keys(group.quest.members);
  group.quest = {};group.markModified('quest');
  mongoose.models.User.update({_id:{$in:members}}, updates, {multi:true}, cb);
}

// FIXME this is a temporary measure, we need to remove quests from users when they traverse parties
function isOnQuest(user,group){
  return group && user.party.quest.key && user.party.quest.key == group.quest.key;
}

GroupSchema.statics.collectQuest = function(user, progress, cb) {
  this.findOne({type: 'party', members: {'$in': [user._id]}},function(err, group){
    if (!isOnQuest(user,group)) return cb(null);
    var quest = shared.content.quests[group.quest.key];

    _.each(progress.collect,function(v,k){
      group.quest.progress.collect[k] += v;
    });

    var foundText = _.reduce(progress.collect, function(m,v,k){
      m.push(v + ' ' + quest.collect[k].text);
      return m;
    }, []);
    foundText = foundText ? foundText.join(', ') : 'nothing';
    group.sendChat("`" + user.profile.name + " found "+foundText+".`");
    group.markModified('quest.progress.collect');

    // Still needs completing
    if (_.find(shared.content.quests[group.quest.key].collect, function(v,k){
      return group.quest.progress.collect[k] < v.count;
    })) return group.save(cb);

    async.series([
      function(cb2){
        group.finishQuest(quest,cb2);
      },
      function(cb2){
        group.sendChat('`All items found! Party has received their rewards.`');
        group.save(cb2);
      }
    ],cb);
  })
}

GroupSchema.statics.bossQuest = function(user, progress, cb) {
  this.findOne({type: 'party', members: {'$in': [user._id]}},function(err, group){
    if (!isOnQuest(user,group)) return cb(null);
    var quest = shared.content.quests[group.quest.key];
    if (!progress || !quest) return cb(null); // FIXME why is this ever happening, progress should be defined at this point
    var down = progress.down * quest.boss.str; // multiply by boss strength

    group.quest.progress.hp -= progress.up;
    group.sendChat("`" + user.profile.name + " attacks " + quest.boss.name + " for " + (progress.up.toFixed(1)) + " damage, " + quest.boss.name + " attacks party for " + Math.abs(down).toFixed(1) + " damage.`");

    // Everyone takes damage
    var series = [
      function(cb2){
        mongoose.models.User.update({_id:{$in: _.keys(group.quest.members)}}, {$inc:{'stats.hp':down, _v:1}}, {multi:true}, cb2);
      }
    ]

    // Boss slain, finish quest
    if (group.quest.progress.hp <= 0) {
      group.sendChat('`You defeated ' + quest.boss.name + '! Questing party members receive the rewards of victory.`');
      // Participants: Grant rewards & achievements, finish quest
      series.push(function(cb2){
        group.finishQuest(quest,cb2);
      });
    }

    series.push(function(cb2){group.save(cb2)});
    async.series(series,cb);
  })
}

module.exports.schema = GroupSchema;
module.exports.model = mongoose.model("Group", GroupSchema);
