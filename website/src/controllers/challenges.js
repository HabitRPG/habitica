// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('../../../common');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var Task = require('./../models/task').model;
var Challenge = require('./../models/challenge').model;
var logging = require('./../logging');
var csv = require('express-csv');
var utils = require('../utils');
var api = module.exports;
var pushNotify = require('./pushNotifications');

/*
  ------------------------------------------------------------------------
  Challenges
  ------------------------------------------------------------------------
*/

api.list = function(req, res, next) {
  var user = res.locals.user;
  async.waterfall([
    function(cb){
      // Get all available groups I belong to
      Group.find({members: {$in: [user._id]}}).select('_id').exec(cb);
    },
    function(gids, cb){
      // and their challenges
      Challenge.find({
          $or:[
            {leader: user._id},
            {members:{$in:[user._id]}}, // all challenges I belong to (is this necessary? thought is a left a group, but not its challenge)
            {group:{$in:gids}}, // all challenges in my groups
            {group: 'habitrpg'} // public group
          ],
          _id:{$ne:'95533e05-1ff9-4e46-970b-d77219f199e9'} // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug
        })
        .select('name leader description group memberCount prize official')
        .select({members:{$elemMatch:{$in:[user._id]}}})
        .sort('-official -timestamp')
        .populate('group', '_id name type')
        .populate('leader', 'profile.name')
        .exec(cb);
    }
  ], function(err, challenges){
    if (err) return next(err);
    _.each(challenges, function(c){
      c._isMember = c.members.length > 0;
    })
    res.json(challenges);
    user = null;
  });
}

// GET
api.get = function(req, res, next) {
  var user = res.locals.user;
  // TODO use mapReduce() or aggregate() here to
  // 1) Find the sum of users.tasks.values within the challnege (eg, {'profile.name':'tyler', 'sum': 100})
  // 2) Sort by the sum
  // 3) Limit 30 (only show the 30 users currently in the lead)
  Challenge.findById(req.params.cid)
    .populate('members', 'profile.name _id')
    .populate('group', '_id name type')
    .populate('leader', 'profile.name')
    .exec(function(err, challenge){
      if(err) return next(err);
      if (!challenge) return res.json(404, {err: 'Challenge ' + req.params.cid + ' not found'});

      challenge.getTransformedData(function(err, challenge) {
        if(err) return next(err);
        challenge._isMember = !!(_.find(challenge.members, function(member) {
          return member._id === user._id;
        }));
        res.json(challenge);
      });
    });
}

api.csv = function(req, res, next) {
  var cid = req.params.cid;
  var challenge;
  async.waterfall([
    function(cb){
      Challenge.findById(cid,cb)
    },
    function(_challenge,cb) {
      challenge = _challenge;
      if (!challenge) return cb('Challenge ' + cid + ' not found');
      User.find({_id: {$in: ch.members}}, {'profile.name': 1, tasksOrder: 1}, function(err, users){
        if(err) return cb(err);

        async.each(users, function(user, cb1){
          Task.find({
            userId: user._id,
            'challenge.id': cid
          }, function(err, tasks){
            if(err) return cb1(err);
            user = user.toJSON();
            user.tasks = tasks;
            cb1();
          });
        }, function(err){
          if(err) return cb(err);
          return cb(null, users);
        });
      });
    }
  ],function(err,users){
    if(err) return next(err);
    var output = ['UUID','name'];
    _.each(challenge.tasks,function(t){
      //output.push(t.type+':'+t.text);
      //not the right order yet
      output.push('Task');
      output.push('Value');
      output.push('Notes');
    })
    output = [output];
    _.each(users, function(u){
      var uData = [u._id,u.profile.name];
      _.each(u.tasks,function(t){
        uData = uData.concat([t.type+':'+t.text, t.value, t.notes]);
      })
      output.push(uData);
    });
    res.header('Content-disposition', 'attachment; filename='+cid+'.csv');
    res.csv(output);
    challenge = cid = null;
  })
}

api.getMember = function(req, res, next) {
  var cid = req.params.cid;
  var uid = req.params.uid;

  // We need to start using the aggregation framework instead of in-app filtering, see http://docs.mongodb.org/manual/aggregation/
  // See code at 32c0e75 for unwind/group example

  // TODO add security layer here?

  User.findOne({_id: uid}, {'profile.name': 1, tasksOrder: 1}, function(err, user){
    if(err) return next(err);
    if(!user) return res.json(404, {err: 'Member '+uid+' for challenge '+cid+' not found'});
    Task.find({
      userId: uid,
      'challenge.id': cid
    }, function(err, tasks){
      if(err) return next(err);

      uid = cid = null;
      return res.json(user.addTasksToUser(tasks));
    });
  });

  // Previously used aggregation
  //http://stackoverflow.com/questions/24027213/how-to-match-multiple-array-elements-without-using-unwind
}

