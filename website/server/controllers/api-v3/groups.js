import _ from 'lodash';
import nconf from 'nconf';
import moment from 'moment';
import { authWithHeaders } from '../../middlewares/auth';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  model as User,
  nameFields,
} from '../../models/user';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import { removeFromArray } from '../../libs/collectionManipulators';
import { sendTxn as sendTxnEmail } from '../../libs/email';
import {
  inviteByUUID,
  inviteByEmail,
  inviteByUserName,
} from '../../libs/invites';
import common from '../../../common';
import payments from '../../libs/payments/payments';
import stripePayments from '../../libs/payments/stripe';
import amzLib from '../../libs/payments/amazon';
import apiError from '../../libs/apiError';
import { model as UserNotification } from '../../models/userNotification';

const { MAX_SUMMARY_SIZE_FOR_GUILDS } = common.constants;
const MAX_EMAIL_INVITES_BY_USER = 200;
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');

/**
 * @apiDefine GroupBodyInvalid
 * @apiError (400) {BadRequest} GroupBodyInvalid A parameter in the group body was invalid.
 */

/**
 * @apiDefine GroupNotFound
 * @apiError (404) {NotFound} GroupNotFound The specified group could not be found.
 */

/**
 * @apiDefine PartyNotFound
 * @apiError (404) {NotFound} PartyNotFound The user's party could not be found.
 */

/**
 * @apiDefine groupIdRequired
 * @apiError (400) {BadRequest} groupIdRequired A groupId is required
 */

/**
 * @apiDefine messageGroupRequiresInvite
 * @apiError (400) {NotAuthorized} messageGroupRequiresInvite Group requires an invitation
 *                                                            to join (e.g. private group, party).
 */

/**
 * @apiDefine GroupLeader Group Leader
 * The group leader can use this route.
 */

const api = {};

/**
 * @api {post} /api/v3/groups Create group
 * @apiName CreateGroup
 * @apiGroup Group
 *
 * @apiParam (Body) {String} name
 * @apiParam (Body) {String="guild","party"} type Type of group (guild or party)
 * @apiParam (Body) {String="private","public"} privacy Privacy of group (party MUST be private)
 *
 * @apiParamExample {json} Private Guild:
 *     {
 *       "name": "The Best Guild",
 *       "type": "guild",
 *       "privacy": "private"
 *     }
 *
 * @apiError (401) {NotAuthorized} messageInsufficientGems User does not have enough gems (4)
 * @apiError (401) {NotAuthorized} partyMustbePrivate Party must have privacy set to private
 * @apiError (401) {NotAuthorized} messageGroupAlreadyInParty
 * @apiError (401) {NotAuthorized} chatPrivilegesRevoked You cannot do this because your chat
                                                         privileges have been removed...
 *
 * @apiSuccess (201) {Object} data The created group (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Private Guild:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "The Best Guild",
 *       "leader": {
 *         "_id": "authenticated-user-id",
 *         "profile": {authenticated user's profile}
 *       },
 *       "type": "guild",
 *       "privacy": "private",
 *       "chat": [],
 *       "leaderOnly": {
 *         "challenges": false
 *       },
 *       memberCount: 1,
 *       challengeCount: 0,
 *       balance: 1,
 *       logo: "",
 *       leaderMessage: ""
 *     }
 */
api.createGroup = {
  method: 'POST',
  url: '/groups',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const group = new Group(Group.sanitize(req.body));
    group.leader = user._id;

    req.checkBody('summary', apiError('summaryLengthExceedsMax')).isLength({ max: MAX_SUMMARY_SIZE_FOR_GUILDS });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (group.type === 'guild') {
      if (!user.hasPermission('fullAccess')) {
        throw new BadRequest(res.t('featureRetired'));
      }
      group.balance = 1;
      user.guilds.push(group._id);
    } else {
      if (group.privacy !== 'private') throw new NotAuthorized(res.t('partyMustbePrivate'));
      if (user.party._id) throw new NotAuthorized(res.t('messageGroupAlreadyInParty'));

      user.party._id = group._id;
    }

    let savedGroup;

    await Group.db.transaction(async session => {
      await user.save({ session });
      savedGroup = await group.save({ session });
    });

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    // await Q.ninvoke(savedGroup, 'populate', ['leader', nameFields]);
    // doc.populate doesn't return a promise
    const response = savedGroup.toJSON();
    // the leader is the authenticated user
    response.leader = {
      _id: user._id,
      profile: { name: user.profile.name },
    };

    const analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: true,
      groupId: savedGroup._id,
      groupType: savedGroup.type,
      privacy: savedGroup.privacy,
      headers: req.headers,
      invited: false,
    };

    if (savedGroup.privacy === 'public') {
      analyticsObject.groupName = savedGroup.name;
    }

    res.analytics.track('join group', analyticsObject);

    res.respond(201, response); // do not remove chat flags data as we've just created the group
  },
};

/**
 * @api {post} /api/v3/groups/create-plan Create a Group and then redirect to the correct payment
 * @apiName CreateGroupPlan
 * @apiGroup Group
 *
 * @apiSuccess (201) {Object} data The created group
 */
