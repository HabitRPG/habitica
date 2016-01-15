import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import {
  model as User,
  publicFields as memberFields,
  nameFields,
} from '../../models/user';
import { model as Group } from '../../models/group';
import { model as Challenge } from '../../models/challenge';
import {
  NotFound,
} from '../../libs/api-v3/errors';

let api = {};

/**
 * @api {get} /members/:memberId Get a member profile
 * @apiVersion 3.0.0
 * @apiName GetMember
 * @apiGroup Member
 *
 * @apiParam {UUID} memberId The member's id
 *
 * @apiSuccess {object} member The member object
 */
api.getMember = {
  method: 'GET',
  url: '/members/:memberId',
  middlewares: [authWithHeaders(), cron],
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

    res.respond(200, member);
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
      challenge = await Challenge.findById(challengeId).select('_id type leader').exec();
      if (!challenge || !challenge.hasAccess(user)) throw new NotFound(res.t('groupNotFound'));
    } else {
      group = await Group.getGroup(user, groupId, '_id type');
      if (!group) throw new NotFound(res.t('groupNotFound'));
    }

    let query = {};
    let fields = nameFields;

    if (type === 'challenge-members') {
      query.challenges = challenge._id;
    } else if (type === 'group-members') {
      if (group.type === 'guild') {
        query.guilds = group._id;
      } else {
        query['party._id'] = group._id; // group._id and not groupId because groupId could be === 'party'

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
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

    let users = await User
      .find(query)
      .sortBy({_id: 1})
      .limit(30)
      .select(fields)
      .exec();

    res.respond(200, users);
  };
}

/**
 * @api {get} /groups/:groupId/members Get members for a group with a limit of 30 member per request. To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiVersion 3.0.0
 * @apiName GetMembersForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 * @apiParam {boolean} includeAllPublicFields Query parameter avalaible only when fetching a party. If === `true` then all public fields for members will be returned (liek when making a request for a single member)
 *
 * @apiSuccess {array} members An array of members, sorted by _id
 */
api.getMembersForGroup = {
  method: 'GET',
  url: '/groups/:groupId/members',
  middlewares: [authWithHeaders(), cron],
  handler: _getMembersForItem('group-members'),
};

/**
 * @api {get} /groups/:groupId/invites Get invites for a group with a limit of 30 member per request. To get all invites run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiVersion 3.0.0
 * @apiName GetInvitesForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last invite returned in a previous request to this route and get the next batch of results
 *
 * @apiSuccess {array} invites An array of invites, sorted by _id
 */
api.getInvitesForGroup = {
  method: 'GET',
  url: '/groups/:groupId/invites',
  middlewares: [authWithHeaders(), cron],
  handler: _getMembersForItem('group-invites'),
};

/**
 * @api {get} /challenges/:challengeId/members Get members for a challenge with a limit of 30 member per request. To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiVersion 3.0.0
 * @apiName GetMembersForChallenge
 * @apiGroup Member
 *
 * @apiParam {UUID} challengeId The challenge id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 *
 * @apiSuccess {array} members An array of members, sorted by _id
 */
api.getMembersForChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId/members',
  middlewares: [authWithHeaders(), cron],
  handler: _getMembersForItem('challenge-members'),
};

export default api;
