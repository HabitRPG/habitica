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
  basicFields as basicGroupFields,
  TAVERN_ID,
} from '../../models/group';
import {
  model as Challenge,
} from '../../models/challenge';
import * as Tasks from '../../models/task';
var logging = require('./../../libs/api-v2/logging');
var csvStringify = require('csv-stringify');
var utils = require('../../libs/api-v2/utils');
var api = module.exports;
var pushNotify = require('./pushNotifications');
import Q from 'q';
import v3MembersController from '../api-v3/members';
/*
  ------------------------------------------------------------------------
  Challenges
  ------------------------------------------------------------------------
*/

var nameFields = 'profile.name';

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
      return obj;
    });

    // TODO Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Q.all(resChals.map((chal, index) => {
      return Q.all([
        User.findById(chal.leader).select(nameFields).exec(),
        Group.findById(chal.group).select(basicGroupFields).exec(),
      ]).then(populatedData => {
        resChals[index].leader = populatedData[0] ? populatedData[0].toJSON({minimize: true}) : null;
        resChals[index].group = populatedData[1] ? populatedData[1].toJSON({minimize: true}) : null;
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

    let leaderRes = await User.findById(challenge.leader).select('profile.name').exec();
    leaderRes = leaderRes ? leaderRes.toJSON({minimize: true}) : null;

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
  req.params.challengeId = cid;
  v3MembersController.exportChallengeCsv.handler(req, res, next).catch(next);
}

api.getMember = function(req, res, next) {
  var cid = req.params.cid;
  var uid = req.params.uid;

  req.params.memberId = uid;
  req.params.challengeId = cid;
  v3MembersController.getChallengeMemberProgress.handler(req, res, next)
    .then(result => {
      let newResult = {
        profile: {
          name: result.profile.name,
        },
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
      };

      let tasks = result.tasks;
      tasks.forEach(task => {
        let taskObj = task.toJSONV2();
        newResult[taskObj.type + 's'].push(taskObj);
      });

      res.json(newResult);
    })
    .catch(next);
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

    if (group._id === TAVERN_ID && prize < 1) {
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
                  .concat(req.body.dailys).concat(req.body.todos)
                  .map(v2Task => Tasks.Task.fromJSONV2(v2Task));

    chalTasks = chalTasks.map(function(task) {
      var newTask = new Tasks[task.type](Tasks.Task.sanitize(task));
      newTask.challenge.id = challenge._id;
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
          var _beforeClonedTasks = _before.tasks;
          updatedTasks = _.object(_.pluck(_beforeClonedTasks, '_id'), _beforeClonedTasks);
          var newTasks = req.body.habits.concat(req.body.dailys)
                          .concat(req.body.todos).concat(req.body.rewards);

          var newTasksObj = _.object(_.pluck(newTasks, '_id'), newTasks);
          async.forEachOf(newTasksObj, function(newTask, taskId, cb2){
            // some properties can't be changed
            newTask = Tasks.Task.sanitize(newTask);
            // TODO we have to convert task to an object because otherwise things don't get merged correctly. Bad for performances?
            // TODO regarding comment above, make sure other models with nested fields are using this trick too
            _.assign(updatedTasks[taskId], shared.ops.updateTask(updatedTasks[taskId].toObject(), {body: newTask}));
            _before.chal.updateTask(updatedTasks[taskId]).then(cb2).catch(cb2);
          }, cb1);
        }
      }, cb);
    },
  ], function(err, saved){
    if(err) {
      return err.code ? res.json(err.code, err) : next(err);
    }

    saved.chal.getTransformedData({cb: function(err, newChal){
      if(err) return next(err);
      res.json(newChal);
    }})
    cid = user = before = null;
  });
}

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
    await challenge.closeChal({broken: 'CHALLENGE_DELETED'});
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
    if (!challenge) return next('Challenge ' + req.params.cid + ' not found');
    if (!challenge.canModify(res.locals.user)) return next(shared.i18n.t('noPermissionCloseChallenge'));

    let winner = await User.findOne({_id: req.query.uid}).exec();
    if (!winner || winner.challenges.indexOf(challenge._id) === -1) return next('Winner ' + req.query.uid + ' not found.');

    // Close channel in background, some ops are run in the background without `await`ing
    await challenge.closeChal({broken: 'CHALLENGE_CLOSED', winner});
    res.respond(200, {});
  } catch (err) {
    next(err);
  }
}

api.join = async function(req, res, next){
  try {
    var user = res.locals.user;
    var cid = req.params.cid;

    let challenge = await Challenge.findOne({ _id: cid });
    if (!challenge) return next(shared.i18n.t('challengeNotFound'));
    if (challenge.isMember(user)) return next(shared.i18n.t('userAlreadyInChallenge'));

    let group = await Group.getGroup({user, groupId: challenge.group, optionalMembership: true});
    if (!group || !challenge.hasAccess(user, group)) return next(shared.i18n.t('challengeNotFound'));

    challenge.memberCount += 1;

    // Add all challenge's tasks to user's tasks and save the challenge
    await Q.all([challenge.syncToUser(user), challenge.save()]);

    challenge.getTransformedData({
      cb (err, transformedChal) {
        transformedChal._isMember = true;
        res.json(transformedChal);
      }
    });
  } catch (e) {
    next(e);
  }
}

api.leave = async function(req, res, next){
  try {
    var user = res.locals.user;
    var cid = req.params.cid;
    // whether or not to keep challenge's tasks. strictly default to true if "keep-all" isn't provided
    var keep = (/^remove-all/i).test(req.query.keep) ? 'remove-all' : 'keep-all';

    let challenge = await Challenge.findOne({ _id: cid });
    if (!challenge) return next(shared.i18n.t('challengeNotFound'));

    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy'});
    if (!group || !challenge.canView(user, group)) return next(shared.i18n.t('challengeNotFound'));

    if (!challenge.isMember(user)) return next(shared.i18n.t('challengeMemberNotFound'));

    challenge.memberCount -= 1;

    // Unlink challenge's tasks from user's tasks and save the challenge
    await Q.all([challenge.unlinkTasks(user, keep), challenge.save()]);

    challenge.getTransformedData({
      cb (err, transformedChal) {
        transformedChal._isMember = false;
        res.json(transformedChal);
      }
    });
  } catch (e) {
    next(e);
  }
}

import { removeFromArray } from '../../libs/api-v3/collectionManipulators';

api.unlink = async function(req, res, next) {
  try {
    var user = res.locals.user;
    var tid = req.params.id;
    var cid;
    if (!req.query.keep)
      return res.status(400).json({err: 'Provide unlink method as ?keep=keep-all (keep, keep-all, remove, remove-all)'});

    let keep = req.query.keep;
    let task = await Tasks.Task.findOne({
      _id: tid,
      userId: user._id,
    }).exec();

    if (!task) return next(shared.i18n.t('taskNotFound'));
    if (!task.challenge.id) return next(shared.i18n.t('cantOnlyUnlinkChalTask'));

    cid = task.challenge.id;
    if (keep === 'keep') {
      task.challenge = {};
      await task.save();
    } else { // remove
      if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
        removeFromArray(user.tasksOrder[`${task.type}s`], tid);
        await Q.all([user.save(), task.remove()]);
      } else {
        await task.remove();
      }
    }

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}
