// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('habitrpg-shared');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var logging = require('./../logging');
var csv = require('express-csv');
var api = module.exports;


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
          ]
        })
        .select('name leader description group memberCount prize official')
        .select({members:{$elemMatch:{$in:[user._id]}}})
        .populate('group', '_id name')
        .populate('leader', 'profile.name')
        .sort('-official -timestamp')
        .exec(cb);
    }
  ], function(err, challenges){
    if (err) return next(err);
    _.each(challenges, function(c){
      c._isMember = c.members.length > 0;
    })
    res.json(challenges);
  });
}

// GET
api.get = function(req, res, next) {
  // TODO use mapReduce() or aggregate() here to
  // 1) Find the sum of users.tasks.values within the challnege (eg, {'profile.name':'tyler', 'sum': 100})
  // 2) Sort by the sum
  // 3) Limit 30 (only show the 30 users currently in the lead)
  Challenge.findById(req.params.cid)
    .populate('members', 'profile.name _id')
    .exec(function(err, challenge){
      if(err) return next(err);
      if (!challenge) return res.json(404, {err: 'Challenge ' + req.params.cid + ' not found'});
      res.json(challenge);
    })
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
      var elemMatch = {$elemMatch:{'challenge.id':cid}};
      User.find(
      {_id:{'$in':challenge.members}},
      {todos:elemMatch,habits:elemMatch,dailys:elemMatch,rewards:elemMatch,_id:1,'profile.name':1},
      cb);
    }
  ],function(err,users){
    if(err) return next(err);
    var output = ['UUID','name'];
    _.each(challenge.tasks,function(t){
      output.push(t.type+':'+t.text);
      output.push('Value');
      output.push('Notes');
    })
    output = [output];
    _.each(users, function(u){
      var uData = [u._id,u.profile.name];
      _.each(u.tasks,function(t){
        uData = uData.concat(['', t.value, t.notes]);
      })
      output.push(uData);
    });
    res.header('Content-disposition', 'attachment; filename='+cid+'.csv');
    res.csv(output);
  })
}

api.getMember = function(req, res, next) {
  var cid = req.params.cid, uid = req.params.uid;
  var elemMatch = {$elemMatch:{'challenge.id':cid}};
  User.findById(uid)
    .select({'profile.name':1, habits:elemMatch, dailys:elemMatch, todos:elemMatch, rewards:elemMatch})
    .exec(function(err, member){
      if(err) return next(err);
      if (!member) return res.json(404, {err: 'Member '+uid+' for challenge '+cid+' not found'});
      res.json(member);
    })
}

// CREATE
api.create = function(req, res, next){
  var user = res.locals.user;
  var group, chal;

  // First, make sure they've selected a legit group, and store it for later
  var waterfall = [
    function(cb){
      Group.findById(req.body.group).exec(cb);
    },
    function(_group, cb){
      if (!_group) return cb("Group." + req.body.group + " not found");
      group = _group;
      cb(null);
    }
  ];

  // If they're adding a prize, do some validation
  if (+req.body.prize < 0) return res.json(401, {err: 'Challenge prize must be >= 0'});
  if (req.body.group=='habitrpg' && +req.body.prize < 1) return res.json(401, {err: 'Prize must be at least 1 Gem for public challenges.'});
  if (+req.body.prize > 0) {
    waterfall.push(function(cb){
      var groupBalance = ((group.balance && group.leader==user._id) ? group.balance : 0);
		  var prizeCost = req.body.prize/4; // I really should have stored user.balance as gems rather than dollars... stupid...
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
      cb(null)
    });
  }

  waterfall = waterfall.concat([
    function(cb) { // if we're dealing with prize above, arguemnts will be `group, numRows, cb` - else `cb`
      req.body.leader = user._id;
      req.body.official = user.contributor.admin && req.body.official;
      var chal = new Challenge(req.body); // FIXME sanitize
      chal.members.push(user._id);
      chal.save(cb)
    },
    function(_chal, num, cb){
      chal = _chal;
      group.challenges.push(chal._id);
      group.save(cb);
    },
    function(_group, num, cb) {
      // Auto-join creator to challenge (see members.push above)
      chal.syncToUser(user, cb);
    }
  ]);
  async.waterfall(waterfall, function(err){
    if (err) return next(err);
    res.json(chal);
  });
}

