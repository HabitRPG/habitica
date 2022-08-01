import escapeRegExp from 'lodash/escapeRegExp';
import { authWithHeaders } from '../../middlewares/auth';
import {
  model as User,
  publicFields as memberFields,
  nameFields,
} from '../../models/user';
import {
  KNOWN_INTERACTIONS,
} from '../../models/user/methods';
import { model as Group } from '../../models/group';
import { model as Challenge } from '../../models/challenge';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/errors';
import * as Tasks from '../../models/task';
import {
  getUserInfo,
  sendTxn as sendTxnEmail,
} from '../../libs/email';
import { sendNotification as sendPushNotification } from '../../libs/pushNotifications';
import common from '../../../common';
import { sentMessage } from '../../libs/inbox';
import {
  sanitizeText as sanitizeMessageText,
} from '../../models/message';
import highlightMentions from '../../libs/highlightMentions';
import { handleGetMembersForChallenge } from '../../libs/challenges/handleGetMembersForChallenge';

const { achievements } = common;

const api = {};

/**
 * @api {get} /api/v3/members/:memberId Get a member profile
 * @apiName GetMember
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The member object
 *
 * @apiSuccess {Object} data.inbox Basic information about person's inbox
 * @apiSuccess {Object} data.stats Includes current stats and buffs
 * @apiSuccess {Object} data.profile Includes name
 * @apiSuccess {Object} data.preferences Includes info about appearance and public prefs
 * @apiSuccess {Object} data.party Includes basic info about current party and quests
 * @apiSuccess {Object} data.items Basic inventory information includes quests,
 *                                 food, potions, eggs, gear, special items
 * @apiSuccess {Object} data.achievements Lists current achievements
 * @apiSuccess {Object} data.auth Includes latest timestamps
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "success": true,
 *  "data": {
 *    "_id": "99999999-9999-9999-9999-8f14c101aeff",
 *    "inbox": {
 *      "optOut": false
 *    },
 *    "stats": {
 *    ---INCLUDES STATS AND BUFFS---
 *    },
 *    "profile": {
 *      "name": "Ezra"
 *    },
 *    "preferences": {
 *      ---INCLUDES INFO ABOUT APPEARANCE AND PUBLIC PREFS---
 *    },
 *    "party": {
 *      "_id": "12345678-0987-abcd-82a6-837c81db4c1e",
 *      "quest": {
 *        "RSVPNeeded": false,
 *        "progress": {}
 *      },
 *    },
 *    "items": {
 *      "lastDrop": {
 *        "count": 0,
 *        "date": "2017-01-15T02:41:35.009Z"
 *      },
 *        ----INCLUDES QUESTS, FOOD, POTIONS, EGGS, GEAR, CARDS, SPECIAL ITEMS (E.G. SNOWBALLS)----
 *      }
 *    },
 *    "achievements": {
 *      "partyUp": true,
 *      "habitBirthdays": 2,
 *    },
 *    "auth": {
 *      "timestamps": {
 *        "loggedin": "2017-03-05T12:30:54.545Z",
 *        "created": "2017-01-12T03:30:11.842Z"
 *      }
 *    },
 *    "id": "99999999-9999-9999-9999-8f14c101aeff"
 *  }
 * }
 *)
 *
 * @apiUse UserNotFound
 */
api.getMember = {
  method: 'GET',
  url: '/members/:memberId',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { memberId } = req.params;

    const member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', { userId: memberId }));

    if (!member.flags.verifiedUsername) member.auth.local.username = null;

    // manually call toJSON with minimize: true so empty paths aren't returned
    const memberToJSON = member.toJSON({ minimize: true });
    User.addComputedStatsToJSONObj(memberToJSON.stats, member);

    res.respond(200, memberToJSON);
  },
};

api.getMemberByUsername = {
  method: 'GET',
  url: '/members/username/:username',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('username', res.t('invalidReqParams')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let username = req.params.username.toLowerCase();
    if (username[0] === '@') username = username.slice(1, username.length);

    const member = await User
      .findOne({ 'auth.local.lowerCaseUsername': username, 'flags.verifiedUsername': true })
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userNotFound'));

    // manually call toJSON with minimize: true so empty paths aren't returned
    const memberToJSON = member.toJSON({ minimize: true });
    User.addComputedStatsToJSONObj(memberToJSON.stats, member);

    res.respond(200, memberToJSON);
  },
};