api.createGroupPlan = {
  method: 'POST',
  url: '/groups/create-plan',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const group = new Group(Group.sanitize(req.body.groupToCreate));

    req.checkBody('paymentType', res.t('paymentTypeRequired')).notEmpty();
    req.checkBody('summary', apiError('summaryLengthExceedsMax')).isLength({ max: MAX_SUMMARY_SIZE_FOR_GUILDS });
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // @TODO: Change message
    if (group.privacy !== 'private') throw new NotAuthorized(res.t('partyMustbePrivate'));
    group.leader = user._id;
    user.guilds.push(group._id);

    const results = await Promise.all([user.save(), group.save()]);
    const savedGroup = results[1];

    res.analytics.track('join group', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: true,
      groupId: savedGroup._id,
      groupType: savedGroup.type,
      privacy: savedGroup.privacy,
      headers: req.headers,
      invited: false,
    });

    // do not remove chat flags data as we've just created the group
    const groupResponse = savedGroup.toJSON();
    // the leader is the authenticated user
    groupResponse.leader = {
      _id: user._id,
      profile: { name: user.profile.name },
    };

    if (req.body.paymentType === 'Stripe') {
      const {
        gift, sub: subKey, gemsBlock, coupon,
      } = req.body;

      const sub = subKey ? common.content.subscriptionBlocks[subKey] : false;
      const groupId = savedGroup._id;

      const session = await stripePayments.createCheckoutSession({
        user, gemsBlock, gift, sub, groupId, coupon, headers: req.headers,
      });

      res.respond(200, {
        sessionId: session.id,
        group: groupResponse,
      });
    } else if (req.body.paymentType === 'Amazon') {
      const { billingAgreementId } = req.body;
      const sub = req.body.subscription
        ? common.content.subscriptionBlocks[req.body.subscription]
        : false;
      const { coupon } = req.body;
      const groupId = savedGroup._id;
      const { headers } = req;

      await amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      });

      res.respond(201, groupResponse);
    }
  },
};

/**
 * @api {get} /api/v3/groups Get groups for a user
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam (Query) {String} type The type of groups to retrieve.
 *                                 Must be a query string representing a list of values
 *                                 like 'tavern,party'. Possible values are party, guilds,
 *                                 privateGuilds, publicGuilds, tavern.
 * @apiParam (Query) {String="true","false"} [paginate] Public guilds support pagination.
 *                                                      When true guilds are returned in
 *                                                      groups of 30.
 * @apiParam (Query) {Number} [page] When pagination is enabled for public guilds this
                                     parameter can be used to specify the page number
                                    (the initial page is number 0 and not required).
 *
 * @apiParamExample {json} Private Guilds, Tavern:
 *     {
 *       "type": "privateGuilds,tavern"
 *     }
 *
 * @apiError (400) {BadRequest} groupTypesRequired Group types are required
 * @apiError (400) {BadRequest} guildsPaginateBooleanString Paginate query parameter
 *                                                          must be a boolean (true or false).
 * @apiError (400) {BadRequest} queryPageInteger Page query parameter must be a positive integer
 * @apiError (400) {BadRequest} guildsOnlyPaginate Only public guilds support pagination
 *
 * @apiSuccess {Object[]} data An array of the requested groups (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Private Guilds, Tavern:
 *     HTTP/1.1 200 OK
 *     [
 *       {guilds}
 *     ]
 */
api.getGroups = {
  method: 'GET',
  url: '/groups',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty();
    // pagination options, can only be used with public guilds
    req.checkQuery('paginate').optional().isIn(['true', 'false'], apiError('guildsPaginateBooleanString'));
    req.checkQuery('page').optional().isInt({ min: 0 }, apiError('queryPageInteger'));

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const types = req.query.type.split(',');

    const paginate = req.query.paginate === 'true';
    if (paginate && !_.includes(types, 'publicGuilds')) {
      throw new BadRequest(apiError('guildsOnlyPaginate'));
    }

    const groupFields = basicGroupFields.concat(' description memberCount balance');
    const sort = '-memberCount';

    const filters = {};
    if (req.query.categories) {
      const categorySlugs = req.query.categories.split(',');
      filters.categories = { $elemMatch: { slug: { $in: categorySlugs } } };
    }

    if (req.query.minMemberCount) {
      if (!filters.memberCount) filters.memberCount = {};
      filters.memberCount.$gte = parseInt(req.query.minMemberCount, 10);
    }

    if (req.query.maxMemberCount) {
      if (!filters.memberCount) filters.memberCount = {};
      filters.memberCount.$lte = parseInt(req.query.maxMemberCount, 10);
    }

    // @TODO: Tests for below?
    if (req.query.leader) {
      filters.leader = user._id;
    }

    if (req.query.member) {
      filters._id = { $in: user.guilds };
    }

    if (req.query.search) {
      filters.$or = [];
      const searchWords = _.escapeRegExp(req.query.search.trim()).split(/\s+/).join('|');
      const searchQuery = { $regex: new RegExp(`${searchWords}`, 'i') };
      filters.$or.push({ name: searchQuery });
      filters.$or.push({ summary: searchQuery });
      filters.$or.push({ description: searchQuery });
    }

    const results = await Group.getGroups({
      user,
      types,
      groupFields,
      sort,
      paginate,
      page: req.query.page,
      filters,
    });
    res.respond(200, results);
  },
};