// CREATE
api.create = function(req, res, next){
  var user = res.locals.user;

  async.auto({
    get_group: function(cb){
      var q = {_id:req.body.group};
      if (req.body.group!='habitrpg') q.members = {$in:[user._id]}; // make sure they're a member of the group
      Group.findOne(q, cb);
    },
    save_chal: ['get_group', function(cb, results){
      var group = results.get_group,
        prize = +req.body.prize;
      if (!group)
        return cb({code:404, err:"Group." + req.body.group + " not found"});
      if (group.leaderOnly && group.leaderOnly.challenges && group.leader !== user._id)
        return cb({code:401, err: "Only the group leader can create challenges"});
      // If they're adding a prize, do some validation
      if (prize < 0)
        return cb({code:401, err: 'Challenge prize must be >= 0'});
      if (req.body.group=='habitrpg' && prize < 1)
        return cb({code:401, err: 'Prize must be at least 1 Gem for public challenges.'});
      if (prize > 0) {
        var groupBalance = ((group.balance && group.leader==user._id) ? group.balance : 0);
        var prizeCost = prize/4; // I really should have stored user.balance as gems rather than dollars... stupid...
        if (prizeCost > user.balance + groupBalance)
          return cb("You can't afford this prize. Purchase more gems or lower the prize amount.")

        if (groupBalance >= prizeCost) {
          // Group pays for all of prize
          group.balance -= prizeCost;
        } else if (groupBalance > 0) {
          // User pays remainder of prize cost after group
          var remainder = prizeCost - group.balance;
          group.balance = 0;
          user.balance -= remainder;
        } else {
          // User pays for all of prize
          user.balance -= prizeCost;
        }
      }
      req.body.leader = user._id;
      req.body.official = user.contributor.admin && req.body.official;

      var chal = new Challenge(req.body); // FIXME sanitize
      chal.members.push(user._id);

      req.body.habits = req.body.habits || [];
      req.body.todos = req.body.todos || [];
      req.body.dailys = req.body.dailys || [];
      req.body.rewards = req.body.rewards || [];

      var tasks = req.body.habits.concat(req.body.rewards)
                    .concat(req.body.dailys).concat(req.body.todos);

      tasks = tasks.map(function(task) {
        var newTask = new Task(task);
        newTask.challenge.id = chal._id;
        user.tasksOrder[task.type + 's'].push(newTask._id);
        return newTask;
      });

      async.parallel({
        chal: chal.save.bind(chal),
        tasks: function(cb1) {
          async.map(tasks, function(task, cb2){
            task.save(cb2);
          }, cb1);
        },
      }, cb);

    }],
    save_group: ['save_chal', function(cb, results){
      results.get_group.challenges.push(results.save_chal.chal[0]._id);
      results.get_group.save(cb);
    }],
    sync_user: ['save_group', function(cb, results){
      // Auto-join creator to challenge (see members.push above)
      results.save_chal.chal[0].syncToUser(user, results.save_chal.tasks, cb);
    }]
  }, function(err, results){
    if (err) {
      return err.code ? res.json(err.code, err) : next(err);
    }
    
    return res.json(results.save_chal.chal[0].addTasksToChallenge(results.save_chal.tasks));
    user = null;
  });
}

