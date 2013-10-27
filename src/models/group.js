var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');

var GroupSchema = new Schema({
  _id: {type: String, 'default': helpers.uuid},
  name: String,
  description: String,
  leader: {
    type: String,
    ref: 'User'
  },
  members: [
    {
      type: String,
      ref: 'User'
    }
  ],
  invites: [
    {
      type: String,
      ref: 'User'
    }
  ],
  type: {
    type: String,
    "enum": ['guild', 'party']
  },
  privacy: {
    type: String,
    "enum": ['private', 'public']
  },
  _v: {
    Number: Number,
    'default': 0
  },
  websites: Array,
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

  balance: Number,
  logo: String,
  leaderMessage: String
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

  if (doc.websites) {
    var uniqWebsites = _.uniq(doc.websites);
    if (uniqWebsites.length != doc.websites.length) {
      doc.websites = uniqWebsites;
    }
    console.log(doc.websites);
  }
}

GroupSchema.pre('save', function(next){
  removeDuplicates(this);
  next();
})

GroupSchema.methods.toJSON = function(){
  var doc = this.toObject();
  removeDuplicates(doc);
  return doc;
}

module.exports.schema = GroupSchema;
module.exports.model = mongoose.model("Group", GroupSchema);