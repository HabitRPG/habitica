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
  /*TODO should we support non-authenticated users? just for viewing public groups?*/

  return async.parallel({
    party: function(cb) {
      async.waterfall([
        function(cb2) {
          Group.findOne({type: 'party', members: {'$in': [user._id]}}, cb2);
        }, function(party, cb2) {
          var fields, query;
          party = party.toJSON();
          query = {_id: {
              '$in': party.members,
              '$nin': [user._id]
            }
          };
          fields = 'profile preferences items stats achievements party backer auth.local.username auth.facebook.first_name auth.facebook.last_name auth.facebook.name auth.facebook.username'.split(' ');
          fields = _.reduce(fields, (function(m, k, v) {m[k] = 1;return m;}), {});
          User.find(query, fields, function(err, members) {
            party.members = members;
            cb2(err, party);
          });
        }
      ], function(err, members) {
        cb(err, members);
      });
    },
    guilds: function(cb) {
      Group.find({type: 'guild', members: {'$in': [user._id]}}, cb);
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
  }, function(err, results) {
    if (err) return res.json(500, {err: err});
    res.json(results);
  });
};