/**
 * @api {get} /api/v3/members/:memberId/achievements Get member achievements object
 * @apiName GetMemberAchievements
 * @apiGroup Member
 * @apiDescription Get a list of achievements
 * of the requested member, grouped by basic / seasonal / special.
 *
 * @apiParam (Path) {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The achievements object
 *
 * @apiSuccess {Object} data.basic The basic achievements object
 * @apiSuccess {Object} data.seasonal The seasonal achievements object
 * @apiSuccess {Object} data.special The special achievements object
 *
 * @apiSuccess {String} data.label The label for that category
 * @apiSuccess {Object} data.achievements The achievements in that category
 *
 * @apiSuccess {String} data.achievements.title The localized title string
 * @apiSuccess {String} data.achievements.text The localized description string
 * @apiSuccess {Boolean} data.achievements.earned Whether the user has earned the achievement
 * @apiSuccess {Number} data.achievements.index The unique index assigned
 *                                                to the achievement (only for sorting purposes).
 * @apiSuccess {Anything} data.achievements.value The value related to the achievement
 *                                                  (if applicable)
 * @apiSuccess {Number} data.achievements.optionalCount The count related to the achievement
 *                                                        (if applicable)
 *
 * @apiSuccessExample {json} Successful Response
 * {
 *   basic: {
 *     label: "Basic",
 *     achievements: {
 *       streak: {
 *         title: "0 Streak Achievements",
 *         text: "Has performed 0 21-day streaks on Dailies",
 *         icon: "achievement-thermometer",
 *         earned: false,
 *         value: 0,
 *         index: 60,
 *         optionalCount: 0
 *       },
 *       perfect: {
 *         title: "5 Perfect Days",
 *         text: "Completed all active Dailies on 5 days. With this achievement
 *                you get a +level/2 buff to all attributes for the next day.
 *                Levels greater than 100 don't have any additional effects on buffs.",
 *         icon: "achievement-perfect",
 *         earned: true,
 *         value: 5,
 *         index: 61,
 *         optionalCount: 5
 *       }
 *     }
 *   },
 *   seasonal: {
 *     label: "Seasonal",
 *     achievements: {
 *       habiticaDays: {
 *         title: "Habitica Naming Day",
 *         text: "Celebrated 0 Naming Days! Thanks for being a fantastic user.",
 *         icon: "achievement-habiticaDay",
 *         earned: false,
 *         value: 0,
 *         index: 72,
 *         optionalCount: 0
 *       }
 *     }
 *   },
 *   special: {
 *     label: "Special",
 *     achievements: {
 *       habitSurveys: {
 *         title: "Helped Habitica Grow",
 *         text: "Helped Habitica grow on 0 occasions, either by filling out
 *               a survey or helping with a major testing effort. Thank you!",
 *         icon: "achievement-tree",
 *         earned: false,
 *         value: 0,
 *         index: 88,
 *         optionalCount: 0
 *       }
 *     }
 *   }
 * }
 *
 * @apiError (400) {BadRequest} MemberIdRequired The `id` param is required
 *                                               and must be a valid `UUID`.
 * @apiError (404) {NotFound} UserWithIdNotFound The `id` param did not
 *                                               belong to an existing member.
 */
api.getMemberAchievements = {
  method: 'GET',
  url: '/members/:memberId/achievements',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { memberId } = req.params;

    const member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', { userId: memberId }));

    const achievsObject = achievements.getAchievementsForProfile(member, req.language);

    res.respond(200, achievsObject);
  },
};

// Return a request handler for getMembersForGroup / getInvitesForGroup / getMembersForChallenge

