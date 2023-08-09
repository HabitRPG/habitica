import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { authWithHeaders, authWithSession } from '../../middlewares/auth';
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
import csvStringify from '../../libs/csvStringify';
import {
  createTasks,
} from '../../libs/tasks';

import {
  addUserJoinChallengeNotification,
  getChallengeGroupResponse,
  createChallenge,
  cleanUpTask,
  createChallengeQuery,
} from '../../libs/challenges';
import apiError from '../../libs/apiError';

import common from '../../../common';

const { MAX_SUMMARY_SIZE_FOR_CHALLENGES } = common.constants;

const api = {};

/**
 * @apiDefine ChallengeLeader Challenge Leader
 * The leader of the challenge can use this route.
 */

/**
 * @apiDefine ChallengeNotFound
 * @apiError (404) {NotFound} ChallengeNotFound The specified challenge could not be found.
 */

/**
 * @apiDefine SuccessfulChallengeRequest
 * @apiSuccess {UUID} challenge.group._id The group id.
 * @apiSuccess {String} challenge.group.type Group type: `guild` or `party`.
 * @apiSuccess {String} challenge.group.privacy Group privacy: `public` or `private`.
 * @apiSuccess {String} challenge.name Full name of challenge.
 * @apiSuccess {String} challenge.shortName A shortened name for the challenge, to be used as a tag.
 * @apiSuccess {Object} challenge.leader User details of challenge leader.
 * @apiSuccess {UUID} challenge.leader._id User ID of challenge leader.
 * @apiSuccess {Object} challenge.leader.profile Profile information of leader.
 * @apiSuccess {Object} challenge.leader.profile.name Display Name of leader.
 * @apiSuccess {String} challenge.updatedAt Timestamp of last update.
 * @apiSuccess {String} challenge.createdAt Timestamp of challenge creation.
 * @apiSuccess {UUID} challenge.id Id number of newly created challenge.
 * @apiSuccess {UUID} challenge._id Same as `challenge.id`.
 * @apiSuccess {String} challenge.prize Number of gems offered as prize to winner (can be 0).
 * @apiSuccess {String} challenge.memberCount Number users participating in challenge.
 * @apiSuccess {Object} challenge.tasksOrder Object containing IDs of the challenge's
 *                                           tasks and rewards in their preferred sort order.
 * @apiSuccess {Array} challenge.tasksOrder.rewards Array of `reward` task IDs.
 * @apiSuccess {Array} challenge.tasksOrder.todos Array of `todo` task IDs.
 * @apiSuccess {Array} challenge.tasksOrder.dailys Array of `daily` task IDs.
 * @apiSuccess {Array} challenge.tasksOrder.habits Array of `habit` task IDs.
 * @apiSuccess {Boolean} challenge.official Boolean indicating if
 *                                          this is an official Habitica challenge.
 *
 */

/**
 * @apiDefine ChallengeSuccessExample
 * @apiSuccessExample {json} Successful response with single challenge
 {
   "data": {
     "group": {
      "_id": "group-id-associated-with-challenge",
      "name": "MyGroup",
      "type": "guild",
      "privacy": "public"
     },
     "name": "Long Detailed Name of Challenge",
     "shortName": "my challenge",
     "leader": {
       "_id": "user-id-of-challenge-creator",
       "profile": {
         "name": "MyUserName"
       }
     },
     "updatedAt": "timestamp,
     "createdAt": "timestamp",
     "_id": "challenge-id",
     "prize": 0,
     "memberCount": 1,
     "tasksOrder": {
       "rewards": [
         "uuid-of-challenge-reward"
       ],
       "todos": [
         "uuid-of-challenge-todo"
       ],
       "dailys": [
         "uuid-of-challenge-daily"
       ],
       "habits": [
         "uuid-of-challenge-habit"
       ]
     },
     "official": false,
     "id": "challenge-id"
   }
 }
*/

