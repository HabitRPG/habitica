// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('../../../../common');
import {
  model as User,
} from '../../models/user';
import {
  model as Group,
} from '../../models/group';
import {
  model as Challenge,
} from '../../models/challenge';
var logging = require('./../../libs/api-v2/logging');
var csvStringify = require('csv-stringify');
var utils = require('../../libs/api-v2/utils');
var api = module.exports;
var pushNotify = require('./pushNotifications');
import Q from 'q';

/*
  ------------------------------------------------------------------------
  Challenges
  ------------------------------------------------------------------------
*/

api.list = async function(req, res, next) {
  try {
    var user = res.locals.user;

    let challenges = await Challenge.find({
      $or: [
        {_id: {$in: user.challenges}}, // Challenges where the user is participating
        {group: {$in: user.getGroups()}}, // Challenges in groups where I'm a member
        {leader: user._id}, // Challenges where I'm the leader
      ],
      _id: {$ne: '95533e05-1ff9-4e46-970b-d77219f199e9'}, // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug TODO revisit
    })
    .sort('-official -timestamp')
    // .populate('group', basicGroupFields)
    // .populate('leader', nameFields)
    .exec();

    let resChals = challenges.map(challenge => {
      let obj = challenge.toJSON();

      obj._isMember = user.challenges.indexOf(challenge._id) !== -1;
    });
    // TODO Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Q.all(resChals.map((chal, index) => {
      return Q.all([
        User.findById(chal.leader).select(nameFields).exec(),
        Group.findById(chal.group).select(basicGroupFields).exec(),
      ]).then(populatedData => {
        resChals[index].leader = populatedData[0].toJSON({minimize: true});
        resChals[index].group = populatedData[1].toJSON({minimize: true});
      });
    }));

    res.json(resChals);
  } catch (err) {
    next(err);
  }
}