/**
 * @api {get} /api/v3/groups/:groupId Get group
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party
 *                                   and 'habitrpg' for tavern are accepted)
 *
 * @apiParamExample {String} Tavern:
 *     /api/v3/groups/habitrpg
 *
 * @apiSuccess {Object} data The group object (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Tavern:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tavern",
 *       ...
 *     }
 *
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 */
api.getGroup = {
  method: 'GET',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders({
    // Some fields (including _id, preferences) are always loaded (see middlewares/auth)
    userFieldsToInclude: ['party', 'guilds', 'contributor'],
  })],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;
    const group = await Group.getGroup({ user, groupId, populateLeader: false });
    if (!group) {
      throw new NotFound(res.t('groupNotFound'));
    }

    const groupJson = await Group.toJSONCleanChat(group, user);
    groupJson.purchased.plan = group.purchased.plan.toObject();

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    const leader = await User.findById(groupJson.leader).select(`${nameFields} preferences.timezoneOffset preferences.dayStart`).exec();
    if (leader) groupJson.leader = leader.toJSON({ minimize: true });
    if (groupJson.purchased.plan.planId) {
      groupJson.cron.timezoneOffset = leader.preferences.timezoneOffset;
      groupJson.cron.dayStart = leader.preferences.dayStart;
    }
    delete groupJson.leader.preferences;

    res.respond(200, groupJson);
  },
};

/**
 * @api {put} /api/v3/groups/:groupId Update group
 * @apiName UpdateGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                   for tavern are accepted).
 *
 * @apiParamExample {String} Tavern:
 *     /api/v3/groups/habitrpg
 *
 * @apiError (400) {NotAuthorized} messageGroupOnlyLeaderCanUpdate Only the group's leader
 *                                                                 can update the party.
 *
 * @apiSuccess {Object} data The updated group (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Tavern:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tavern",
 *       ...
 *     }
 *
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 *
 * @apiPermission GroupLeader, Admin
 */
api.updateGroup = {
  method: 'PUT',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.checkBody('summary', apiError('summaryLengthExceedsMax')).isLength({ max: MAX_SUMMARY_SIZE_FOR_GUILDS });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    const optionalMembership = Boolean(user.hasPermission('moderator'));
    const group = await Group.getGroup({ user, groupId: req.params.groupId, optionalMembership });

    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (user.hasPermission('moderator')) {
      if (req.body.bannedWordsAllowed === true) {
        group.bannedWordsAllowed = true;
      } else {
        group.bannedWordsAllowed = false;
      }
    }

    if (group.leader !== user._id && group.type === 'party') throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));
    else if (group.leader !== user._id && !user.hasPermission('moderator')) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    if (req.body.leader && req.body.leader !== user._id && group.hasNotCancelled()) {
      throw new NotAuthorized(res.t('cannotChangeLeaderWithActiveGroupPlan'));
    }

    const handleArrays = (currentValue, updatedValue) => {
      if (!_.isArray(currentValue)) {
        return undefined;
      }

      // Previously, categories could get duplicated. By making the updated category list unique,
      // the duplication issue is fixed on every group edit
      return _.uniqBy(updatedValue, 'slug');
    };

    _.assign(group, _.mergeWith(group.toObject(), Group.sanitizeUpdate(req.body), handleArrays));

    const savedGroup = await group.save();
    const response = await Group.toJSONCleanChat(savedGroup, user);

    // If the leader changed fetch new data, otherwise use authenticated user
    if (response.leader !== user._id) {
      const rawLeader = await User.findById(response.leader).select(nameFields).exec();
      response.leader = rawLeader.toJSON({ minimize: true });
    } else {
      response.leader = {
        _id: user._id,
        profile: { name: user.profile.name },
      };
    }
    res.respond(200, response);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/join Join a group
 * @apiName JoinGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 *
 * @apiParamExample {String} Tavern:
 *     /api/v3/groups/habitrpg/join
 *
 * @apiSuccess {Object} data The joined group (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Tavern:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tavern",
 *       ...
 *     }
 *
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 * @apiUse messageGroupRequiresInvite
 */
