import { authWithHeaders, authWithSession } from '../../middlewares/auth';
import _ from 'lodash';
import { model as Challenge } from '../../models/challenge';
import {
  model as Group,
  basicFields as basicGroupFields,
  TAVERN_ID,
} from '../../models/group';
import {
  model as User,
  nameFields,
} from '../../models/user';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/errors';
import * as Tasks from '../../models/task';
import Bluebird from 'bluebird';
import csvStringify from '../../libs/csvStringify';

let api = {};

/**
 * @apiDefine ChallengeNotFound
 * @apiError (404) {NotFound} ChallengeNotFound The specified challenge could not be found.
 */

/**
 * @api {post} /api/v3/challenges Create a new challenge
 * @apiName CreateChallenge
 * @apiGroup Challenge
 *
 * @apiSuccess {Object} data The newly created challenge
 *
 * @apiUse GroupNotFound
 */
api.createChallenge = {
  method: 'POST',
  url: '/challenges',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('group', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.body.group;
    let prize = req.body.prize;

    let group = await Group.getGroup({user, groupId, fields: '-chat', mustBeMember: true});
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (!group.isMember(user)) throw new NotAuthorized(res.t('mustBeGroupMember'));

    if (group.leaderOnly && group.leaderOnly.challenges && group.leader !== user._id) {
      throw new NotAuthorized(res.t('onlyGroupLeaderChal'));
    }

    if (group._id === TAVERN_ID && prize < 1) {
      throw new NotAuthorized(res.t('tavChalsMinPrize'));
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
    req.body.official = user.contributor.admin && req.body.official ? true : false;
    let challenge = new Challenge(Challenge.sanitize(req.body));

    // First validate challenge so we don't save group if it's invalid (only runs sync validators)
    let challengeValidationErrors = challenge.validateSync();
    if (challengeValidationErrors) throw challengeValidationErrors;

    let results = await Bluebird.all([challenge.save({
      validateBeforeSave: false, // already validate
    }), group.save()]);
    let savedChal = results[0];

    await savedChal.syncToUser(user); // (it also saves the user)

    let response = savedChal.toJSON();
    response.leader = { // the leader is the authenticated user
      _id: user._id,
      profile: {name: user.profile.name},
    };
    response.group = { // we already have the group data
      _id: group._id,
      name: group.name,
      type: group.type,
      privacy: group.privacy,
    };

    res.respond(201, response);
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/join Join a challenge
 * @apiName JoinChallenge
 * @apiGroup Challenge
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} data The challenge the user joined
 *
 * @apiUse ChallengeNotFound
 */
api.joinChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/join',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({ _id: req.params.challengeId });
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (challenge.isMember(user)) throw new NotAuthorized(res.t('userAlreadyInChallenge'));

    let group = await Group.getGroup({user, groupId: challenge.group, fields: basicGroupFields, optionalMembership: true});
    if (!group || !challenge.hasAccess(user, group)) throw new NotFound(res.t('challengeNotFound'));

    challenge.memberCount += 1;

    // Add all challenge's tasks to user's tasks and save the challenge
    let results = await Bluebird.all([challenge.syncToUser(user), challenge.save()]);

    let response = results[1].toJSON();
    response.group = { // we already have the group data
      _id: group._id,
      name: group.name,
      type: group.type,
      privacy: group.privacy,
    };
    let chalLeader = await User.findById(response.leader).select(nameFields).exec();
    response.leader = chalLeader ? chalLeader.toJSON({minimize: true}) : null;

    res.respond(200, response);
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/leave Leave a challenge
 * @apiName LeaveChallenge
 * @apiGroup Challenge
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse ChallengeNotFound
 */
api.leaveChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/leave',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let keep = req.body.keep === 'remove-all' ? 'remove-all' : 'keep-all';

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({ _id: req.params.challengeId });
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy'});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    if (!challenge.isMember(user)) throw new NotAuthorized(res.t('challengeMemberNotFound'));

    challenge.memberCount -= 1;

    // Unlink challenge's tasks from user's tasks and save the challenge
    await Bluebird.all([challenge.unlinkTasks(user, keep), challenge.save()]);
    res.respond(200, {});
  },
};