// GET
api.get = async function(req, res, next) {
  try {
    let user = res.locals.user;
    let challengeId = req.params.cid;

    let challenge = await Challenge.findById(challengeId)
      // Don't populate the group as we'll fetch it manually later
      // .populate('leader', nameFields)
      .exec();
    if (!challenge) return res.status(404).json({err: 'Challenge ' + req.params.cid + ' not found'});

    // Fetching basic group data
    let group = await Group.getGroup({user, groupId: challenge.group, optionalMembership: true});
    if (!group || !challenge.canView(user, group)) return res.status(404).json({err: 'Challenge ' + req.params.cid + ' not found'});

    let leaderRes = (await User.findById(challenge.leader).select('profile.name').exec()).toJSON({minimize: true});

    challenge.getTransformedData({
      populateMembers: 'profile.name',
      cb (err, transformedChal) {
        transformedChal.group = group.toJSON({minimize: true});
        transformedChal.leader = leaderRes;
        transformedChal._isMember = user.challenges.indexOf(transformedChal._id) !== -1;
        res.json(transformedChal);
      }
    });
  } catch (err) {
    next(err);
  }
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
      User.aggregate([
        {$match:{'_id':{ '$in': challenge.members}}}, //yes, we want members
        {$project:{'profile.name':1,tasks:{$setUnion:["$habits","$dailys","$todos","$rewards"]}}},
          {$unwind:"$tasks"},
           {$match:{"tasks.challenge.id":cid}},
           {$sort:{'tasks.type':1,'tasks.id':1}},
           {$group:{_id:"$_id", "tasks":{$push:"$tasks"},"name":{$first:"$profile.name"}}}
      ], cb);
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
      var uData = [u._id,u.name];
      _.each(u.tasks,function(t){
        uData = uData.concat([t.type+':'+t.text, t.value, t.notes]);
      })
      output.push(uData);
    });

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${cid}.csv`,
    });

    csvStringify(output, (err, csv) => {
      if (err) return next(err);
      res.status(200).send(csv);
      challenge = cid = null;
    });
  })
}

api.getMember = function(req, res, next) {
  var cid = req.params.cid;
  var uid = req.params.uid;

  // We need to start using the aggregation framework instead of in-app filtering, see http://docs.mongodb.org/manual/aggregation/
  // See code at 32c0e75 for unwind/group example

  //http://stackoverflow.com/questions/24027213/how-to-match-multiple-array-elements-without-using-unwind
  var proj = {'profile.name':'$profile.name'};
  _.each(['habits','dailys','todos','rewards'], function(type){
    proj[type] = {
      $setDifference: [{
        $map: {
          input: '$'+type,
          as: "el",
          in: {
            $cond: [{$eq: ["$$el.challenge.id", cid]}, '$$el', false]
          }
        }
      }, [false]]
    }
  });
  User.aggregate()
  .match({_id: uid})
  .project(proj)
  .exec(function(err, member){
    if (err) return next(err);
    if (!member) return res.status(404).json({err: 'Member '+uid+' for challenge '+cid+' not found'});
    res.json(member[0]);
    uid = cid = null;
  });
}

// CREATE
api.create = async function(req, res, next){
  try {
    var user = res.locals.user;

    let groupId = req.body.group;
    let prize = req.body.prize;

    let group = await Group.getGroup({user, groupId, fields: '-chat', mustBeMember: true});
    if (!group) return res.status(404).json({err:"Group." + req.body.group + " not found"});
    if (!group.isMember(user)) return res.status(404).json({err:"Group." + req.body.group + " not found"});

    if (group.leaderOnly && group.leaderOnly.challenges && group.leader !== user._id) {
      return res.status(401).json({err:"Only the group leader can create challenges"});
    }

    if (groupId === 'habitrpg' && prize < 1) {
      return res.status(401).json({err: 'Prize must be at least 1 Gem for public challenges.'})
    }

    if (prize > 0) {
      let groupBalance = group.balance && group.leader === user._id ? group.balance : 0;
      let prizeCost = prize / 4;

      if (prizeCost > user.balance + groupBalance) {
        return res.status(401).json({err: 'You can\'t afford this prize. Purchase more gems or lower the prize amount.'});
      }

      if (groupBalance >= prizeCost) {
        // Group pays for all of prize
        group.balance -= prizeCost;
      } else if (groupBalance > 0) {
        // User pays remainder of prize cost after group
        let remainder = prizeCost - group.balance;
        group.balance = 0;
        user.balance -= remainder;
      } else {
        // User pays for all of prize
        user.balance -= prizeCost;
      }
    }

    group.challengeCount += 1;

    req.body.leader = user._id;
    req.body.official = user.contributor.admin && req.body.official;
    let challenge = new Challenge(Challenge.sanitize(req.body));

    // First validate challenge so we don't save group if it's invalid (only runs sync validators)
    let challengeValidationErrors = challenge.validateSync();
    if (challengeValidationErrors) throw challengeValidationErrors;

    req.body.habits = req.body.habits || [];
    req.body.todos = req.body.todos || [];
    req.body.dailys = req.body.dailys || [];
    req.body.rewards = req.body.rewards || [];

    var chalTasks = req.body.habits.concat(req.body.rewards)
                  .concat(req.body.dailys).concat(req.body.todos);

    chalTasks = tasks.map(function(task) {
      var newTask = new Tasks[task.type](Tasks.Task.sanitizeCreate(task));
      newTask.challenge.id = chal._id;
      return newTask.save();
    });

    let results = await Q.all([challenge.save({
      validateBeforeSave: false, // already validated
    }), group.save()].concat(chalTasks));
    let savedChal = results[0];

    await savedChal.syncToUser(user); // (it also saves the user)

    savedChal.getTransformedData({
      cb (err, transformedChal) {
        res.status(201).json(transformedChal);
      },
    });
  } catch (err) {
    next(err);
  }
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
      if (_before.leader != user._id && !user.contributor.admin) return cb(shared.i18n.t('noPermissionEditChallenge', req.language));
      // Update the challenge, since syncing will need the updated challenge. But store `before` we're going to do some
      // before-save / after-save comparison to determine if we need to sync to users
      before = _before;
      var attrs = _.pick(req.body, 'name shortName description habits dailys todos rewards date'.split(' '));
      Challenge.findByIdAndUpdate(cid, {$set:attrs}, {new: true}, cb);
    },
    function(saved, cb) {

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

      // after saving, we're done as far as the client's concerned. We kick off syncing (heavy task) in the background
      cb(null, saved);
    }
  ], function(err, saved){
    if(err) next(err);
    res.json(saved);
    cid = user = before = null;
  })
}

import { _closeChal } from '../api-v3/challenges';

/**
 * Delete & close
 */
api.delete = async function(req, res, next){
  try {
    var user = res.locals.user;
    var cid = req.params.cid;

    let challenge = await Challenge.findOne({_id: req.params.cid}).exec();
    if (!challenge) return next('Challenge ' + cid + ' not found');
    if (!challenge.canModify(user)) return next(shared.i18n.t('noPermissionCloseChallenge'));

    // Close channel in background, some ops are run in the background without `await`ing
    await _closeChal(challenge, {broken: 'CHALLENGE_DELETED'});
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

/**
 * Select Winner & Close
 */
api.selectWinner = async function(req, res, next) {
  try {
    if (!req.query.uid) return res.status(401).json({err: 'Must select a winner'});

    let challenge = await Challenge.findOne({_id: req.params.cid}).exec();
    if (!challenge) return next('Challenge ' + cid + ' not found');
    if (!challenge.canModify(user)) return next(shared.i18n.t('noPermissionCloseChallenge'));

    let winner = await User.findOne({_id: req.params.uid}).exec();
    if (!winner || winner.challenges.indexOf(challenge._id) === -1) return next('Winner ' + req.query.uid + ' not found.');

    // Close channel in background, some ops are run in the background without `await`ing
    await _closeChal(challenge, {broken: 'CHALLENGE_CLOSED', winner});
    res.respond(200, {});
  } catch (err) {
    next(err);
  }
}

api.join = function(req, res, next){
  var user = res.locals.user;
  var cid = req.params.cid;

  async.waterfall([
    function(cb) {
      Challenge.findByIdAndUpdate(cid, {$addToSet:{members:user._id}}, {new: true}, cb);
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
    return res.status(400).json({err: 'Provide unlink method as ?keep=keep-all (keep, keep-all, remove, remove-all)'});
  user.unlink({cid:cid, keep:req.query.keep, tid:tid}, function(err, saved){
    if (err) return next(err);
    res.sendStatus(200);
    user = tid = cid = null;
  });
}