/**
 * @apiDefine ChallengeArrayExample
 * @apiSuccessExample {json} Successful response with array of challenges
 {
   "data": [{
     "group": {
       "_id": "group-id-associated-with-challenge",
       "name": "MyGroup",
       "type": "guild",
       "privacy": "public"
     },
     "name": "Long Detailed Name of Challenge",
     "shortName": "my challenge",
     "leader": {
       "_id": "user-id-of-challenge-creator",
       "profile": {
         "name": "MyUserName"
       }
     },
     "updatedAt": "timestamp,
     "createdAt": "timestamp",
     "_id": "challenge-id",
     "prize": 0,
     "memberCount": 1,
     "tasksOrder": {
       "rewards": [
         "uuid-of-challenge-reward"
       ],
       "todos": [
         "uuid-of-challenge-todo"
       ],
       "dailys": [
         "uuid-of-challenge-daily"
       ],
       "habits": [
         "uuid-of-challenge-habit"
       ]
     },
     "official": false,
     "id": "challenge-id"
   }]
 }
*/

/**
 * @api {post} /api/v3/challenges Create a new challenge
 * @apiName CreateChallenge
 * @apiGroup Challenge
 * @apiDescription Creates a challenge. Cannot create associated
 * tasks with this route. See <a href="#api-Task-CreateChallengeTasks">CreateChallengeTasks</a>.
 *
 * @apiParam (Body) {Object} challenge An object representing the challenge to be created
 * @apiParam (Body) {UUID} challenge.group The id of the group to which the challenge belongs
 * @apiParam (Body) {String} challenge.name The full name of the challenge
 * @apiParam (Body) {String} challenge.shortName A shortened name for the challenge,
 *                                               to be used as a tag.
 * @apiParam (Body) {String} [challenge.summary] A short summary advertising the main purpose
 *                                               of the challenge; maximum 250 characters;
 *                                               if not supplied, challenge.name will be used.
 * @apiParam (Body) {String} [challenge.description] A detailed description of the challenge
 * @apiParam (Body) {Boolean} [official=false] Whether or not a challenge is an official
 *                                             Habitica challenge (requires admin).
 * @apiParam (Body) {Number} [challenge.prize=0] Number of gems offered as
 *                                               a prize to challenge winner.
 *
 * @apiSuccess (201) {Object} challenge The newly created challenge.
 * @apiUse SuccessfulChallengeRequest
 *
 * @apiUse ChallengeSuccessExample
 *
 * @apiError (401) {NotAuthorized} CantAffordPrize User does not have enough
                                                   gems to offer this prize.
 * @apiError (400) {BadRequest} ChallengeValidationFailed Invalid or missing parameter
                                                          in challenge body.
 *
 * @apiUse GroupNotFound
 * @apiUse UserNotFound
 */
api.createChallenge = {
  method: 'POST',
  url: '/challenges',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody('group', apiError('groupIdRequired')).notEmpty();
    req.checkBody('summary', apiError('summaryLengthExceedsMax')).isLength({ max: MAX_SUMMARY_SIZE_FOR_CHALLENGES });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { savedChal, group } = await createChallenge(user, req, res);

    const response = savedChal.toJSON();
    response.leader = { // the leader is the authenticated user
      _id: user._id,
      profile: { name: user.profile.name },
    };
    response.group = getChallengeGroupResponse(group);

    res.analytics.track('challenge create', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      challengeID: response._id,
      groupID: group._id,
      groupName: group.privacy === 'private' ? null : group.name,
      groupType: group._id === TAVERN_ID ? 'tavern' : group.type,
      prize: response.prize,
      headers: req.headers,
    });

    res.respond(201, response);
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/join Join a challenge
 * @apiName JoinChallenge
 * @apiGroup Challenge
 * @apiParam (Path) {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} challenge The challenge the user joined
 * @apiUse SuccessfulChallengeRequest
 *
 * @apiUse ChallengeNotFound
 * @apiUse UserNotFound
 *
 * @apiUse ChallengeSuccessExample
 */
