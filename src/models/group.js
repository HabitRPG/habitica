var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('habitrpg-shared');
var _ = require('lodash');

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
  challenges: [{type:'String', ref:'Challenge'}] // do we need this? could depend on back-ref instead (Challenge.find({group:GID}))
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

module.exports.schema = GroupSchema;
module.exports.model = mongoose.model("Group", GroupSchema);
