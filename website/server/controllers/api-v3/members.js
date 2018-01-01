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
import Bluebird from 'bluebird';
import { sendNotification as sendPushNotification } from '../../libs/pushNotifications';
import { achievements } from '../../../../website/common/';

let api = {};

/**
 * @api {get} /api/v3/members/:memberId Get a member profile
 * @apiName GetMember
 * @apiGroup Member
 *
 * @apiParam {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The member object
 *
 * @apiSuccess (Object) data.inbox Basic information about person's inbox
 * @apiSuccess (Object) data.stats Includes current stats and buffs
 * @apiSuccess (Object) data.profile Includes name
 * @apiSuccess (Object) data.preferences Includes info about appearance and public prefs
 * @apiSuccess (Object) data.party Includes basic info about current party and quests
 * @apiSuccess (Object) data.items Basic inventory information includes quests, food, potions, eggs, gear, special items
 * @apiSuccess (Object) data.achievements Lists current achievements
 * @apiSuccess (Object) data.auth Includes latest timestamps
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
 * @apiError (400) {BadRequest} InvalidReuesParameters "Member" must be a valid UUID.
 * @apiError (404) {NotFound} NotFound User with id "__ID SPECIFIED_" not found.
 */
api.getMember = {
  method: 'GET',
  url: '/members/:memberId',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;

    let member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    // manually call toJSON with minimize: true so empty paths aren't returned
    let memberToJSON = member.toJSON({minimize: true});
    member.addComputedStatsToJSONObj(memberToJSON.stats);

    res.respond(200, memberToJSON);
  },
};

/**
 * @api {get} /api/v3/members/:memberId/achievements Get member achievements object
 * @apiName GetMemberAchievements
 * @apiGroup Member
 * @apiDescription Get a list of achievements of the requested member, grouped by basic / seasonal / special.
 *
 * @apiParam (Path) {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The achievements object
 *
 * @apiSuccess {Object} data.basic The basic achievements object
 * @apiSuccess {Object} data.seasonal The seasonal achievements object
 * @apiSuccess {Object} data.special The special achievements object
 *
 * @apiSuccess {String} data.*.label The label for that category
 * @apiSuccess {Object} data.*.achievements The achievements in that category
 *
 * @apiSuccess {String} data.*.achievements.title The localized title string
 * @apiSuccess {String} data.*.achievements.text The localized description string
 * @apiSuccess {Boolean} data.*.achievements.earned Whether the user has earned the achievement
 * @apiSuccess {Number} data.*.achievements.index The unique index assigned to the achievement (only for sorting purposes)
 * @apiSuccess {Anything} data.*.achievements.value The value related to the achievement (if applicable)
 * @apiSuccess {Number} data.*.achievements.optionalCount The count related to the achievement (if applicable)
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
 *         text: "Completed all active Dailies on 5 days. With this achievement you get a +level/2 buff to all attributes for the next day. Levels greater than 100 don't have any additional effects on buffs.",
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
 *         text: "Helped Habitica grow on 0 occasions, either by filling out a survey or helping with a major testing effort. Thank you!",
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
 * @apiError (400) {BadRequest} MemberIdRequired The `id` param is required and must be a valid `UUID`
 * @apiError (404) {NotFound} UserWithIdNotFound The `id` param did not belong to an existing member
 */
api.getMemberAchievements = {
  method: 'GET',
  url: '/members/:memberId/achievements',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;

    let member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    let achievsObject = achievements.getAchievementsForProfile(member, req.language);

    res.respond(200, achievsObject);
  },
};

// Return a request handler for getMembersForGroup / getInvitesForGroup / getMembersForChallenge