// UPDATE
api.update = function(req, res, next){
  var cid = req.params.cid;
  var user = res.locals.user;
  var before;
  async.waterfall([
    function(cb){
      // We first need the original challenge data, since we're going to compare against new & decide to sync users
      Challenge.findById(cid, cb);
    },
    function(_before, cb) {
      if (!_before) return cb('Challenge ' + cid + ' not found');
      if (_before.leader != user._id) return cb("You don't have permissions to edit this challenge");
      // Update the challenge, since syncing will need the updated challenge. But store `before` we're going to do some
      // before-save / after-save comparison to determine if we need to sync to users
      before = _before;
      var attrs = _.pick(req.body, 'name shortName description habits dailys todos rewards date'.split(' '));
      Challenge.findByIdAndUpdate(cid, {$set:attrs}, cb);
    },
    function(saved, cb) {
      // after saving, we're done as far as the client's concerned. We kick of syncing (heavy task) in the background
      cb(null, saved);

      // Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
      if (before.isOutdated(req.body)) {
        User.find({_id: {$in: saved.members}}, function(err, users){
          logging.info('Challenge updated, sync to subscribers');
          if (err) throw err;
          _.each(users, function(user){
            saved.syncToUser(user);
          })
        })
      }

    }
  ], function(err, saved){
    if(err) next(err);
    res.json(saved);
  })
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
      var pull = {'$pull':{}}; pull['$pull'][_removed._id] = 1;
      Group.findByIdAndUpdate(_removed.group, pull);
      User.find({_id:{$in: removed.members}}, cb2);
    },
    function(users, cb2) {
      var parallel = [];
      _.each(users, function(user){
        var tag = _.find(user.tags, {id:cid});
        if (tag) tag.challenge = undefined;
        _.each(user.tasks, function(task){
          if (task.challenge && task.challenge.id == removed._id) {
            _.merge(task.challenge, broken);
          }
        })
        parallel.push(function(cb3){
          user.save(cb3);
        })
      })
      async.parallel(parallel, cb2);
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
      if (chal.leader != user._id) return cb("You don't have permissions to edit this challenge");
      closeChal(req.params.cid, {broken: 'CHALLENGE_DELETED'}, cb);
    }
  ], function(err){
    if (err) return next(err);
    res.send(200);
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
      if (chal.leader != user._id) return cb("You don't have permissions to edit this challenge");
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
      closeChal(cid, {broken: 'CHALLENGE_CLOSED', winner: saved.profile.name}, cb);
    }
  ], function(err){
    if (err) return next(err);
    res.send(200);
  })
}

api.join = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;

  async.waterfall([
    function(cb) {
      Challenge.findByIdAndUpdate(cid, {$addToSet:{members:user._id}}, cb);
    },
    function(chal, cb) {

      // Trigger updating challenge member count in the background. We can't do it above because we don't have
      // _.size(challenge.members). We can't do it in pre(save) because we're calling findByIdAndUpdate above.
      Challenge.update({_id:cid}, {$set:{memberCount:_.size(chal.members)}}).exec();

      if (!~user.challenges.indexOf(cid))
        user.challenges.unshift(cid);
      // Add all challenge's tasks to user's tasks
      chal.syncToUser(user, function(err){
        if (err) return cb(err);
        cb(null, chal); // we want the saved challenge in the return results, due to ng-resource
      });
    }
  ], function(err, chal){
    if(err) return next(err);
    chal._isMember = true;
    res.json(chal);
  });
}


api.leave = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;
  // whether or not to keep challenge's tasks. strictly default to true if "keep-all" isn't provided
  var keep = (/^remove-all/i).test(req.query.keep) ? 'remove-all' : 'keep-all';

  async.waterfall([
    function(cb){
      Challenge.findByIdAndUpdate(cid, {$pull:{members:user._id}}, cb);
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
  });
}