api.joinChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/join',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const challenge = await Challenge.findOne({ _id: req.params.challengeId }).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    const group = await Group.getGroup({
      user, groupId: challenge.group, fields: `${basicGroupFields} purchased`, optionalMembership: true,
    });
    if (!group || !challenge.canJoin(user, group)) throw new NotFound(res.t('challengeNotFound'));
    group.purchased = undefined;

    const addedSuccessfully = await challenge.addToUser(user);
    if (!addedSuccessfully) {
      throw new NotAuthorized(res.t('userAlreadyInChallenge'));
    }

    challenge.memberCount += 1;

    addUserJoinChallengeNotification(user);

    // Add all challenge's tasks to user's tasks and save the challenge
    const results = await Promise.all([challenge.syncTasksToUser(user), challenge.save()]);

    const response = results[1].toJSON();
    response.group = getChallengeGroupResponse(group);
    const chalLeader = await User.findById(response.leader).select(nameFields).exec();
    response.leader = chalLeader ? chalLeader.toJSON({ minimize: true }) : null;

    res.analytics.track('challenge join', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      challengeID: challenge._id,
      groupID: group._id,
      groupName: group.privacy === 'private' ? null : group.name,
      groupType: group._id === TAVERN_ID ? 'tavern' : group.type,
      headers: req.headers,
    });

    res.respond(200, response);
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/leave Leave a challenge
 * @apiName LeaveChallenge
 * @apiGroup Challenge
 * @apiParam (Path) {UUID} challengeId The challenge _id
 * @apiParam (Body) {String="remove-all","keep-all"} [keep="keep-all"] Whether or not to
 *                                                                     keep or remove the
 *                                                                     challenge's tasks.
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse ChallengeNotFound
 * @apiUse UserNotFound
 */
api.leaveChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/leave',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const keep = req.body.keep === 'remove-all' ? 'remove-all' : 'keep-all';

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const challenge = await Challenge.findOne({ _id: req.params.challengeId }).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    if (!challenge.isMember(user)) throw new NotAuthorized(res.t('challengeMemberNotFound'));

    // Unlink challenge's tasks from user's tasks and save the challenge
    await challenge.unlinkTasks(user, keep);

    res.analytics.track('challenge leave', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      challengeID: challenge._id,
      groupID: challenge.group._id,
      groupName: challenge.group.privacy === 'private' ? null : challenge.group.name,
      groupType: challenge.group._id === TAVERN_ID ? 'tavern' : challenge.group.type,
      headers: req.headers,
    });

    res.respond(200, {});
  },
};

/**
 * @api {get} /api/v3/challenges/user Get challenges for a user
 * @apiName GetUserChallenges
 * @apiGroup Challenge
 * @apiDescription Get challenges the user has access to. Includes public challenges,
 * challenges belonging to the user's group, and challenges the user has already joined.
 * Returns 10 results per page.
 *
 * @apiSuccess {Object[]} challenges An array of challenges sorted with official
 *                                   challenges first, followed by the challenges
 *                                   in order from newest to oldest.
 *
 * @apiParam (Query) {Number} page This parameter can be used to specify the page number
                                   for the user challenges result (the initial page is number 0).
 * @apiParam (Query) {String} [member] If set to `true` it limits results to challenges where the
                                       user is a member.
 * @apiParam (Query) {String} [owned] If set to `owned` it limits results to challenges owned
                                      by the user. If set to `not_owned` it limits results
                                      to challenges not owned by the user.
 * @apiParam (Query) {String} [search] Optional query parameter to filter results to challenges
                                       that include (even partially) the search query parameter
                                       in the name or description.
 * @apiParam (Query) {String} [categories] Optional comma separated list of categories.
                                           If set it limits results to challenges that are part
                                           of the given categories.
 * @apiError (400) {BadRequest} queryPageInteger Page query parameter must be a positive integer
 * @apiUse SuccessfulChallengeRequest
 *
 * @apiUse ChallengeArrayExample
 *
 * @apiUse UserNotFound
 */