// @TODO: This violates the Liskov substitution principle.
// We should create factory functions. See Webhooks for a good example
function _getMembersForItem (type) {
  // check for allowed `type`
  if (['group-members', 'group-invites'].indexOf(type) === -1) {
    throw new Error('Type must be one of "group-members", "group-invites"');
  }

  return async function handleGetMembersForItem (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkQuery('lastId').optional().notEmpty().isUUID();
    // Allow an arbitrary number of results (up to 60)
    req.checkQuery('limit', res.t('groupIdRequired')).optional().notEmpty().isInt({ min: 1, max: 60 });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;
    const { lastId } = req.query;
    const { user } = res.locals;

    const group = await Group.getGroup({ user, groupId, fields: '_id type' });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const query = {};
    let fields = nameFields;
    // add computes stats to the member info when items and stats are available
    let addComputedStats = false;

    if (type === 'group-members') {
      if (group.type === 'guild') {
        query.guilds = group._id;

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      } else {
        query['party._id'] = group._id; // group._id and not groupId because groupId could be === 'party'

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      }

      if (req.query.search) {
        // Creates a RegExp expression when querying for profile.name and auth.local.username
        const escapedSearch = escapeRegExp(req.query.search);
        query.$or = [
          { 'profile.name': { $regex: new RegExp(escapedSearch, 'i') } },
          { 'auth.local.username': { $regex: new RegExp(req.query.search, 'i') } },
        ];
      }
    } else if (type === 'group-invites') {
      if (group.type === 'guild') { // eslint-disable-line no-lonely-if
        query['invitations.guilds.id'] = group._id;

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      } else {
        query['invitations.party.id'] = group._id; // group._id and not groupId because groupId could be === 'party'
        // @TODO invitations are now stored like this: `'invitations.parties': []`
        //  Probably need a database index for it.
        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      }
    }

    if (lastId) query._id = { $gt: lastId };

    const limit = req.query.limit ? Number(req.query.limit) : 30;

    const members = await User
      .find(query)
      .sort({ _id: 1 })
      .limit(limit)
      .select(fields)
      .lean()
      .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    members.forEach(member => User.transformJSONUser(member, addComputedStats));
    res.respond(200, members);
  };
}

/**
 * @api {get} /api/v3/groups/:groupId/members Get members for a group
 * @apiDescription With a limit of 30 member per request (by default).
 * To get all members run requests against this routes (updating the lastId query parameter)
 * until you get less than 30 results (or the specified limit).
 * @apiName GetMembersForGroup
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party is accepted)
 * @apiParam (Query) {UUID} lastId Query parameter to specify the last member
 *                                 returned in a previous request to this route and
 *                                 get the next batch of results.
 * @apiParam (Query) {Number} limit=30 BETA Query parameter
 *                                     to specify the number of results to return. Max is 60.
 * @apiParam (Query) {Boolean} includeAllPublicFields If set to `true`
 *                                                    then all public fields for members
 *                                                    will be returned (similar to when making
 *                                                    a request for a single member).
 * @apiParam (Query) {Boolean} includeTasks If set to `true`, then
 *                                response should include all tasks per user
 *                                related to the challenge
 *
 * @apiSuccess {Array} data An array of members, sorted by _id
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "00000001-1111-9999-9000-111111111111",
 *       "profile": {
 *         "name": "Jiminy"
 *       },
 *       "id": "00000001-1111-9999-9000-111111111111"
 *     },
 *  }
 *
 *
 * @apiUse ChallengeNotFound
 * @apiUse GroupNotFound
 */
api.getMembersForGroup = {
  method: 'GET',
  url: '/groups/:groupId/members',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-members'),
};

/**
 * @api {get} /api/v3/groups/:groupId/invites Get invites for a group
 * @apiDescription With a limit of 30 member per request (by default). To get all invites run
 * requests against this routes (updating the lastId query parameter)
 * until you get less than 30 results.
 * @apiName GetInvitesForGroup
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party is accepted)
 * @apiParam (Query) {UUID} lastId Query parameter to specify the last invite
 *                                 returned in a previous request to this route and
 *                                 get the next batch of results.
 * @apiParam (Query) {Number} limit=30 BETA Query parameter
 *                                     to specify the number of results to return. Max is 60.
 * @apiParam (Query) {Boolean} includeAllPublicFields If set to `true`
 *                                                    then all public fields for members
 *                                                    will be returned (similar to when making
 *                                                    a request for a single member).
 *
 * @apiSuccess {array} data An array of invites, sorted by _id
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "99f3cb9d-4af8-4ca4-9b82-6b2a6bf59b7a",
 *       "profile": {
 *         "name": "DoomSmoocher"
 *       },
 *       "id": "99f3cb9d-4af8-4ca4-9b82-6b2a6bf59b7a"
 *     }
 *   ]
 * }
 *
 *
 * @apiUse ChallengeNotFound
 * @apiUse GroupNotFound
 */