// UPDATE
api.update = function(req, res, next){
  var cid = req.params.cid;
  var user = res.locals.user;
  var before;
  var updatedTasks;

  async.waterfall([
    function(cb){
      // We first need the original challenge data, since we're going to compare against new & decide to sync users
      Challenge.findById(cid, cb);
    },
    function(chal, cb){
      if(!chal) return cb({chal: null});

      chal.getTasks(function(err, tasks){
        cb(err, {
          chal: chal,
          tasks: tasks
        });
      });
    },
    function(_before, cb) {
      if (!_before.chal) return cb('Challenge ' + cid + ' not found');
      if (_before.chal.leader != user._id && !user.contributor.admin) return cb({code: 401, err: shared.i18n.t('noPermissionEditChallenge', req.language)});
      // Update the challenge, since syncing will need the updated challenge. But store `before` we're going to do some
      // before-save / after-save comparison to determine if we need to sync to users
      before = {chal: _before.chal, tasks: _before.tasks};
      var chalAttrs = _.pick(req.body, 'name shortName description date'.split(' '));
      async.parallel({
        chal: function(cb1){
          Challenge.findByIdAndUpdate(cid, {$set:chalAttrs}, {new: true}, cb1);
        },
        tasks: function(cb1) {
          // Convert to map of {id: task} so we can easily match them
          var _beforeClonedTasks = _.cloneDeep(_before.tasks.map(function(t) {
            return t.toObject();
          }));
          updatedTasks = _.object(_.pluck(_beforeClonedTasks, '_id'), _beforeClonedTasks);
          var newTasks = req.body.habits.concat(req.body.dailys)
                          .concat(req.body.todos).concat(req.body.rewards);

          var newTasksObj = _.object(_.pluck(newTasks, '_id'), newTasks);
          async.forEachOf(newTasksObj, function(newTask, taskId, cb2){
            // some properties can't be changed
            var updatable = _.omit(newTask, '_id', 'challenge'); 
            _.assign(updatedTasks[taskId], updatable);
            Task.update({
              _id: taskId,
              'challenge.id': cid
            }, {$set: updatable}, cb2);
          }, cb1);
        }
      }, cb);
    },
    function(saved, cb) {
      // Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
      if (before.chal.isOutdated(before.tasks, req.body)) {
        // Sometimes mongoose return an array
        var savedChal = Array.isArray(saved.chal) ? saved.chal[0] : saved.chal;
        User.find({_id: {$in: savedChal.members}}, function(err, users){
          logging.info('Challenge updated, sync to subscribers');
          if (err) throw err;
          _.each(users, function(user){
            savedChal.syncToUser(user, updatedTasks);
          });
        })
      }

      // after saving, we're done as far as the client's concerned. We kick off syncing (heavy task) in the background
      cb(null, saved);
    }
  ], function(err, saved){
    if(err) {
      return err.code ? res.json(err.code, err) : next(err);
    }

    saved.chal.getTransformedData(function(err, newChal){
      if(err) return next(err);
      res.json(newChal);
    })
    cid = user = before = null;
  });
}

/**
 * Called by either delete() or selectWinner(). Will delete the challenge and set the "broken" property on all users' subscribed tasks
 * @param {cid} the challenge id
 * @param {broken} the object representing the broken status of the challenge. Eg:
 *  {broken: 'CHALLENGE_DELETED', id: CHALLENGE_ID}
 *  {broken: 'CHALLENGE_CLOSED', id: CHALLENGE_ID, winner: USER_NAME}
 */
function closeChal(cid, broken, cb) {
  var removed;
  async.waterfall([
    function(cb2){
      Challenge.findOneAndRemove({_id:cid}, cb2)
    },
    function(_removed, cb2) {
      removed = _removed;
      var pull = {'$pull':{challenges: _removed._id}};
      async.parallel({
        updateGroup: function(cb3) {
          Group.findByIdAndUpdate(_removed.group, pull, {new:true}, cb3);
        },
        findUsers: function(cb3) {
          User.find({_id:{$in: removed.members}}, cb3);
        },
        removeTasks: function(cb3) {
          Task.remove({
            'challenge.id': cid,
            userId: {$exists: false}
          }, cb3);
        },
        findUsersTasks: function(cb3) {
          Task.find({
            'challenge.id': cid,
            userId: {$exists: true}
          }, cb3);
        }
      }, cb2);     
    },
    function(results, cb2) {
      var parallel = [];
      _.each(results.findUsers, function(user){
        var tag = _.find(user.tags, {id:cid});
        if (tag) tag.challenge = undefined;
        parallel.push(function(cb3){
          user.save(cb3);
        })
      });

      _.each(results.findUsersTasks, function(task){
        if (task.challenge && task.challenge.id == removed._id) {
          _.merge(task.challenge, broken);
          parallel.push(function(cb3) {
            task.save(cb3);
          });
        }
      });

      async.parallel(parallel, cb2);
      removed = null;
    }
  ], cb);
}

/**
 * Delete & close
 */