// @TODO: This violates the Liskov substitution principle. We should create factory functions. See Webhooks for a good example
function _getMembersForItem (type) {
  // check for allowed `type`
  if (['group-members', 'group-invites', 'challenge-members'].indexOf(type) === -1) {
    throw new Error('Type must be one of "group-members", "group-invites", "challenge-members"');
  }

  return async function handleGetMembersForItem (req, res) {
    if (type === 'challenge-members') {
      req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    } else {
      req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    }
    req.checkQuery('lastId').optional().notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let challengeId = req.params.challengeId;
    let lastId = req.query.lastId;
    let user = res.locals.user;
    let challenge;
    let group;

    if (type === 'challenge-members') {
      challenge = await Challenge.findById(challengeId).select('_id type leader group').exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));

      // optionalMembership is set to true because even if you're not member of the group you may be able to access the challenge
      // for example if you've been booted from it, are the leader or a site admin
      group = await Group.getGroup({
        user,
        groupId: challenge.group,
        fields: '_id type privacy',
        optionalMembership: true,
      });

      if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    } else {
      group = await Group.getGroup({user, groupId, fields: '_id type'});
      if (!group) throw new NotFound(res.t('groupNotFound'));
    }

    let query = {};
    let fields = nameFields;
    let addComputedStats = false; // add computes stats to the member info when items and stats are available

    if (type === 'challenge-members') {
      query.challenges = challenge._id;

      if (req.query.includeAllPublicFields === 'true') {
        fields = memberFields;
        addComputedStats = true;
      }

      if (req.query.search) {
        query['profile.name'] = {$regex: req.query.search};
      }
    } else if (type === 'group-members') {
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
        query['profile.name'] = {$regex: req.query.search};
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
        // @TODO invitations are now stored like this: `'invitations.parties': []`  Probably need a database index for it.
        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      }
    }

    if (lastId) query._id = {$gt: lastId};

    let limit = 30;

    // Allow for all challenges members to be returned
    if (type === 'challenge-members' && req.query.includeAllMembers === 'true') {
      limit = 0; // no limit
    }

    let members = await User
      .find(query)
      .sort({_id: 1})
      .limit(limit)
      .select(fields)
      .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    let membersToJSON = members.map(member => {
      let memberToJSON = member.toJSON({minimize: true});
      if (addComputedStats) member.addComputedStatsToJSONObj(memberToJSON.stats);

      return memberToJSON;
    });
    res.respond(200, membersToJSON);
  };
}

/**
 * @api {get} /api/v3/groups/:groupId/members Get members for a group
 * @apiDescription With a limit of 30 member per request. To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiName GetMembersForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 * @apiParam {boolean} includeAllPublicFields Query parameter available only when fetching a party. If === `true` then all public fields for members will be returned (like when making a request for a single member)
 *
 * @apiSuccess {array} data An array of members, sorted by _id
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
 * @apiError (404) {NotFound} NotFound Group not found or you don't have access.
 */
api.getMembersForGroup = {
  method: 'GET',
  url: '/groups/:groupId/members',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-members'),
};

/**
 * @api {get} /api/v3/groups/:groupId/invites Get invites for a group
 * @apiDescription With a limit of 30 member per request. To get all invites run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiName GetInvitesForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last invite returned in a previous request to this route and get the next batch of results
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
 * @apiError (404) {NotFound} NotFound Group not found or you don't have access.
 */
api.getInvitesForGroup = {
  method: 'GET',
  url: '/groups/:groupId/invites',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-invites'),
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members Get members for a challenge
 * @apiDescription With a limit of 30 member per request.
 * To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * BETA You can also use ?includeAllMembers=true. This option is currently in BETA and may be removed in future.
 * Its use is discouraged and its performaces are not optimized especially for large challenges.
 *
 * @apiName GetMembersForChallenge
 * @apiGroup Member
 *
 * @apiParam {UUID} challengeId The challenge id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 * @apiParam {String} includeAllMembers BETA Query parameter - If 'true' all challenge members are returned
 *
 * @apiSuccess {array} data An array of members, sorted by _id
 *
 * @apiError (404) {NotFound} NotFound Group not found or you don't have access.
 * @apiUse GroupNotFound
 */
api.getMembersForChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId/members',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('challenge-members'),
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members/:memberId Get a challenge member progress
 * @apiName GetChallengeMemberProgress
 * @apiGroup Member
 *
 * @apiParam {UUID} challengeId The challenge _id
 * @apiParam {UUID} member The member _id
 *
 * @apiSuccess {Object} data Return an object with member _id, profile.name and a tasks object with the challenge tasks for the member
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
 * @apiError (404) {NotFound} NotFound Challenge not found or you don't have access.
 */
api.getChallengeMemberProgress = {
  method: 'GET',
  url: '/challenges/:challengeId/members/:memberId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;
    let memberId = req.params.memberId;

    let member = await User.findById(memberId).select(`${nameFields} challenges`).exec();
    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    let challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    // optionalMembership is set to true because even if you're not member of the group you may be able to access the challenge
    // for example if you've been booted from it, are the leader or a site admin
    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.isMember(member)) throw new NotFound(res.t('challengeMemberNotFound'));

    let chalTasks = await Tasks.Task.find({
      userId: memberId,
      'challenge.id': challengeId,
    })
    .select('-tags') // We don't want to return the tags publicly TODO same for other data?
    .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    let response = member.toJSON({minimize: true});
    delete response.challenges;
    response.tasks = chalTasks.map(chalTask => chalTask.toJSON({minimize: true}));
    res.respond(200, response);
  },
};