api.getInvitesForGroup = {
  method: 'GET',
  url: '/groups/:groupId/invites',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-invites'),
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members Get members for a challenge
 * @apiDescription With a limit of 30 member per request (by default).
 * To get all members run requests against this routes (updating the lastId query parameter)
 * until you get less than 30 results.
 * BETA You can also use ?includeAllMembers=true. This option is currently in BETA
 * and may be removed in future.
 * Its use is discouraged and its performances are not optimized especially for large challenges.
 *
 * @apiName GetMembersForChallenge
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} challengeId The challenge id
 * @apiParam (Query) {UUID} lastId Query parameter to specify the last member returned
 *                                 in a previous request to this route and
 *                                 get the next batch of results.
 * @apiParam (Query) {Number} limit=30 BETA Query parameter to
 *                                     specify the number of results to return. Max is 60.
 * @apiParam (Query) {Boolean} includeTasks BETA Query parameter - If 'true'
 *                                                    then include challenge tasks of each member
 * @apiParam (Query) {Boolean} includeAllPublicFields If set to `true`
 *                                                    then all public fields for members
 *                                                    will be returned (similar to when making
 *                                                    a request for a single member).

 * @apiSuccess {Array} data An array of members, sorted by _id
 *
 * @apiUse ChallengeNotFound
 * @apiUse GroupNotFound
 */
api.getMembersForChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId/members',
  middlewares: [authWithHeaders()],
  handler: handleGetMembersForChallenge,
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members/:memberId Get a challenge member progress
 * @apiName GetChallengeMemberProgress
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} challengeId The challenge _id
 * @apiParam (Path) {UUID} memberId The member _id
 *
 * @apiSuccess {Object} data Return an object with member _id, profile.name
 *                           and a tasks object with the challenge tasks for the member.
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "data": {
 *     "_id": "b0413351-405f-416f-8787-947ec1c85199",
 *     "profile": {"name": "MadPink"},
 *     "tasks": [
 *       {
 *         "_id": "9cd37426-0604-48c3-a950-894a6e72c156",
 *       "text": "Make sure the place where you sleep is quiet, dark, and cool.",
 *         "updatedAt": "2017-06-17T17:44:15.916Z",
 *         "createdAt": "2017-06-17T17:44:15.916Z",
 *         "reminders": [],
 *         "group": {
 *           "approval": {
 *             "requested": false,
 *             "approved": false,
 *             "required": false
 *           },
 *           "assignedUsers": []
 *         },
 *         "challenge": {
 *           "taskId": "6d3758b1-071b-4bfa-acd6-755147a7b5f6",
 *           "id": "4db6bd82-b829-4bf2-bad2-535c14424a3d",
 *           "shortName": "Take This June 2017"
 *         },
 *         "attribute": "str",
 *         "priority": 1,
 *         "value": 0,
 *         "notes": "",
 *         "type": "todo",
 *         "checklist": [],
 *         "collapseChecklist": false,
 *         "completed": false,
 *       },
 *         "startDate": "2016-09-01T05:00:00.000Z",
 *         "everyX": 1,
 *         "frequency": "weekly",
 *         "id": "b207a15e-8bfd-4aa7-9e64-1ba89699da06"
 *       }
 *     ]
 *   }
 *
 * @apiUse ChallengeNotFound
 * @apiUse UserNotFound
 */
api.getChallengeMemberProgress = {
  method: 'GET',
  url: '/challenges/:challengeId/members/:memberId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;
    const { memberId } = req.params;

    const member = await User.findById(memberId).select(`${nameFields} challenges`).exec();
    if (!member) throw new NotFound(res.t('userWithIDNotFound', { userId: memberId }));
    const challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    // optionalMembership is set to true because even if you're
    // not member of the group you may be able to access the challenge
    // for example if you've been booted from it, are the leader or a site admin
    const group = await Group.getGroup({
      user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true,
    });
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.isMember(member)) throw new NotFound(res.t('challengeMemberNotFound'));

    const challengeTasks = await Tasks.Task.find({
      userId: member._id,
      'challenge.id': challenge._id,
    })
      .select('-tags -checklist') // We don't want to return tags and checklists publicly
      .lean()
      .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    const response = member.toJSON({ minimize: true });
    delete response.challenges;
    response.tasks = challengeTasks;
    res.respond(200, response);
  },
};

/**
 * @api {get} /api/v3/members/:toUserId/objections/:interaction Get objections to interaction
 * @apiDescription Get any objections that would occur
 * if the given interaction was attempted - BETA.
 *
 * @apiVersion 3.0.0
 * @apiName GetObjectionsToInteraction
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} toUserId The user to interact with
 * @apiParam (Path) {String="send-private-message","transfer-gems"} interaction Name of the
 *                                                                              interaction
 *                                                                              to query.
 *
 * @apiSuccess {Array} data Return an array of objections,
 *                          if the interaction would be blocked; otherwise an empty array.
 */
