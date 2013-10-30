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

api.list = function(req, res) {
  var user = res.locals.user;
  Challenge.find({
      $or:[
        {leader: user._id},
        {members:{$in:[user._id]}},
        {group: 'habitrpg'}
      ]
    })
    .select('name description memberCount group members')
    .populate('group', '_id name')
    .exec(function(err, challenges){
      if (err) return res.json(500,{err:err});
      _.each(challenges, function(c){
        c._isMember = !!~c.members.indexOf(user._id);
        c.members = [];
      })
      res.json(challenges);
    });
}

// GET
api.get = function(req, res) {
  var user = res.locals.user;
  Challenge.findById(req.params.cid)
    .populate('members', 'profile.name habits dailys rewards todos')
    .exec(function(err, challenge){
      if(err) return res.json(500, {err:err});
      // slim down the return members' tasks to only the ones in the challenge
      _.each(challenge.members, function(member){
        if (member._id == user._id)
          challenge._isMember = true;
        _.each(['habits', 'dailys', 'todos', 'rewards'], function(type){
          member[type] = _.where(member[type], function(task){
            return task.challenge && task.challenge.id == challenge._id;
          })
        })
      });
      res.json(challenge);
    })
}

// CREATE
api.create = function(req, res){
  // FIXME sanitize
  var challenge = new Challenge(req.body);
  challenge.save(function(err, saved){
    if (err) return res.json(500, {err:err});
    Group.findByIdAndUpdate(saved.group, {$addToSet:{challenges:saved._id}}) // fixme error-check
    res.json(saved);
  });
}

function keepAttrs(task) {
  // only sync/compare important attrs
  var keepAttrs = 'text notes up down priority repeat'.split(' ');
  if (task.type=='reward') keepAttrs.push('value');
  return _.pick(task, keepAttrs);
}

// UPDATE
api.update = function(req, res){
  //FIXME sanitize
  var cid = req.params.cid;
  async.waterfall([
    function(cb){
      // We first need the original challenge data, since we're going to compare against new & decide to sync users
      Challenge.findById(cid, cb);
    },
    function(chal, cb) {

      // Update the challenge, and then just res.json success (note we're passing `cb` here).
      // The syncing stuff is really heavy, and the client doesn't care - so we kick it off in the background
      delete req.body._id;
      Challenge.findByIdAndUpdate(cid, {$set:req.body}, cb);

      // Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
      function comparableData(obj) {
        return (
          _.chain(obj.habits.concat(obj.dailys).concat(obj.todos).concat(obj.rewards))
          .sortBy('id') // we don't want to update if they're sort-order is different
          .transform(function(result, task){
            result.push(keepAttrs(task));
          }))
          .toString(); // for comparing arrays easily
      }
      if (comparableData(chal) !== comparableData(req.body)) {
        User.find({_id: {$in: chal.members}}, function(err, users){
          console.log('Challenge updated, sync to subscribers');
          if (err) throw err;
          _.each(users, function(user){
            syncChalToUser(chal, user);
            user.save();
          })
        })
      }

    }
  ], function(err, saved){
    if(err) res.json(500, {err:err});
    res.json(saved);
  })
}

// DELETE
api['delete'] = function(req, res){
  var removed;
  async.waterfall([
    function(cb){
      Challenge.findOneAndRemove({_id:req.params.cid}, cb)
    },
    function(_removed, cb) {
      removed = _removed;
      User.find({_id:{$in: removed.members}}, cb);
    },
    function(users, cb) {
      var parallel = [];
      _.each(users, function(user){
        _.each(user.tasks, function(task){
          if (task.challenge && task.challenge.id == removed._id) {
            task.challenge.broken = 'CHALLENGE_DELETED';
          }
        })
        parallel.push(function(cb2){
          user.save(cb2);
        })
      })
      async.parallel(parallel, cb);
    }
  ], function(err){
    if (err) return res.json(500, {err: err});
    res.send(200);
  })
}

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

  // Sync new tasks and updated tasks
  _.each(chal.tasks, function(task){
    var type = task.type;
    _.defaults(task, {tags: tags, challenge:{}});
    _.defaults(task.challenge, {id:chal._id});
    if (user.tasks[task.id]) {
      _.merge(user.tasks[task.id], keepAttrs(task));
    } else {
      user[type+'s'].push(task);
    }
  })

  // Flag deleted tasks as "broken"
  _.each(user.tasks, function(task){
    if (!chal.tasks[task.id]) task.challenge.broken = 'TASK_DELETED';
  })
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
    result._isMember = true;
    res.json(result);
  });
}

function unlink(user, cid, keep, tid) {
  switch (keep) {
    case 'keep':
      user.tasks[tid].challenge = {};
      break;
    case 'remove':
      user[user.tasks[tid].type+'s'].id(tid).remove();
      break;
    case 'keep-all':
      _.each(user.tasks, function(t){
        if (t.challenge && t.challenge.id == cid) {
          t.challenge = {};
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
    result._isMember = false;
    res.json(result);
  });
}

api.unlink = function(req, res, next) {
  // they're scoring the task - commented out, we probably don't need it due to route ordering in api.js
  //var urlParts = req.originalUrl.split('/');
  //if (_.contains(['up','down'], urlParts[urlParts.length -1])) return next();

  var user = res.locals.user;
  var tid = req.params.id;
  var cid = user.tasks[tid].challenge.id;
  if (!req.query.keep)
    return res.json(400, {err: 'Provide unlink method as ?keep=keep-all (keep, keep-all, remove, remove-all)'});
  unlink(user, cid, req.query.keep, tid);
  user.markModified('habits');
  user.markModified('dailys');
  user.markModified('todos');
  user.markModified('rewards');
  user.save(function(err, saved){
    if (err) return res.json(500,{err:err});
    res.send(200);
  });
}