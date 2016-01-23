import { authWithHeaders } from '../../middlewares/api-v3/auth';
import _ from 'lodash';
import cron from '../../middlewares/api-v3/cron';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import shared from '../../../../common';
import * as Tasks from '../../models/task';
import { txnEmail } from '../../libs/api-v3/email';
import pushNotify from '../../libs/api-v3/pushNotifications';
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
api.createChallenge = {
  method: 'POST',
  url: '/challenges',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.body.groupId;
    let prize = req.body.prize;

    let group = await Group.getGroup({user, groupId, fields: '-chat', mustBeMember: true});
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (!group.isMember(user)) throw new NotAuthorized(res.t('mustBeGroupMember'));

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

    group.challengeCount += 1;

    req.body.leader = user._id;
    req.body.official = user.contributor.admin && req.body.official;
    let challenge = new Challenge(Challenge.sanitize(req.body));

    // First validate challenge so we don't save group if it's invalid (only runs sync validators)
    let challengeValidationErrors = challenge.validateSync();
    if (challengeValidationErrors) throw challengeValidationErrors;

    let results = await Q.all([challenge.save({
      validateBeforeSave: false, // already validate
    }), group.save()]);

    let savedChal = results[0];
    await savedChal.syncToUser(user); // (it also saves the user)
    res.respond(201, savedChal);
  },
};

/**
 * @api {post} /challenges/:challengeId/join Joins a challenge
 * @apiVersion 3.0.0
 * @apiName JoinChallenge
 * @apiGroup Challenge
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {object} challenge The challenge the user joined
 */
api.joinChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/join',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({ _id: req.params.challengeId });
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    if (!challenge.hasAccess(user)) throw new NotFound(res.t('challengeNotFound'));

    if (_.contains(user.challenges, challenge._id)) throw new NotAuthorized(res.t('userAlreadyInChallenge'));

    challenge.memberCount += 1;

    // Add all challenge's tasks to user's tasks and save the challenge
    await Q.all([challenge.syncToUser(user), challenge.save()]);
    res.respond(200, challenge);
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
  async handler (req, res) {
    let user = res.locals.user;

    let groups = user.guilds.slice(0); // slice is used to clone the array so we don't modify it directly
    if (user.party._id) groups.push(user.party._id);
    groups.push('habitrpg'); // tavern challenges

    let challenges = await Challenge.find({
      $or: [
        {_id: {$in: user.challenges}}, // Challenges where the user is participating
        {groupId: {$in: groups}}, // Challenges in groups where I'm a member
        {leader: user._id}, // Challenges where I'm the leader
      ],
      _id: {$ne: '95533e05-1ff9-4e46-970b-d77219f199e9'}, // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug TODO revisit
    })
    .sort('-official -timestamp')
    // TODO populate
    // .populate('group', '_id name type')
    // .populate('leader', 'profile.name')
    .exec();

    res.respond(200, challenges);
  },
};

/**
 * @api {get} /challenges/:challengeId Get a challenge given its id
 * @apiVersion 3.0.0
 * @apiName GetChallenge
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {object} challenge The challenge object
 */
api.getChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    let group = await Group.getGroup({user, groupId: challenge.groupId, fields: '_id type privacy'});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    res.respond(200, challenge);
  },
};

// TODO everything here should be moved to a worker
// actually even for a worker it's probably just to big and will kill mongo
function _closeChal (challenge, broken = {}) {
  let winner = broken.winner;
  let brokenReason = broken.broken;

  let tasks = [
    // Delete the challenge
    Challenge.remove({_id: challenge._id}).exec(),
    // And it's tasks
    Tasks.Task.remove({'challenge.id': challenge._id, userId: {$exists: false}}).exec(),
    // Set the challenge tag to non-challenge status and remove the challenge from the user's challenges
    User.update({
      challenges: challenge._id,
      'tags._id': challenge._id,
    }, {
      $set: {'tags.$.challenge': false},
      $pull: {challenges: challenge._id},
    }, {multi: true}).exec(),
    // Break users' tasks
    Tasks.Task.update({
      'challenge.id': challenge._id,
    }, {
      $set: {
        'challenge.broken': brokenReason,
        'challenge.winner': winner && winner.profile.name,
      },
    }, {multi: true}).exec(),
    // Update the challengeCount on the group
    Group.update({_id: challenge.groupId}, {$inc: {challengeCount: -1}}).exec(),
  ];

  // Refund the leader if the challenge is closed and the group not the tavern
  if (challenge.groupId !== 'habitrpg' && brokenReason === 'CHALLENGE_DELETED') {
    tasks.push(User.update({_id: challenge.leader}, {$inc: {balance: challenge.prize / 4}}).exec());
  }

  // Award prize to winner and notify
  if (winner) {
    winner.achievements.challenges.push(challenge.name);
    winner.balance += challenge.prize / 4;
    tasks.push(winner.save().then(savedWinner => {
      if (savedWinner.preferences.emailNotifications.wonChallenge !== false) {
        txnEmail(savedWinner, 'won-challenge', [
          {name: 'CHALLENGE_NAME', content: challenge.name},
        ]);
      }

      pushNotify.sendNotify(savedWinner, shared.i18n.t('wonChallenge'), challenge.name); // TODO translate
    }));
  }

  return Q.allSettled(tasks); // TODO look if allSettled could be useful somewhere else
  // TODO catch and handle
}

/**
 * @api {delete} /challenges/:challengeId Delete a challenge
 * @apiVersion 3.0.0
 * @apiName DeleteChallenge
 * @apiGroup Challenge
 *
 * @apiSuccess {object} empty An empty object
 */
api.deleteChallenge = {
  method: 'DELETE',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challenge', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({_id: req.params.challengeId}).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    res.respond(200, {});
    // Close channel in background
    _closeChal(challenge, {broken: 'CHALLENGE_DELETED'});
  },
};

/**
 * @api {delete} /challenges/:challengeId Delete a challenge
 * @apiVersion 3.0.0
 * @apiName DeleteChallenge
 * @apiGroup Challenge
 *
 * @apiSuccess {object} empty An empty object
 */
api.selectChallengeWinner = {
  method: 'POST',
  url: '/challenges/:challengeId/selectWinner/:winnerId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challenge', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('winnerId', res.t('winnerIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({_id: req.params.challengeId}).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    let winner = await User.findOne({_id: req.params.winnerId}).exec();
    if (!winner || winner.challenges.indexOf(challenge._id) === -1) throw new NotFound(res.t('winnerNotFound', {userId: req.parama.winnerId}));

    res.respond(200, {});
    // Close channel in background
    _closeChal(challenge, {broken: 'CHALLENGE_DELETED', winner});
  },
};

export default api;