api.getObjectionsToInteraction = {
  method: 'GET',
  url: '/members/:toUserId/objections/:interaction',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();
    req.checkParams('interaction', res.t('interactionRequired')).notEmpty().isIn(KNOWN_INTERACTIONS);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const sender = res.locals.user;
    const receiver = await User.findById(req.params.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userWithIDNotFound', { userId: req.params.toUserId }));

    const { interaction } = req.params;
    const response = sender.getObjectionsToInteraction(interaction, receiver);

    res.respond(200, response.map(res.t));
  },
};

/**
 * @api {post} /api/v3/members/send-private-message Send a private message to a member
 * @apiName SendPrivateMessage
 * @apiGroup Member
 *
 * @apiParam (Body) {String} message The message
 * @apiParam (Body) {UUID} toUserId The id of the user to contact
 *
 * @apiSuccess {Object} data.message The message just sent
 *
 * @apiUse UserNotFound
 */
api.sendPrivateMessage = {
  method: 'POST',
  url: '/members/send-private-message',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('message', res.t('messageRequired')).notEmpty();
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const sender = res.locals.user;
    const sanitizedMessageText = sanitizeMessageText(req.body.message);
    const message = (await highlightMentions(sanitizedMessageText))[0];

    const receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));
    if (!receiver.flags.verifiedUsername) delete receiver.auth.local.username;

    const objections = sender.getObjectionsToInteraction('send-private-message', receiver);
    if (objections.length > 0 && !sender.hasPermission('moderator')) throw new NotAuthorized(res.t(objections[0]));

    const messageSent = await sentMessage(sender, receiver, message, res.t);

    res.respond(200, { message: messageSent });
  },
};

/**
 * @api {post} /api/v3/members/transfer-gems Send a gem gift to a member
 * @apiName TransferGems
 * @apiGroup Member
 *
 * @apiParam (Body) {String} message The message to the user
 * @apiParam (Body) {UUID} toUserId The user to send the gift to
 * @apiParam (Body) {Integer} gemAmount The number of gems to send
 *
 * @apiSuccess {Object} data An empty Object
 *
 * @apiUse UserNotFound
 */
api.transferGems = {
  method: 'POST',
  url: '/members/transfer-gems',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();
    req.checkBody('gemAmount', res.t('gemAmountRequired')).notEmpty().isInt();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const sender = res.locals.user;
    const receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    const objections = sender.getObjectionsToInteraction('transfer-gems', receiver);
    if (objections.length > 0) throw new NotAuthorized(res.t(objections[0]));

    const { gemAmount } = req.body;
    const amount = gemAmount / 4;

    if (amount <= 0 || sender.balance < amount) {
      throw new NotAuthorized(res.t('badAmountOfGemsToSend'));
    }

    // Received from {sender}
    await receiver.updateBalance(amount, 'gift_receive', sender._id, sender.auth.local.username);

    // Gifted to {receiver}
    await sender.updateBalance(-amount, 'gift_send', receiver._id, receiver.auth.local.username);
    // @TODO necessary? Also saved when sending the inbox message
    const promises = [receiver.save(), sender.save()];
    await Promise.all(promises);

    // generate the message in both languages, so both users can understand it
    const receiverLang = receiver.preferences.language;
    const senderLang = sender.preferences.language;
    const [receiverMsg, senderMsg] = [receiverLang, senderLang].map(lang => {
      let messageContent = res.t('privateMessageGiftGemsMessage', {
        receiverName: receiver.profile.name,
        senderName: sender.profile.name,
        gemAmount,
      }, lang);
      messageContent = `\`${messageContent}\` `;

      if (req.body.message) {
        messageContent += req.body.message;
      }
      return messageContent;
    });

    await sender.sendMessage(receiver, {
      senderMsg,
      receiverMsg,
    });

    const byUsername = getUserInfo(sender, ['name']).name;

    if (receiver.preferences.emailNotifications.giftedGems !== false) {
      sendTxnEmail(receiver, 'gifted-gems', [
        { name: 'GIFTER', content: byUsername },
        { name: 'X_GEMS_GIFTED', content: gemAmount },
      ]);
    }
    if (receiver.preferences.pushNotifications.giftedGems !== false) {
      sendPushNotification(receiver,
        {
          title: res.t('giftedGems', receiverLang),
          message: res.t('giftedGemsInfo', { amount: gemAmount, name: byUsername }, receiverLang),
          identifier: 'giftedGems',
          payload: { replyTo: sender._id },
        });
    }

    res.respond(200, {});

    if (res.analytics) {
      res.analytics.track('transfer gems', {
        uuid: sender._id,
        hitType: 'event',
        category: 'behavior',
        headers: req.headers,
        quantity: gemAmount,
      });
    }
  },
};

export default api;