/**
 * @api {get} /api/v3/challenges/user Get challenges for a user
 * @apiName GetUserChallenges
 * @apiGroup Challenge
 *
 * @apiSuccess {Array} data An array of challenges sorted with official challenges first, followed by the challenges in order from newest to oldest
 */
api.getUserChallenges = {
  method: 'GET',
  url: '/challenges/user',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let challenges = await Challenge.find({
      $or: [
        {_id: {$in: user.challenges}}, // Challenges where the user is participating
        {group: {$in: user.getGroups()}}, // Challenges in groups where I'm a member
        {leader: user._id}, // Challenges where I'm the leader
      ],
    })
    .sort('-official -createdAt')
    // see below why we're not using populate
    // .populate('group', basicGroupFields)
    // .populate('leader', nameFields)
    .exec();

    let resChals = challenges.map(challenge => challenge.toJSON());
    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Bluebird.all(resChals.map((chal, index) => {
      return Bluebird.all([
        User.findById(chal.leader).select(nameFields).exec(),
        Group.findById(chal.group).select(basicGroupFields).exec(),
      ]).then(populatedData => {
        resChals[index].leader = populatedData[0] ? populatedData[0].toJSON({minimize: true}) : null;
        resChals[index].group = populatedData[1] ? populatedData[1].toJSON({minimize: true}) : null;
      });
    }));

    res.respond(200, resChals);
  },
};

/**
 * @api {get} /api/v3/challenges/group/:groupId Get challenges for a group
 * @apiDescription Get challenges that the user is a member, public challenges and the ones from the user's groups.
 * @apiName GetGroupChallenges
 * @apiGroup Challenge
 *
 * @apiParam {UUID} groupId The group _id
 *
 * @apiSuccess {Array} data An array of challenges sorted with official challenges first, followed by the challenges in order from newest to oldest
 *
 * @apiUse GroupNotFound
 */
api.getGroupChallenges = {
  method: 'GET',
  url: '/challenges/groups/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let challenges = await Challenge.find({group: groupId})
      .sort('-official -createdAt')
      // .populate('leader', nameFields) // Only populate the leader as the group is implicit
      .exec();

    let resChals = challenges.map(challenge => challenge.toJSON());
    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Bluebird.all(resChals.map((chal, index) => {
      return User.findById(chal.leader).select(nameFields).exec().then(populatedLeader => {
        resChals[index].leader = populatedLeader ? populatedLeader.toJSON({minimize: true}) : null;
      });
    }));

    res.respond(200, resChals);
  },
};

/**
 * @api {get} /api/v3/challenges/:challengeId Get a challenge given its id
 * @apiName GetChallenge
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} data The challenge object
 *
 * @apiUse ChallengeNotFound
 */
api.getChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findById(challengeId)
      // Don't populate the group as we'll fetch it manually later
      // .populate('leader', nameFields)
      .exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    // Fetching basic group data
    let group = await Group.getGroup({user, groupId: challenge.group, fields: basicGroupFields, optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    let chalRes = challenge.toJSON();
    chalRes.group = group.toJSON({minimize: true});
    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    let chalLeader = await User.findById(chalRes.leader).select(nameFields).exec();
    chalRes.leader = chalLeader ? chalLeader.toJSON({minimize: true}) : null;

    res.respond(200, chalRes);
  },
};

/**
 * @api {get} /api/v3/challenges/:challengeId/export/csv Export a challenge in CSV
 * @apiName ExportChallengeCsv
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {String} challenge A csv file
 *
 * @apiUse ChallengeNotFound
 */
