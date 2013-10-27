// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var api = module.exports;

/*
  ------------------------------------------------------------------------
  Challenges
  ------------------------------------------------------------------------
*/

// GET
api.get = function(req, res) {
  // TODO only find in user's groups (+ public)
  // TODO populate (group, leader, members)
  Challenge.find({},function(err, challenges){
    if(err) return res.json(500, {err:err});
    res.json(challenges);
  })
}

// CREATE
api.create = function(req, res){
  // FIXME sanitize
  var challenge = new Challenge(req.body);
  challenge.save(function(err, saved){
    // Need to create challenge with refs (group, leader)? Or is this taken care of automatically?
    // @see http://mongoosejs.com/docs/populate.html
    if (err) return res.json(500, {err:err});
    res.json(saved);
  });
}

// UPDATE
api.update = function(req, res){
  //FIXME sanitize
  Challenge.findByIdAndUpdate(req.params.cid, {$set:req.body}, function(err, saved){
    if(err) res.json(500, {err:err});
    res.json(saved);
    // TODO update subscribed users' tasks, each user.__v++
  })
}

// DELETE
// 1. update challenge
// 2. update sub'd users' tasks

/**
 * Syncs all new tasks, deleted tasks, etc to the user object
 * @param chal
 * @param user
 * @return nothing, user is modified directly. REMEMBER to save the user!
 */
var syncChalToUser = function(chal, user) {
  if (!chal || !user) return;

  // Sync tags
  var tags = user.tags || [];
  var i = _.findIndex(tags, {id: chal._id})
  if (~i) {
    if (tags[i].name !== chal.name) {
      // update the name - it's been changed since
      user.tags[i].name = chal.name;
    }
  } else {
    user.tags.push({
      id: chal._id,
      name: chal.name,
      challenge: true
    });
  }
  tags = {};
  tags[chal._id] = true;
  _.each(['habits','dailys','todos','rewards'], function(type){
    _.each(chal[type], function(task){
      _.defaults(task, {
        tags: tags,
        challenge: chal._id,
        group: chal.group
      });

      if (~(i = _.findIndex(user[type], {id:task.id}))) {
        _.defaults(user[type][i], task);
      } else {
        user[type].push(task);
      }
    })
  })
  //FIXME account for deleted tasks (each users.tasks.broken = true)
};

api.join = function(req, res){
  var user = res.locals.user;
  var cid = req.params.cid;

  async.waterfall([
    function(cb){
      Challenge.findByIdAndUpdate(cid, {$addToSet:{members:user._id}}, cb);
    },
    function(challenge, cb){
      if (!~user.challenges.indexOf(cid))
        user.challenges.unshift(cid);
      // Add all challenge's tasks to user's tasks
      syncChalToUser(challenge, user);
      user.save(function(err){
        if (err) return cb(err);
        cb(null, challenge); // we want the saved challenge in the return results, due to ng-resource
      });
    }
  ], function(err, result){
    if(err) return res.json(500,{err:err});
    res.json(result);
  });
}

api.leave = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;
  // whether or not to keep challenge's tasks. strictly default to true if "false" isn't provided
  var keep = !(/^false$/i).test(req.query.keep);

  async.waterfall([
    function(cb){
      Challenge.findByIdAndUpdate(cid, {$pull:{members:user._id}}, cb);
    },
    function(chal, cb){
      // Remove challenge from user
      //User.findByIdAndUpdate(user._id, {$pull:{challenges:cid}}, cb);
      var i = user.challenges.indexOf(cid)
      if (~i) user.challenges.splice(i,1);

      // Remove tasks from user
      _.each(chal.tasks, function(task) {
        if (keep) {
          delete user[task.type+'s'].id(task.id).challenge;
          delete user[task.type+'s'].id(task.id).group;
        } else {
          user[task.type+'s'].id(task.id).remove();
        }
      });
      user.save(function(err){
        if (err) return cb(err);
        cb(null, chal);
      })
    }
  ], function(err, result){
    if(err) return res.json(500,{err:err});
    res.json(result);
  });
}