api.joinGroup = {
  method: 'POST',
  url: '/groups/:groupId/join',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    let inviter;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // Works even if the user is not yet a member of the group
    // Do not fetch chat and work even if the user is not yet a member of the group
    const group = await Group
      .getGroup({ user, groupId: req.params.groupId, optionalMembership: true });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let isUserInvited = false;
    const seekingParty = Boolean(user.party.seeking);

    if (group.type === 'party') {
      // Check if was invited to party
      const inviterParty = _.find(user.invitations.parties, { id: group._id });
      if (inviterParty) {
        // Check if the user is already a member of the party or not. Only make the user leave the
        // party if the user is not a member of the party. See #12291 for more details.
        if (user.party._id !== group._id) {
          inviter = inviterParty.inviter;

          // If user was in a different party (when partying solo you can be invited to a new party)
          // make them leave that party before doing anything
          if (user.party._id) {
            const userPreviousParty = await Group.getGroup({ user, groupId: user.party._id });

            if (userPreviousParty.memberCount === 1 && user.party.quest.key) {
              throw new NotAuthorized(res.t('messageCannotLeaveWhileQuesting'));
            }

            if (userPreviousParty) await userPreviousParty.leave(user);
          }
        }
        // Clear all invitations of new user and reset looking for party state
        user.invitations.parties = [];
        user.invitations.party = {};
        user.party.seeking = null;

        // invite new user to pending quest
        if (group.quest.key && !group.quest.active) {
          user.party.quest.RSVPNeeded = true;
          user.party.quest.key = group.quest.key;
          group.quest.members[user._id] = null;
          group.markModified('quest.members');
        }

        user.party._id = group._id; // Set group as user's party

        isUserInvited = true;
      }
    } else if (group.type === 'guild') {
      const hasInvitation = removeFromArray(user.invitations.guilds, { id: group._id });

      if (hasInvitation) {
        isUserInvited = true;
        inviter = hasInvitation.inviter;
      } else {
        isUserInvited = group.privacy !== 'private';
      }
    }

    if (isUserInvited && group.type === 'guild') {
      // if user is already a member (party is checked previously)
      if (user.guilds.indexOf(group._id) !== -1) {
        throw new NotAuthorized(res.t('youAreAlreadyInGroup'));
      }
      user.guilds.push(group._id); // Add group to user's guilds
      if (!user.achievements.joinedGuild) {
        user.achievements.joinedGuild = true;
        user.addNotification('GUILD_JOINED_ACHIEVEMENT');
      }
    }
    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    // @TODO: Review the need for this and if still needed, don't base this on memberCount
    if (!group.hasNotCancelled() && group.memberCount === 0) {
      group.leader = user._id; // If new user is only member -> set as leader
    }

    if (group.type === 'party') {
      // For parties we count the number of members from the database to get the correct value.
      // See #12275 on why this is necessary and only done for parties.
      const currentMembers = await group.getMemberCount();
      group.memberCount = currentMembers + 1;
    } else {
      group.memberCount += 1;
    }

    let promises = [group.save(), user.save()];

    // Load the inviter
    if (inviter) inviter = await User.findById(inviter).exec();

    // Check the inviter again, could be a deleted account
    if (inviter) {
      const data = {
        headerText: common.i18n.t('invitationAcceptedHeader', inviter.preferences.language),
        bodyText: common.i18n.t('invitationAcceptedBody', {
          groupName: group.name,
          username: user.profile.name,
        }, inviter.preferences.language),
      };
      inviter.addNotification('GROUP_INVITE_ACCEPTED', data);

      // Reward Inviter
      if (group.type === 'party') {
        if (!inviter.items.quests.basilist) {
          inviter.items.quests.basilist = 0;
        }
        inviter.items.quests.basilist += 1;
        inviter.markModified('items.quests');
      }
    }

    if (group.type === 'party' && inviter) {
      if (group.memberCount > 1) {
        const notification = new UserNotification({ type: 'ACHIEVEMENT_PARTY_UP' });

        promises.push(User.update(
          {
            $or: [{ 'party._id': group._id }, { _id: user._id }],
            'achievements.partyUp': { $ne: true },
            _id: { $ne: inviter._id },
          },
          {
            $set: { 'achievements.partyUp': true },
            $push: { notifications: notification.toObject() },
          },
          { multi: true },
        ).exec());

        if (inviter) {
          if (inviter.achievements.partyUp !== true) {
            inviter.achievements.partyUp = true;
            inviter.addNotification('ACHIEVEMENT_PARTY_UP');
          }
        }
      }

      if (group.memberCount > 3) {
        const notification = new UserNotification({ type: 'ACHIEVEMENT_PARTY_ON' });

        promises.push(User.update(
          {
            $or: [{ 'party._id': group._id }, { _id: user._id }],
            'achievements.partyOn': { $ne: true },
            _id: { $ne: inviter._id },
          },
          {
            $set: { 'achievements.partyOn': true },
            $push: { notifications: notification.toObject() },
          },
          { multi: true },
        ).exec());

        if (inviter) {
          if (inviter.achievements.partyOn !== true) {
            inviter.achievements.partyOn = true;
            inviter.addNotification('ACHIEVEMENT_PARTY_ON');
          }
        }
      }
    }

    const analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: false,
      groupId: group._id,
      groupType: group.type,
      privacy: group.privacy,
      headers: req.headers,
      invited: isUserInvited,
    };
    if (group.type === 'party') {
      analyticsObject.seekingParty = seekingParty;
    }
    if (group.privacy === 'public') {
      analyticsObject.groupName = group.name;
    }

    if (inviter) promises.push(inviter.save());
    promises = await Promise.all(promises);

    if (group.hasNotCancelled()) {
      await payments.addSubToGroupUser(user, group);
      await group.updateGroupPlan();
    }

    const response = await Group.toJSONCleanChat(promises[0], user);
    const leader = await User.findById(response.leader).select(nameFields).exec();
    if (leader) {
      response.leader = leader.toJSON({ minimize: true });
    }

    res.analytics.track('join group', analyticsObject);

    res.respond(200, response);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/reject-invite Reject a group invitation
 * @apiName RejectGroupInvite
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/reject-invite
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse groupIdRequired
 * @apiUse messageGroupRequiresInvite
 */
