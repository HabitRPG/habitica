import { authWithHeaders } from '../../middlewares/auth';
import {
  model as User,
  publicFields as memberFields,
  nameFields,
} from '../../models/user';
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
 * @apiUse UserNotFound
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

// Return a request handler for getMembersForGroup / getInvitesForGroup / getMembersForChallenge
// type is `invites` or `members`
function _getMembersForItem (type) {
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
    } else if (type === 'group-members') {
      if (group.type === 'guild') {
        query.guilds = group._id;
      } else {
        query['party._id'] = group._id; // group._id and not groupId because groupId could be === 'party'

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      }
    } else if (type === 'group-invites') {
      if (group.type === 'guild') { // eslint-disable-line no-lonely-if
        query['invitations.guilds.id'] = group._id;
      } else {
        query['invitations.party.id'] = group._id; // group._id and not groupId because groupId could be === 'party'
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
 * @apiDescription With a limit of 30 member per request. To get all invites run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiName GetInvitesForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last invite returned in a previous request to this route and get the next batch of results
 *
 * @apiSuccess {array} data An array of invites, sorted by _id
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

 * @apiSuccess {array} data An array of members, sorted by _id
 *
 * @apiUse ChallengeNotFound
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
 * @api {posts} /api/v3/members/send-private-message Send a private message to a member
 * @apiName SendPrivateMessage
 * @apiGroup Member
 *
 * @apiParam {String} message Body parameter - The message
 * @apiParam {UUID} toUserId Body parameter - The user to contact
 *
 * @apiSuccess {Object} data An empty Object
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

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;
    let message = req.body.message;

    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    let userBlockedSender = receiver.inbox.blocks.indexOf(sender._id) !== -1;
    let userIsBlockBySender = sender.inbox.blocks.indexOf(receiver._id) !== -1;
    let userOptedOutOfMessaging = receiver.inbox.optOut;

    if (userBlockedSender || userIsBlockBySender || userOptedOutOfMessaging) {
      throw new NotAuthorized(res.t('notAuthorizedToSendMessageToThisUser'));
    }

    await sender.sendMessage(receiver, message);

    if (receiver.preferences.emailNotifications.newPM !== false) {
      sendTxnEmail(receiver, 'new-pm', [
        {name: 'SENDER', content: getUserInfo(sender, ['name']).name},
        {name: 'PMS_INBOX_URL', content: '/#/options/groups/inbox'},
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
 * @apiParam {String} message Body parameter The message
 * @apiParam {UUID} toUserId Body parameter The toUser _id
 * @apiParam {Integer} gemAmount Body parameter The number of gems to send
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

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;

    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    if (receiver._id === sender._id) {
      throw new NotAuthorized(res.t('cannotSendGemsToYourself'));
    }

    let gemAmount = req.body.gemAmount;
    let amount = gemAmount / 4;

    if (amount <= 0 || sender.balance < amount) {
      throw new NotAuthorized(res.t('badAmountOfGemsToSend'));
    }

    receiver.balance += amount;
    sender.balance -= amount;
    let promises = [receiver.save(), sender.save()];
    await Bluebird.all(promises);

    let message = res.t('privateMessageGiftIntro', {
      receiverName: receiver.profile.name,
      senderName: sender.profile.name,
    });
    message += res.t('privateMessageGiftGemsMessage', {gemAmount});
    message =  `\`${message}\` `;

    if (req.body.message) {
      message += req.body.message;
    }

    await sender.sendMessage(receiver, message);

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
          title: res.t('giftedGems'),
          message: res.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}),
          identifier: 'giftedGems',
          payload: {replyTo: sender._id},
        });
    }

    res.respond(200, {});
  },
};


module.exports = api;