/**
 * @api {get} /api/v3/members/:toUserId/objections/:interaction Get any objections that would occur if the given interaction was attempted - BETA
 * @apiVersion 3.0.0
 * @apiName GetObjectionsToInteraction
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} toUserId The user to interact with
 * @apiParam (Path) {String="send-private-message","transfer-gems"} interaction Name of the interaction to query
 *
 * @apiSuccess {Array} data Return an array of objections, if the interaction would be blocked; otherwise an empty array
 */
api.getObjectionsToInteraction = {
  method: 'GET',
  url: '/members/:toUserId/objections/:interaction',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();
    req.checkParams('interaction', res.t('interactionRequired')).notEmpty().isIn(KNOWN_INTERACTIONS);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;
    let receiver = await User.findById(req.params.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userWithIDNotFound', {userId: req.params.toUserId}));

    let interaction = req.params.interaction;
    let response = sender.getObjectionsToInteraction(interaction, receiver);

    res.respond(200, response.map(res.t));
  },
};

/**
 * @api {post} /api/v3/members/send-private-message Send a private message to a member
 * @apiName SendPrivateMessage
 * @apiGroup Member
 *
 * @apiParam (Body) {String} message Body parameter - The message
 * @apiParam (Body) {UUID} toUserId Body parameter - The user to contact
 *
 * @apiSuccess {Object} data An empty Object
 *
 * @apiError (400) {BadRequest} InvalidRequestParameters A message is required.
 * @apiError (400) {BadRequest} InvalidRequestParameters A UserID is required.
 * @apiError (404) {NotFound} userNotFound User not found
 */
api.sendPrivateMessage = {
  method: 'POST',
  url: '/members/send-private-message',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('message', res.t('messageRequired')).notEmpty();
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;
    let message = req.body.message;
    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    let objections = sender.getObjectionsToInteraction('send-private-message', receiver);

    if (objections.length > 0 && !sender.isAdmin()) throw new NotAuthorized(res.t(objections[0]));

    await sender.sendMessage(receiver, { receiverMsg: message });

    if (receiver.preferences.emailNotifications.newPM !== false) {
      sendTxnEmail(receiver, 'new-pm', [
        {name: 'SENDER', content: getUserInfo(sender, ['name']).name},
      ]);
    }
    if (receiver.preferences.pushNotifications.newPM !== false) {
      sendPushNotification(
        receiver,
        {
          title: res.t('newPM'),
          message: res.t('newPMInfo', {name: getUserInfo(sender, ['name']).name, message}),
          identifier: 'newPM',
          category: 'newPM',
          payload: {replyTo: sender._id},
        }
      );
    }

    res.respond(200, {});
  },
};

/**
 * @api {posts} /api/v3/members/transfer-gems Send a gem gift to a member
 * @apiName TransferGems
 * @apiGroup Member
 *
 * @apiParam {String} [message] Body parameter The message to user
 * @apiParam {UUID} toUserId Body parameter The toUser _id
 * @apiParam {Integer} gemAmount Body parameter The number of gems to send
 *
 * @apiSuccess {Object} data An empty Object
 *
 * @apiError (400) {InvalidRequest} GemAmount A number of gems is required. (Returned if gem value is empty)
 * @apiError (401) {NotAuthorized} NotEnoughGems Amount must be within 1 and your current number of gems.
 * @apiError (404) {NotFound} userNotFound User not found
 */
api.transferGems = {
  method: 'POST',
  url: '/members/transfer-gems',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();
    req.checkBody('gemAmount', res.t('gemAmountRequired')).notEmpty().isInt();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;
    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    let objections = sender.getObjectionsToInteraction('transfer-gems', receiver);
    if (objections.length > 0) throw new NotAuthorized(res.t(objections[0]));

    let gemAmount = req.body.gemAmount;
    let amount = gemAmount / 4;

    if (amount <= 0 || sender.balance < amount) {
      throw new NotAuthorized(res.t('badAmountOfGemsToSend'));
    }

    receiver.balance += amount;
    sender.balance -= amount;
    let promises = [receiver.save(), sender.save()];
    await Bluebird.all(promises);

    // generate the message in both languages, so both users can understand it
    let receiverLang = receiver.preferences.language;
    let senderLang = sender.preferences.language;
    let [receiverMsg, senderMsg] = [receiverLang, senderLang].map((lang) => {
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

    let byUsername = getUserInfo(sender, ['name']).name;

    if (receiver.preferences.emailNotifications.giftedGems !== false) {
      sendTxnEmail(receiver, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount},
      ]);
    }
    if (receiver.preferences.pushNotifications.giftedGems !== false) {
      sendPushNotification(receiver,
        {
          title: res.t('giftedGems', receiverLang),
          message: res.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}, receiverLang),
          identifier: 'giftedGems',
          payload: {replyTo: sender._id},
        });
    }

    res.respond(200, {});
  },
};


module.exports = api;
