import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as Tasks from './task';
import Q from 'q';

let api = {};

/**
 * @api {post} /challenges Create a new challenge
 * @apiVersion 3.0.0
 * @apiName CreateChallenge
 * @apiGroup Challenge
 *
 * @apiSuccess {object} challenge The newly created challenge
 */
api.getChallenges = {
  method: 'POST',
  url: '/challenges',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkBody('group', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let groupId = req.body.group;
    let prize = req.body.prize;

    Group.getGroup(user, groupId, '-chat')
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      if (group.leaderOnly && group.leaderOnly.challenges && group.leader !== user._id) {
        throw new NotAuthorized(res.t('onlyGroupLeaderChal'));
      }

      if (groupId === 'habitrpg' && prize < 1) {
        throw new NotAuthorized(res.t('pubChalsMinPrize'));
      }

      if (prize > 0) {
        let groupBalance = group.balance && group.leader === user._id ? group.balance : 0;
        let prizeCost = prize / 4;

        if (prizeCost > user.balance + groupBalance) {
          throw new NotAuthorized(res.t('cantAfford'));
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

      let tasks = req.body.tasks || []; // TODO validate
      req.body.leader = user._id;
      req.body.official = user.contributor.admin && req.body.official;
      let challenge = new Challenge(Challenge.sanitize(req.body));

      let toSave = tasks.map(tasks, taskToCreate => {
        // TODO validate type
        let task = new Tasks[taskToCreate.type](Tasks.Task.sanitizeCreate(taskToCreate));
        task.challenge.id = challenge._id;
        challenge.tasksOrder[`${task.type}s`].push(task._id);
        return task.save();
      });


      toSave.unshift(challenge, group);
      return Q.all(toSave);
    })
    .then(results => {
      let savedChal = results[0];

      user.challenges.push(savedChal._id); // TODO save user only after group created, so that we can account for failed validation. Revisit in other places
      return savedChal.syncToUser(user) // (it also saves the user)
        .then(() => res.respond(201, savedChal));
    })
    .catch(next);
  },
};

/**
 * @api {get} /challenges Get challenges for a user
 * @apiVersion 3.0.0
 * @apiName GetChallenges
 * @apiGroup Challenge
 *
 * @apiSuccess {Array} challenges An array of challenges
 */
api.getChallenges = {
  method: 'GET',
  url: '/challenges',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;

    let groups = user.guilds || [];
    if (user.party._id) groups.push(user.party._id);
    groups.push('habitrpg'); // Public challenges

    Challenge.find({
      $or: [
        {_id: {$in: user.challenges}}, // Challenges where the user is participating
        {group: {$in: groups}}, // Challenges in groups where I'm a member
        {leader: user._id}, // Challenges where I'm the leader
      ],
      _id: {$ne: '95533e05-1ff9-4e46-970b-d77219f199e9'}, // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug TODO revisit
    })
    .sort('-official -timestamp')
    // TODO populate
    // .populate('group', '_id name type')
    // .populate('leader', 'profile.name')
    .exec()
    .then(challenges => {
      res.respond(200, challenges);
    })
    .catch(next);
  },
};

export default api;
