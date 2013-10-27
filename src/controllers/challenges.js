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
      _.defaults(task, {tags: tags, challenge:{}});
      _.defaults(task.challenge, {id:chal._id, broken:false});
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

function unlink(user, cid, keep, tid) {
  switch (keep) {
    case 'keep':
      delete user.tasks[tid].challenge;
      break;
    case 'remove':
      user[user.tasks[tid].type+'s'].id(tid).remove();
      break;
    case 'keep-all':
      _.each(user.tasks, function(t){
        if (t.challenge && t.challenge.id == cid) {
          delete t.challenge;
        }
      });
      break;
    case 'remove-all':
      _.each(user.tasks, function(t){
        if (t.challenge && t.challenge.id == cid) {
          user[t.type+'s'].id(t.id).remove();
        }
      })
      break;
  }
}

api.leave = function(req, res){
  var user = res.locals.user;
  var cid = req.params.cid;
  // whether or not to keep challenge's tasks. strictly default to true if "keep-all" isn't provided
  var keep = (/^remove-all/i).test(req.query.keep) ? 'remove-all' : 'keep-all';

  async.waterfall([
    function(cb){
      Challenge.findByIdAndUpdate(cid, {$pull:{members:user._id}}, cb);
    },
    function(chal, cb){
      // Remove challenge from user
      //User.findByIdAndUpdate(user._id, {$pull:{challenges:cid}}, cb);
      var i = user.challenges.indexOf(cid)
      if (~i) user.challenges.splice(i,1);
      unlink(user, chal._id, keep)
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

api.unlink = function(req, res) {
  var user = res.locals.user;
  var tid = req.params.id;
  var cid = user.tasks[tid].challenge.id;
  if (!req.query.keep)
    return res.json(400, {err: 'Provide unlink method as ?keep=keep-all (keep, keep-all, remove, remove-all)'});
  unlink(user, cid, req.query.keep, tid);
  user.save(function(err, saved){
    if (err) return res.json(500,{err:err});
    res.send(200);
  });
}