api.rejectGroupInvite = {
  method: 'POST',
  url: '/groups/:groupId/reject-invite',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;
    let isUserInvited = false;

    const hasPartyInvitation = removeFromArray(user.invitations.parties, { id: groupId });
    if (hasPartyInvitation) {
      user.invitations.party = user.invitations.parties.length > 0
        ? user.invitations.parties[user.invitations.parties.length - 1]
        : {};
      user.markModified('invitations.party');
      isUserInvited = true;
    } else {
      const hasInvitation = removeFromArray(user.invitations.guilds, { id: groupId });

      if (hasInvitation) {
        isUserInvited = true;
      }
    }

    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    await user.save();

    res.respond(200, {});
  },
};

function _removeMessagesFromMember (member, groupId) {
  if (member.newMessages[groupId]) {
    delete member.newMessages[groupId];
    member.markModified('newMessages');
  }

  member.notifications = member.notifications.filter(n => {
    if (n && n.type === 'NEW_CHAT_MESSAGE' && n.data && n.data.group && n.data.group.id === groupId) {
      return false;
    }

    return true;
  });
}

/**
 * @api {post} /api/v3/groups/:groupId/leave Leave a group
 * @apiName LeaveGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                    for tavern are accepted).
 * @apiParam (Query) {String="remove-all","keep-all"} keep=keep-all Whether or not to keep
 *                                                                  challenge tasks belonging to
 *                                                                  the group being left.
 * @apiParam (Body) {String="remain-in-challenges"
 *                  ,"leave-challenges"} [keepChallenges=leave-challenges] Whether or not
 *                                                                         to remain in the
 *                                                                         challenges of the
 *                                                                         group being left.
 *
 * @apiParamExample {json} Leave Party:
 *     /api/v3/groups/party/leave
 *     {
 *       "keepChallenges": "remain-in-challenges"
 *     }
 *
 * @apiError (400) {BadRequest} keepOrRemoveAll "keep" parameter is not "remove-all" or "keep-all"
 * @apiError (400) {NotAuthorized} questLeaderCannotLeaveGroup User could not leave party because
 *                                                             they are the owner of a quest
 *                                                             currently running.
 * @apiError (400) {NotAuthorized} cannotLeaveWhileActiveQuest User could not leave party due to
 *                                                             being in a quest.
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 */
api.leaveGroup = {
  method: 'POST',
  url: '/groups/:groupId/leave',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    // When removing the user from challenges, should we keep the tasks?
    req.checkQuery('keep', apiError('keepOrRemoveAll')).optional().isIn(['keep-all', 'remove-all']);
    req.checkBody('keepChallenges', apiError('groupRemainOrLeaveChallenges')).optional().isIn(['remain-in-challenges', 'leave-challenges']);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;
    const group = await Group.getGroup({
      user, groupId, fields: '-chat', requireMembership: true,
    });
    if (!group) {
      throw new NotFound(res.t('groupNotFound'));
    }

    // During quests, check if user can leave
    if (group.type === 'party') {
      if (group.quest && group.quest.leader === user._id) {
        throw new NotAuthorized(res.t('questLeaderCannotLeaveGroup'));
      }

      if (
        group.quest && group.quest.active
        && group.quest.members && group.quest.members[user._id]
      ) {
        throw new NotAuthorized(res.t('cannotLeaveWhileActiveQuest'));
      }
    }

    await group.leave(user, req.query.keep, req.body.keepChallenges);
    _removeMessagesFromMember(user, group._id);
    await user.save();

    if (group.hasNotCancelled()) await group.updateGroupPlan(true);
    res.respond(200, {});
  },
};

// Send an email to the removed user with an optional message from the leader
function _sendMessageToRemoved (group, removedUser, message, isInGroup) {
  if (removedUser.preferences.emailNotifications.kickedGroup !== false) {
    const subject = isInGroup ? `kicked-from-${group.type}` : `${group.type}-invite-rescinded`;
    sendTxnEmail(removedUser, subject, [
      { name: 'GROUP_NAME', content: group.name },
      { name: 'MESSAGE', content: message },
      { name: 'GUILDS_LINK', content: '/groups/discovery' },
      { name: 'PARTY_WANTED_GUILD', content: '/groups/guild/f2db2a7f-13c5-454d-b3ee-ea1f5089e601' },
    ]);
  }
}

