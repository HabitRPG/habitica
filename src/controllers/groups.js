// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var api = module.exports;

/*
  ------------------------------------------------------------------------
  Groups
  ------------------------------------------------------------------------
*/

api.getGroups = function(req, res, next) {
  var user = res.locals.user;
  var usernameFields = 'auth.local.username auth.facebook.displayName auth.facebook.givenName auth.facebook.familyName auth.facebook.name';

  // First get all groups
  async.parallel({
    party: function(cb) {
      Group
        .findOne({type: 'party', members: {'$in': [user._id]}})
        .populate({
          path: 'members',
          //match: {_id: {$ne: user._id}}, //fixme this causes it to hang??
          select: 'profile preferences items stats achievements party backer ' + usernameFields
        })
        .exec(cb);
    },
    guilds: function(cb) {
      Group.find({type: 'guild', members: {'$in': [user._id]}}).populate('members', usernameFields).exec(cb);
//      Group.find({type: 'guild', members: {'$in': [user._id]}}, cb);
    },
    tavern: function(cb) {
      Group.findOne({_id: 'habitrpg'}, cb);
    },
    "public": function(cb) {
      Group.find({privacy: 'public'}, {name:1, description:1, members:1}, cb);
    }
  }, function(err, results){
    if (err) return res.json(500, {err: err});

    // Remove self from party (see above failing `match` directive in `populate`
    var i = _.findIndex(results.party.members, {_id:user._id});
    if (~i) results.party.members.splice(i,1);

    // Sort public groups by members length (not easily doable in mongoose)
    results.public = _.sortBy(results.public, function(group){
      return -group.members.length;
    })

    res.json(results);
  })
};

api.attachGroup = function(req, res, next) {
  Group.findById(req.params.gid, function(err, group){
    if(err) return res.json(500, {err:err});
    res.locals.group = group;
    next();
  })
}

api.postChat = function(req, res, next) {
  var user = res.locals.user
  var group = res.locals.group;
  var message = {
    id: helpers.uuid(),
    uuid: user._id,
    contributor: user.backer && user.backer.contributor,
    npc: user.backer && user.backer.npc,
    text: req.body.message,
    user: helpers.username(user.auth, user.profile.name),
    timestamp: +(new Date)
  };

  group.chat.unshift(message);
  group.chat.splice(200);

  if (group.type === 'party') {
    user.party.lastMessageSeen = message.id;
    user.save();
  }

  group.save(function(err, group){
    if (err) return res.json(500, {err:err});
    res.json(group.chat);
  })
}