api['delete'] = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;

  async.waterfall([
    function(cb){
      Challenge.findById(cid, cb);
    },
    function(chal, cb){
      if (!chal) return cb('Challenge ' + cid + ' not found');
      if (chal.leader != user._id && !user.contributor.admin) return cb({code: 401, err: shared.i18n.t('noPermissionDeleteChallenge', req.language)});
      if (chal.group != 'habitrpg') user.balance += chal.prize/4; // Refund gems to user if a non-tavern challenge
      user.save(cb);
    },
    function(save, num, cb){
      closeChal(req.params.cid, {broken: 'CHALLENGE_DELETED'}, cb);
    }
  ], function(err){
    if (err) return err.code ? res.json(err.code, err) : next(err);
    res.send(200);
    user = cid = null;
  });
}

/**
 * Select Winner & Close
 */
api.selectWinner = function(req, res, next) {
  if (!req.query.uid) return res.json(401, {err: 'Must select a winner'});
  var user = res.locals.user;
  var cid = req.params.cid;
  var chal;
  async.waterfall([
    function(cb){
      Challenge.findById(cid, cb);
    },
    function(_chal, cb){
      chal = _chal;
      if (!chal) return cb('Challenge ' + cid + ' not found');
      if (chal.leader != user._id && !user.contributor.admin) return cb({code: 401, err: shared.i18n.t('noPermissionCloseChallenge', req.language)});
      User.findById(req.query.uid, cb)
    },
    function(winner, cb){
      if (!winner) return cb('Winner ' + req.query.uid + ' not found.');
      _.defaults(winner.achievements, {challenges: []});
      winner.achievements.challenges.push(chal.name);
      winner.balance += chal.prize/4;
      winner.save(cb);
    },
    function(saved, num, cb) {
      if(saved.preferences.emailNotifications.wonChallenge !== false){
        utils.txnEmail(saved, 'won-challenge', [
          {name: 'CHALLENGE_NAME', content: chal.name}
        ]);
      }

      pushNotify.sendNotify(saved, shared.i18n.t('wonChallenge'), chal.name);

      closeChal(cid, {broken: 'CHALLENGE_CLOSED', winner: saved.profile.name}, cb);
    }
  ], function(err){
    if (err) return err.code ? res.json(err.code, err) : next(err);
    res.send(200);
    user = cid = chal = null;
  })
}

api.join = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;
  var chalTasks;

  async.waterfall([
    function(cb) {
      Challenge.findByIdAndUpdate(cid, {$addToSet:{members:user._id}}, {new: true}, cb);
    },
    function(chal, cb) {

      // Trigger updating challenge member count in the background. We can't do it above because we don't have
      // _.size(challenge.members). We can't do it in pre(save) because we're calling findByIdAndUpdate above.
      // TODO why not just use mongo `inc` operation?
      Challenge.update({_id:cid}, {$set:{memberCount:_.size(chal.members)}}).exec();

      if (!~user.challenges.indexOf(cid))
        user.challenges.unshift(cid);

      chal.getTasks(function(err, tasks){
        // Add all challenge's tasks to user's tasks
        chalTasks = tasks;
        chal.syncToUser(user, tasks, function(err){
          if (err) return cb(err);
          cb(null, chal); // we want the saved challenge in the return results, due to ng-resource
        });

      });

    }
  ], function(err, chal){
    if(err) return next(err);
    chal._isMember = true;
    res.json(chal.addTasksToChallenge(chalTasks));
    user = cid = null;
  });
}


api.leave = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;
  // whether or not to keep challenge's tasks. strictly default to true if "keep-all" isn't provided
  var keep = (/^remove-all/i).test(req.query.keep) ? 'remove-all' : 'keep-all';

  async.waterfall([
    function(cb){
      Challenge.findByIdAndUpdate(cid, {$pull:{members:user._id}}, {new: true}, cb);
    },
    function(chal, cb){

      // Trigger updating challenge member count in the background. We can't do it above because we don't have
      // _.size(challenge.members). We can't do it in pre(save) because we're calling findByIdAndUpdate above.
      if (chal)
        Challenge.update({_id:cid}, {$set:{memberCount:_.size(chal.members)}}).exec();

      var i = user.challenges.indexOf(cid)
      if (~i) user.challenges.splice(i,1);
      user.unlink({cid:cid, keep:keep}, function(err){
        if (err) return cb(err);
        cb(null, chal);
      })
    }
  ], function(err, chal){
    if(err) return next(err);
    if (chal) chal._isMember = false;
    res.json(chal);
    user = cid = keep = null;
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
  user.unlink({cid:cid, keep:req.query.keep, tid:tid}, function(err, saved){
    if (err) return next(err);
    res.send(200);
    user = tid = cid = null;
  });
}