/**
 * @api {post} /api/v3/groups/:groupId/removeMember/:memberId Remove a member from a group
 * @apiName RemoveGroupMember
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                   for tavern are accepted).
 * @apiParam (Path) {UUID} memberId The _id of the member to remove
 * @apiParam (Query) {String} message Query parameter - The message to send to the removed members
 *
 * @apiParamExample {URL} Remove member from party:
 *     /api/v3/groups/party/removeMember/[User's ID]?message=Bye
 *
 * @apiError (400) {BadRequest} userIdrequired "memberId" cannot be empty or not a UUID
 * @apiError (401) {NotAuthorized} onlyLeaderCanRemoveMember Only the group
                                                             leader can remove members.
 * @apiError (401) {NotAuthorized} memberCannotRemoveYourself Group leader cannot remove themselves
 * @apiError (401) {NotAuthorized} cannotRemoveQuestOwner Group leader cannot remove
                                                          the owner of an active quest
 * @apiError (404) {NotFound} groupMemberNotFound Group member was not found
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiPermission GroupLeader, Admin
 *
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 */
api.removeGroupMember = {
  method: 'POST',
  url: '/groups/:groupId/removeMember/:memberId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.checkParams('memberId', res.t('userIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    const optionalMembership = Boolean(user.hasPermission('moderator'));
    const group = await Group.getGroup({
      user, groupId: req.params.groupId, optionalMembership, fields: '-chat',
    }); // Do not fetch chat

    if (!group) throw new NotFound(res.t('groupNotFound'));

    const uuid = req.params.memberId;

    if (group.leader !== user._id && group.type === 'party') throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
    if (group.leader !== user._id && !user.hasPermission('moderator')) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));

    if (group.leader === uuid && user.hasPermission('moderator')) throw new NotAuthorized(res.t('cannotRemoveCurrentLeader'));

    if (user._id === uuid) throw new NotAuthorized(res.t('memberCannotRemoveYourself'));

    const member = await User.findOne({ _id: uuid }).exec();

    // We're removing the user from a guild or a party? is the user invited only?
    let isInGroup;
    if (member.party._id === group._id) {
      isInGroup = 'party';
    } else if (member.guilds.indexOf(group._id) !== -1) {
      isInGroup = 'guild';
    }

    let isInvited;
    if (_.find(member.invitations.parties, { id: group._id })) {
      isInvited = 'party';
    } else if (_.findIndex(member.invitations.guilds, { id: group._id }) !== -1) {
      isInvited = 'guild';
    }

    if (isInGroup) {
      // For parties we count the number of members from the database to get the correct value.
      // See #12275 on why this is necessary and only done for parties.
      if (group.type === 'party') {
        const currentMembers = await group.getMemberCount();
        group.memberCount = currentMembers - 1;
      } else {
        group.memberCount -= 1;
      }

      if (group.quest && group.quest.leader === member._id) {
        throw new NotAuthorized(res.t('cannotRemoveQuestOwner'));
      } else if (group.quest && group.quest.members) {
        // remove member from quest
        delete group.quest.members[member._id];
        group.markModified('quest.members');
      }

      if (isInGroup === 'guild') {
        removeFromArray(member.guilds, group._id);
      }
      if (isInGroup === 'party') {
        member.party._id = undefined; // TODO remove quest information too? Use group.leave()?
      }

      _removeMessagesFromMember(member, group._id);

      if (group.quest && group.quest.active && group.quest.leader === member._id) {
        member.items.quests[group.quest.key] += 1;
        member.markModified('items.quests');
      }
    } else if (isInvited) {
      if (isInvited === 'guild') {
        removeFromArray(member.invitations.guilds, { id: group._id });
      }
      if (isInvited === 'party') {
        removeFromArray(member.invitations.parties, { id: group._id });
        member.invitations.party = member.invitations.parties.length > 0
          ? member.invitations.parties[member.invitations.parties.length - 1]
          : {};
        member.markModified('invitations.party');
      }
    } else {
      throw new NotFound(res.t('groupMemberNotFound'));
    }

    const message = req.query.message || req.body.message;
    _sendMessageToRemoved(group, member, message, isInGroup);

    await Promise.all([
      member.save(),
      group.save(),
    ]);

    if (isInGroup && group.hasNotCancelled()) {
      await group.updateGroupPlan(true);
      await payments.cancelGroupSubscriptionForUser(member, group, true);
    }

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/invite Invite users to a group
 * @apiName InviteToGroup
 * @apiGroup Group
 * @apiDescription You can provide both `emails` and `uuids`, or just one.
 * You must provide at least one.
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                   for tavern are accepted)
 *
 * @apiParam (Body) {Object[]} [emails] An array of objects, each representing one
 *                                      email address to invite.
 * @apiParam (Body) {String} emails.email The email address of the user being invited.
 * @apiParam (Body) {String} [emails.name] The name of the user being invited.
 * @apiParam (Body) {Array} [uuids] An array of uuids to invite
 *
 * @apiParamExample {json} Emails
 * {
 *   "emails": [
 *     {"email": "user-1@example.com"},
 *     {"name": "User2", "email": "user-2@example.com"}
 *   ]
 * }
 * @apiParamExample {json} User IDs
 *   {
 *     "uuids": ["user-id-of-existing-user", "user-id-of-another-existing-user"]
 *   }
 * @apiParamExample {json} User IDs and Emails
 * {
 *   "emails": [
 *       {"email": "user-1@example.com"},
 *       {"email": "user-2@example.com"}
 *   ],
 *   "uuids": ["user-id-of-existing-user"]
 * }
 *
 * @apiSuccess {Array} data The invites
 * @apiSuccess {Object} data[0] If the invitation was a User ID, you'll receive back an object.
 *                              You'll receive one Object for each successful User ID invite.
 * @apiSuccess {String} data[1] If the invitation was an email, you'll receive back the email.
 *                              You'll receive one String for each successful email invite.
 *
 * @apiSuccessExample {json} Successful Response with Emails
 * {
 *   "data": [
 *      "user-1@example.com",
 *      "user-2@exmaple.com"
 *   ]
 * }
 *
 * @apiSuccessExample {json} Successful Response with User ID
 * {
 *   "data": [
 *     { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' }
 *   ]
 * }
 * @apiSuccessExample {json} Successful Response with User IDs and Emails
 * {
 *   "data": [
 *     "user-1@example.com",
 *     { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' },
 *     "user-2@exmaple.com"
 *   ]
 * }
 *
 * @apiUse GroupBodyInvalid
 *
 * @apiError (400) {BadRequest} NoEmailProvided An email address was not provided
 *                                              in the `emails` body param `Array`.
 * @apiError (400) {BadRequest} UuidOrEmailOnly The `emails` and `uuids` params
 *                                              were both missing and/or a.
 *                                              key other than `emails` or `uuids` was provided
 *                                              in the body param.
 * @apiError (400) {BadRequest} CannotInviteSelf User ID or email of invitee matches
 *                                               that of the inviter.
 * @apiError (400) {BadRequest} MustBeArray The `uuids` or `emails` body param was not an array.
 * @apiError (400) {BadRequest} TooManyInvites A max of 100 invites (combined
 *                                             emails and User IDs) can
 *                                             be sent out at a time.
 * @apiError (400) {BadRequest} ExceedsMembersLimit A max of 30 members can join a party.
 *
 * @apiError (401) {NotAuthorized} UserAlreadyInvited The user has already
 *                                                    been invited to the group.
 * @apiError (401) {NotAuthorized} UserAlreadyInGroup The user is already a member of the group.
 * @apiError (401) {NotAuthorized} CannotInviteWhenMuted You cannot invite anyone
 *                                                       to a guild or party because your
 *                                                       chat privileges have been revoked.
 * @apiError (401) {NotAuthorized} NotAuthorizedToSendMessageToThisUser You can't send a
 *                                                                      message to this player
 *                                                                      because they have chosen to
 *                                                                      block messages.
 *
 * @apiUse GroupNotFound
 * @apiUse UserNotFound
 * @apiUse PartyNotFound
 */
api.inviteToGroup = {
  method: 'POST',
  url: '/groups/:groupId/invite',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    if (user.flags.chatRevoked) throw new NotAuthorized(res.t('chatPrivilegesRevoked'));

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    if (user.invitesSent >= MAX_EMAIL_INVITES_BY_USER) throw new NotAuthorized(res.t('inviteLimitReached', { techAssistanceEmail: TECH_ASSISTANCE_EMAIL }));

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: '-chat' });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.purchased && group.purchased.plan.customerId && user._id !== group.leader) throw new NotAuthorized(res.t('onlyGroupLeaderCanInviteToGroupPlan'));

    const {
      uuids,
      emails,
      usernames,
    } = req.body;

    await Group.validateInvitations({
      uuids,
      emails,
      usernames,
    }, res, group);

    const results = [];

    if (uuids) {
      const uuidInvites = uuids.map(uuid => inviteByUUID(uuid, group, user, req, res));
      const uuidResults = await Promise.all(uuidInvites);
      results.push(...uuidResults);
    }

    if (emails) {
      const emailInvites = emails.map(invite => inviteByEmail(invite, group, user, req, res));
      user.invitesSent += emails.length;
      await user.save();
      const emailResults = await Promise.all(emailInvites);
      results.push(...emailResults);
    }

    if (usernames) {
      const usernameInvites = usernames
        .map(username => inviteByUserName(username, group, user, req, res));
      const usernameResults = await Promise.all(usernameInvites);
      results.push(...usernameResults);
    }

    res.respond(200, results);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/add-manager Add a manager to a group
 * @apiName AddGroupManager
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/add-manager
 *
 * @apiParam (Body) {UUID} managerId The user _id of the member to promote to manager
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiError (400) {NotAuthorized} managerId req.body.managerId is required
 * @apiUse groupIdRequired
 */