api.getUserChallenges = {
  method: 'GET',
  url: '/challenges/user',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkQuery('page').notEmpty().isInt({ min: 0 }, apiError('queryPageInteger'));

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const CHALLENGES_PER_PAGE = 10;
    const { page } = req.query;

    const { user } = res.locals;

    // Challenges the user owns
    const orOptions = [{ leader: user._id }];

    // Challenges where the user is participating
    if (user.challenges.length > 0) {
      orOptions.push({ _id: { $in: user.challenges } });
    }

    // Challenges in groups user is a member of, plus public challenges
    if (!req.query.member) {
      const userGroups = await Group.getGroups({
        user,
        types: ['party', 'guilds', 'tavern'],
      });
      const userGroupIds = userGroups.map(userGroup => userGroup._id);
      orOptions.push({
        group: { $in: userGroupIds },
      });
    }

    const query = {
      $and: [{ $or: orOptions }],
    };

    const { owned } = req.query;
    if (owned) {
      if (owned === 'not_owned') {
        query.$and.push({ leader: { $ne: user._id } });
      }

      if (owned === 'owned') {
        query.$and.push({ leader: user._id });
      }
    }

    if (req.query.search) {
      const searchOr = { $or: [] };
      const searchWords = _.escapeRegExp(req.query.search).split(' ').join('|');
      const searchQuery = { $regex: new RegExp(`${searchWords}`, 'i') };
      searchOr.$or.push({ name: searchQuery });
      searchOr.$or.push({ description: searchQuery });
      query.$and.push(searchOr);
    }

    if (req.query.categories) {
      const categorySlugs = req.query.categories.split(',');
      query.categories = { $elemMatch: { slug: { $in: categorySlugs } } };
    }

    // Ensure that official challenges are always first
    let mongoQuery = createChallengeQuery(query);
    if (page) {
      mongoQuery = mongoQuery
        .skip(CHALLENGES_PER_PAGE * page)
        .limit(CHALLENGES_PER_PAGE);
    }

    // see below why we're not using populate
    // .populate('group', basicGroupFields)
    // .populate('leader', nameFields)
    const challenges = await mongoQuery.exec();

    // Unserialize, then serialize the challenges to fill in default fields
    const resChals = challenges.map(chal => (new Challenge(chal)).toJSON());

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Promise.all(resChals.map((chal, index) => Promise.all([
      User.findById(chal.leader).select(`${nameFields} backer contributor`).exec(),
      Group.findById(chal.group).select(basicGroupFields).exec(),
    ]).then(populatedData => {
      resChals[index].leader = populatedData[0]
        ? populatedData[0].toJSON({ minimize: true })
        : null;
      resChals[index].group = populatedData[1]
        ? populatedData[1].toJSON({ minimize: true })
        : null;
    })));

    res.respond(200, resChals);
  },
};

/**
 * @api {get} /api/v3/challenges/groups/:groupId Get challenges for a group
 * @apiDescription Get challenges hosted in the specified group.
 * @apiName GetGroupChallenges
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted)
 *
 * @apiSuccess {Array} data An array of challenges sorted with official challenges first,
 *                          followed by the challenges in order from newest to oldest.
 *
 * @apiUse SuccessfulChallengeRequest
 * @apiUse ChallengeArrayExample
 * @apiUse UserNotFound
 * @apiUse GroupNotFound
 */
api.getGroupChallenges = {
  method: 'GET',
  url: '/challenges/groups/:groupId',
  middlewares: [authWithHeaders({
    // Some fields (including _id) are always loaded (see middlewares/auth)
    userFieldsToInclude: ['party', 'guilds'], // Some fields are always loaded (see middlewares/auth)
  })],
  async handler (req, res) {
    const { user } = res.locals;
    let { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (groupId === 'party') groupId = user.party._id;
    if (groupId === 'habitrpg') groupId = TAVERN_ID;

    const group = await Group.getGroup({ user, groupId });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const challenges = await createChallengeQuery({ group: groupId })
      // Only populate the leader as the group is implicit // see below why we're not using populate
      // .populate('leader', nameFields)
      .exec();

    const resChals = challenges.map(challenge => (new Challenge(challenge)).toJSON());

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    await Promise.all(resChals.map((chal, index) => User
      .findById(chal.leader)
      .select(nameFields)
      .exec()
      .then(populatedLeader => {
        resChals[index].leader = populatedLeader
          ? populatedLeader.toJSON({ minimize: true })
          : null;
      })));

    res.respond(200, resChals);
  },
};

/**
 * @api {get} /api/v3/challenges/:challengeId Get a challenge
 * @apiName GetChallenge
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The challenge _id
 *
 * @apiSuccess {Object} data The challenge object
 * @apiUse SuccessfulChallengeRequest
*  @apiUse ChallengeSuccessExample
 *
 * @apiUse ChallengeNotFound
 */
api.getChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;

    // Don't populate the group as we'll fetch it manually later
    // .populate('leader', nameFields)
    const challenge = await Challenge.findById(challengeId).exec();

    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    // Fetching basic group data
    const group = await Group.getGroup({
      user, groupId: challenge.group, fields: `${basicGroupFields} purchased`, optionalMembership: true,
    });
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    group.purchased = undefined;

    const chalRes = challenge.toJSON();
    chalRes.group = group.toJSON({ minimize: true });
    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    const chalLeader = await User.findById(chalRes.leader).select(nameFields).exec();
    chalRes.leader = chalLeader ? chalLeader.toJSON({ minimize: true }) : null;

    res.respond(200, chalRes);
  },
};