api.exportChallengeCsv = {
  method: 'GET',
  url: '/challenges/:challengeId/export/csv',
  middlewares: [authWithSession],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findById(challengeId).select('_id group leader tasksOrder').exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    // In v2 this used the aggregation framework to run some computation on MongoDB but then iterated through all
    // results on the server so the perf difference isn't that big (hopefully)

    let [members, tasks] = await Bluebird.all([
      User.find({challenges: challengeId})
        .select(nameFields)
        .sort({_id: 1})
        .lean() // so we don't involve mongoose
        .exec(),

      Tasks.Task.find({'challenge.id': challengeId, userId: {$exists: true}})
        .sort({userId: 1, text: 1}).select('userId type text value notes').lean().exec(),
    ]);

    let resArray = members.map(member => [member._id, member.profile.name]);

    // We assume every user in the challenge as at least some data so we can say that members[0] tasks will be at tasks [0]
    let lastUserId;
    let index = -1;
    tasks.forEach(task => {
      if (task.userId !== lastUserId) {
        lastUserId = task.userId;
        index++;
      }

      resArray[index].push(`${task.type}:${task.text}`, task.value, task.notes);
    });

    // The first row is going to be UUID name Task Value Notes repeated n times for the n challenge tasks
    let challengeTasks = _.reduce(challenge.tasksOrder.toObject(), (result, array) => {
      return result.concat(array);
    }, []).sort();
    resArray.unshift(['UUID', 'name']);
    _.times(challengeTasks.length, () => resArray[0].push('Task', 'Value', 'Notes'));

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${challengeId}.csv`,
    });

    let csvRes = await csvStringify(resArray);
    res.status(200).send(csvRes);
  },
};

/**
 * @api {put} /api/v3/challenges/:challengeId Update a challenge
 * @apiName UpdateChallenge
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} data The updated challenge
 *
 * @apiUse ChallengeNotFound
 */
api.updateChallenge = {
  method: 'PUT',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    let group = await Group.getGroup({user, groupId: challenge.group, fields: basicGroupFields, optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderUpdateChal'));

    _.merge(challenge, Challenge.sanitizeUpdate(req.body));

    let savedChal = await challenge.save();
    let response = savedChal.toJSON();
    response.group = { // we already have the group data
      _id: group._id,
      name: group.name,
      type: group.type,
      privacy: group.privacy,
    };
    let chalLeader = await User.findById(response.leader).select(nameFields).exec();
    response.leader = chalLeader ? chalLeader.toJSON({minimize: true}) : null;
    res.respond(200, response);
  },
};

/**
 * @api {delete} /api/v3/challenges/:challengeId Delete a challenge
 * @apiName DeleteChallenge
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The _id for the challenge to delete
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse ChallengeNotFound
 */
api.deleteChallenge = {
  method: 'DELETE',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({_id: req.params.challengeId}).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    // Close channel in background, some ops are run in the background without `await`ing
    await challenge.closeChal({broken: 'CHALLENGE_DELETED'});
    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/selectWinner/:winnerId Select winner for challenge
 * @apiName SelectChallengeWinner
 * @apiGroup Challenge
 *
 * @apiParam {UUID} challengeId The _id for the challenge to close with a winner
 * @apiParam {UUID} winnerId The _id of the winning user
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse ChallengeNotFound
 */
api.selectChallengeWinner = {
  method: 'POST',
  url: '/challenges/:challengeId/selectWinner/:winnerId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('winnerId', res.t('winnerIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let challenge = await Challenge.findOne({_id: req.params.challengeId}).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    let winner = await User.findOne({_id: req.params.winnerId}).exec();
    if (!winner || winner.challenges.indexOf(challenge._id) === -1) throw new NotFound(res.t('winnerNotFound', {userId: req.params.winnerId}));

    // Close channel in background, some ops are run in the background without `await`ing
    await challenge.closeChal({broken: 'CHALLENGE_CLOSED', winner});
    res.respond(200, {});
  },
};

module.exports = api;