api.addGroupManager = {
  method: 'POST',
  url: '/groups/:groupId/add-manager',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { managerId } = req.body;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'
    req.checkBody('managerId', apiError('managerIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newManager = await User.findById(managerId, 'guilds party').exec();
    const groupFields = basicGroupFields.concat(' managers');
    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: groupFields });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    const isMember = group.isMember(newManager);
    if (!isMember) throw new NotAuthorized(res.t('userMustBeMember'));

    group.managers[managerId] = true;
    group.markModified('managers');
    await group.save();

    res.respond(200, group);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/remove-manager Remove a manager from a group
 * @apiName RemoveGroupManager
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/add-manager
 *
 * @apiParam (Body) {UUID} managerId The user _id of the member to remove
 *
 * @apiSuccess {Object} group The group
 *
 * @apiError (400) {NotAuthorized} managerId req.body.managerId is required
 * @apiUse groupIdRequired
 */
api.removeGroupManager = {
  method: 'POST',
  url: '/groups/:groupId/remove-manager',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { managerId } = req.body;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'
    req.checkBody('managerId', apiError('managerIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const groupFields = basicGroupFields.concat(' managers');
    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields: groupFields });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    if (!group.managers[managerId]) throw new NotAuthorized(res.t('userIsNotManager'));

    delete group.managers[managerId];
    group.markModified('managers');
    await group.save();

    const manager = await User.findById(managerId, 'notifications').exec();
    const newNotifications = manager.notifications.filter(notification => {
      const isGroupTaskNotification = notification && notification.type && notification.type.indexOf('GROUP_TASK_') === 0;

      return !isGroupTaskNotification;
    });
    manager.notifications = newNotifications;
    manager.markModified('notifications');
    await manager.save();

    res.respond(200, group);
  },
};