/**
 * @api {get} /api/v3/challenges/:challengeId/export/csv Export a challenge in CSV
 * @apiName ExportChallengeCsv
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The challenge _id
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

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId).select('_id group leader tasksOrder').exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    const group = await Group.getGroup({
      user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true,
    });
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    // In v2 this used the aggregation framework to run some
    // computation on MongoDB but then iterated through all
    // results on the server so the perf difference isn't that big (hopefully)

    const [members, tasks] = await Promise.all([
      User.find({ challenges: challengeId })
        .select(nameFields)
        .sort({ _id: 1 })
        .lean() // so we don't involve mongoose
        .exec(),

      Tasks.Task.find({
        'challenge.id': challengeId,
        userId: { $exists: true },
      }).sort({ userId: 1, text: 1 })
        .select('userId type text value notes streak')
        .lean()
        .exec(),
    ]);

    let resArray = members
      .map(member => [member._id, member.profile.name, member.auth.local.username]);

    let lastUserId;
    let index = -1;
    tasks.forEach(task => {
      /**
       * Occasional error does not unlink a user's challenge tasks from that challenge's data
       * after the user leaves that challenge, which previously caused a failure when exporting
       * to a CSV. The following if statement makes sure that the task's attached user still
       * belongs to the challenge.
       * See more at https://github.com/HabitRPG/habitica/issues/8350
       */
      if (!resArray.map(line => line[0]).includes(task.userId)) {
        return;
      }
      while (task.userId !== lastUserId) {
        index += 1;
        [lastUserId] = resArray[index]; // resArray[index][0] is an user id
      }

      const streak = task.streak || 0;

      resArray[index].push(`${task.type}:${task.text}`, task.value, task.notes, streak);
    });

    // The first row is going to be UUID name Task Value Notes
    // repeated n times for the n challenge tasks
    const challengeTasks = _.reduce(
      challenge.tasksOrder.toObject(),
      (result, array) => result.concat(array), [],
    ).sort();
    resArray.unshift(['UUID', 'Display Name', 'Username']);

    _.times(challengeTasks.length, () => resArray[0].push('Task', 'Value', 'Notes', 'Streak'));

    // Remove lines for users without tasks info
    resArray = resArray.filter(line => {
      if (line.length === 2) { // only user data ([id, profile name]), no task data
        return false;
      }

      return true;
    });

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${challengeId}.csv`,
    });

    const csvRes = await csvStringify(resArray);
    res.status(200).send(csvRes);
  },
};

/**
 * @api {put} /api/v3/challenges/:challengeId Update a challenge's name, description, or summary
 *
 * @apiName UpdateChallenge
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The challenge _id
 * @apiParam (Body) {String} [challenge.name] The new full name of the challenge.
 * @apiParam (Body) {String} [challenge.summary] The new challenge summary.
 * @apiParam (Body) {String} [challenge.description] The new challenge description.
 *
 * @apiSuccess {Object} data The updated challenge
 * @apiPermission ChallengeLeader
 *
 * @apiUse ChallengeSuccessExample
 *
 * @apiUse ChallengeNotFound
 *
 * @apiError (401) {NotAuthorized} MustBeChallengeLeader Only challenge leader
 * can update the challenge.
 */
api.updateChallenge = {
  method: 'PUT',
  url: '/challenges/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkBody('summary', apiError('summaryLengthExceedsMax')).isLength({ max: MAX_SUMMARY_SIZE_FOR_CHALLENGES });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    const group = await Group.getGroup({
      user, groupId: challenge.group, fields: `${basicGroupFields} purchased`, optionalMembership: true,
    });
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderUpdateChal'));
    group.purchased = undefined;
    _.merge(challenge, Challenge.sanitizeUpdate(req.body));

    const savedChal = await challenge.save();
    const response = savedChal.toJSON();
    response.group = getChallengeGroupResponse(group);
    const chalLeader = await User.findById(response.leader).select(nameFields).exec();
    response.leader = chalLeader ? chalLeader.toJSON({ minimize: true }) : null;
    res.respond(200, response);
  },
};

/**
 * @api {delete} /api/v3/challenges/:challengeId Delete a challenge
 * @apiName DeleteChallenge
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The _id for the challenge to delete
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
    const { user } = res.locals;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const challenge = await Challenge.findOne({ _id: req.params.challengeId }).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    // Close channel in background, some ops are run in the background without `await`ing
    await challenge.closeChal({ broken: 'CHALLENGE_DELETED' });

    res.analytics.track('challenge delete', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      challengeID: challenge._id,
      groupID: challenge.group._id,
      groupName: challenge.group.privacy === 'private' ? null : challenge.group.name,
      groupType: challenge.group._id === TAVERN_ID ? 'tavern' : challenge.group.type,
      prize: challenge.prize,
      headers: req.headers,
    });

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/selectWinner/:winnerId Select winner for challenge
 * @apiName SelectChallengeWinner
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The _id for the challenge to close with a winner
 * @apiParam (Path) {UUID} winnerId The _id of the winning user
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
    const { user } = res.locals;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('winnerId', res.t('winnerIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const challenge = await Challenge.findOne({ _id: req.params.challengeId }).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyLeaderDeleteChal'));

    const winner = await User.findOne({ _id: req.params.winnerId }).exec();
    if (!winner || winner.challenges.indexOf(challenge._id) === -1) throw new NotFound(res.t('winnerNotFound', { userId: req.params.winnerId }));

    // Close channel in background, some ops are run in the background without `await`ing
    await challenge.closeChal({ broken: 'CHALLENGE_CLOSED', winner });

    res.analytics.track('challenge close', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      challengeID: challenge._id,
      challengeWinnerID: winner._id,
      groupID: challenge.group._id,
      groupName: challenge.group.privacy === 'private' ? null : challenge.group.name,
      groupType: challenge.group._id === TAVERN_ID ? 'tavern' : challenge.group.type,
      prize: challenge.prize,
      headers: req.headers,
    });

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/challenges/:challengeId/clone Clone a challenge
 * @apiName CloneChallenge
 * @apiGroup Challenge
 *
 * @apiParam (Path) {UUID} challengeId The _id for the challenge to clone
 *
 * @apiSuccess {Object} challenge The cloned challenge
 *
 * @apiUse ChallengeNotFound
 */
api.cloneChallenge = {
  method: 'POST',
  url: '/challenges/:challengeId/clone',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const challengeToClone = await Challenge.findOne({ _id: req.params.challengeId }).exec();
    if (!challengeToClone) throw new NotFound(res.t('challengeNotFound'));

    const { savedChal } = await createChallenge(user, req, res);

    const challengeTaskIds = [
      ...challengeToClone.tasksOrder.habits,
      ...challengeToClone.tasksOrder.dailys,
      ...challengeToClone.tasksOrder.todos,
      ...challengeToClone.tasksOrder.rewards,
    ];

    const challengeTasks = await Promise.all(challengeTaskIds.map(async taskId => {
      const task = Tasks.Task.findById(taskId).exec();
      return task;
    }));

    // last task should be added first and vice-versa, since new tasks are prepended
    challengeTasks.reverse();

    const tasksToClone = challengeTasks.map(task => {
      const clonedTask = cloneDeep(task.toObject());
      const omittedTask = cleanUpTask(clonedTask);
      return omittedTask;
    });

    const taskRequest = {
      body: tasksToClone,
    };

    const clonedTasks = await createTasks(taskRequest, res, { user, challenge: savedChal });

    res.respond(200, { clonedTasks, clonedChallenge: savedChal });
  },
};

export default api;
