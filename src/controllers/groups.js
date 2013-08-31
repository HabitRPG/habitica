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
  Party
  ------------------------------------------------------------------------
*/

api.getGroups = function(req, res, next) {
  var user = res.locals.user;
  var usernameFields = 'auth.local.username auth.facebook.first_name auth.facebook.last_name auth.facebook.name auth.facebook.username';

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
      Group.find({
        privacy: 'public'
      }, {
        name: 1,
        description: 1,
        members: 1
      }, cb);
    }
  }, function(err, results){
    if (err) return res.json(500, {err: err});

    // Remove self from party (see above failing `match` directive in `populate`
    var i = _.findIndex(results.party.members, {_id:user._id});
    if (~i) results.party.members.splice(i,1);

    res.json(results);
  })
};