/**
 * @api {get} /api/v3/group-plans Get group plans for a user
 * @apiName GetGroupPlans
 * @apiGroup Group
 *
 * @apiSuccess {Object[]} data An array of the requested groups with a group plan (See <a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js" target="_blank">/website/server/models/group.js</a>)
 *
 * @apiSuccessExample {json} Groups the user is in with a group plan:
 *     HTTP/1.1 200 OK
 *     [
 *       {groupPlans}
 *     ]
 */
api.getGroupPlans = {
  method: 'GET',
  url: '/group-plans',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    const userGroups = user.getGroups();

    const groups = await Group
      .find({
        _id: { $in: userGroups },
      })
      .select('leaderOnly leader purchased name managers')
      .exec();

    const groupPlans = groups.filter(group => group.hasActiveGroupPlan());

    res.respond(200, groupPlans);
  },
};

/**
 * @api {get} /api/v3/looking-for-party Get users in search of parties
 * @apiName GetLookingForParty
 * @apiGroup Group
 *
 * @apiParam (Query) {Number} [page] Page number, defaults to 0
 *
 * @apiSuccess {Object[]} data An array of users looking for a party
 *
 * @apiError (400) {BadRequest} notPartyLeader You are not the leader of a Party.
 */
api.getLookingForParty = {
  method: 'GET',
  url: '/looking-for-party',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const USERS_PER_PAGE = 30;
    const { user } = res.locals;

    req.checkQuery('page').optional().isInt({ min: 0 }, apiError('queryPageInteger'));
    const PAGE = req.query.page || 0;
    const PAGE_START = USERS_PER_PAGE * PAGE;

    const partyLed = await Group
      .findOne({
        type: 'party',
        leader: user._id,
      })
      .select('_id')
      .exec();

    if (!partyLed) {
      throw new BadRequest(apiError('notPartyLeader'));
    }

    const seekers = await User
      .find({
        'party.seeking': { $exists: true },
        'invitations.party.id': { $exists: false },
        'auth.timestamps.loggedin': {
          $gt: moment().subtract(7, 'days').toDate(),
        },
      })
      // eslint-disable-next-line no-multi-str
      .select('_id auth.blocked auth.local.username auth.timestamps backer contributor.level \
        flags.chatRevoked flags.classSelected inbox.blocks invitations.party items.gear.costume \
        items.gear.equipped loginIncentives party._id preferences.background preferences.chair \
        preferences.costume preferences.hair preferences.shirt preferences.size preferences.skin \
        preferences.language profile.name stats.buffs stats.class stats.lvl')
      .sort('-auth.timestamps.loggedin')
      .exec();

    const filteredSeekers = seekers.filter(seeker => {
      if (seeker.party._id) return false;
      if (seeker.flags.chatRevoked) return false;
      if (seeker.auth.blocked) return false;
      if (seeker.inbox.blocks.indexOf(user._id) !== -1) return false;
      if (user.inbox.blocks.indexOf(seeker._id) !== -1) return false;
      return true;
    }).slice(PAGE_START, PAGE_START + USERS_PER_PAGE);

    const cleanedSeekers = filteredSeekers.map(seeker => ({
      _id: seeker._id,
      auth: {
        local: {
          username: seeker.auth.local.username,
        },
        timestamps: seeker.auth.timestamps,
      },
      backer: seeker.backer,
      contributor: seeker.contributor,
      flags: seeker.flags,
      invited: false,
      items: seeker.items,
      loginIncentives: seeker.loginIncentives,
      preferences: seeker.preferences,
      profile: seeker.profile,
      stats: seeker.stats,
    }));

    res.respond(200, cleanedSeekers);
  },
};

export default api;
