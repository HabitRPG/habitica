import { authWithHeaders } from '../../middlewares/auth';
import Bluebird from 'bluebird';
import _ from 'lodash';
import nconf from 'nconf';
import {
  model as Group,
  basicFields as basicGroupFields,
} from '../../models/group';
import {
  model as User,
  nameFields,
} from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import { removeFromArray } from '../../libs/collectionManipulators';
import { sendTxn as sendTxnEmail } from '../../libs/email';
import { encrypt } from '../../libs/encryption';
import { sendNotification as sendPushNotification } from '../../libs/pushNotifications';
import pusher from '../../libs/pusher';
import common from '../../../common';
import payments from '../../libs/payments';
import stripePayments from '../../libs/stripePayments';
import amzLib from '../../libs/amazonPayments';
import shared from '../../../common';
import apiMessages from '../../libs/apiMessages';

const MAX_EMAIL_INVITES_BY_USER = 200;
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL');

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
 * @apiError (400) {NotAuthorized} messageGroupRequiresInvite Group requires an invitation to join (e.g. private group, party)
 */

/**
 * @apiDefine GroupLeader Group Leader
 * The group leader can use this route.
 */

let api = {};

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
 * @apiError (400) {NotAuthorized} messageInsufficientGems User does not have enough gems (4)
 * @apiError (400) {NotAuthorized} partyMustbePrivate Party must have privacy set to private
 * @apiError (400) {NotAuthorized} messageGroupAlreadyInParty
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
    let user = res.locals.user;
    let group = new Group(Group.sanitize(req.body));
    group.leader = user._id;

    if (group.type === 'guild') {
      if (user.balance < 1) throw new NotAuthorized(res.t('messageInsufficientGems'));

      group.balance = 1;

      user.balance--;
      user.guilds.push(group._id);
      if (!user.achievements.joinedGuild) {
        user.achievements.joinedGuild = true;
        user.addNotification('GUILD_JOINED_ACHIEVEMENT');
      }
      if (user._ABtests && user._ABtests.guildReminder && user._ABtests.counter !== -1) {
        user._ABtests.counter = -1;
        user.markModified('_ABtests');
      }
    } else {
      if (group.privacy !== 'private') throw new NotAuthorized(res.t('partyMustbePrivate'));
      if (user.party._id) throw new NotAuthorized(res.t('messageGroupAlreadyInParty'));

      user.party._id = group._id;
    }

    let results = await Bluebird.all([user.save(), group.save()]);
    let savedGroup = results[1];

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    // await Q.ninvoke(savedGroup, 'populate', ['leader', nameFields]); // doc.populate doesn't return a promise
    let response = savedGroup.toJSON();
    // the leader is the authenticated user
    response.leader = {
      _id: user._id,
      profile: {name: user.profile.name},
    };

    let analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: true,
      groupType: savedGroup.type,
      privacy: savedGroup.privacy,
      headers: req.headers,
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
    let user = res.locals.user;
    let group = new Group(Group.sanitize(req.body.groupToCreate));

    req.checkBody('paymentType', res.t('paymentTypeRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // @TODO: Change message
    if (group.privacy !== 'private') throw new NotAuthorized(res.t('partyMustbePrivate'));
    group.leader = user._id;
    user.guilds.push(group._id);

    let results = await Bluebird.all([user.save(), group.save()]);
    let savedGroup = results[1];

    // Analytics
    let analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: true,
      groupType: savedGroup.type,
      privacy: savedGroup.privacy,
      headers: req.headers,
    };
    res.analytics.track('join group', analyticsObject);

    if (req.body.paymentType === 'Stripe') {
      let token = req.body.id;
      let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
      let sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;
      let groupId = savedGroup._id;
      let email = req.body.email;
      let headers = req.headers;
      let coupon = req.query.coupon;

      await stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      });
    } else if (req.body.paymentType === 'Amazon') {
      let billingAgreementId = req.body.billingAgreementId;
      let sub = req.body.subscription ? shared.content.subscriptionBlocks[req.body.subscription] : false;
      let coupon = req.body.coupon;
      let groupId = savedGroup._id;
      let headers = req.headers;

      await amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      });
    }

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    // await Q.ninvoke(savedGroup, 'populate', ['leader', nameFields]); // doc.populate doesn't return a promise
    let response = savedGroup.toJSON();
    // the leader is the authenticated user
    response.leader = {
      _id: user._id,
      profile: {name: user.profile.name},
    };

    res.respond(201, response); // do not remove chat flags data as we've just created the group
  },
};

/**
 * @api {get} /api/v3/groups Get groups for a user
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam (Query) {String} type The type of groups to retrieve. Must be a query string representing a list of values like 'tavern,party'. Possible values are party, guilds, privateGuilds, publicGuilds, tavern
 * @apiParam (Query) {String="true","false"} [paginate] Public guilds support pagination. When true guilds are returned in groups of 30
 * @apiParam (Query) {Number} [page] When pagination is enabled for public guilds this parameter can be used to specify the page number (the initial page is number 0 and not required)
 *
 * @apiParamExample {json} Private Guilds, Tavern:
 *     {
 *       "type": "privateGuilds,tavern"
 *     }
 *
 * @apiError (400) {BadRequest} groupTypesRequired Group types are required
 * @apiError (400) {BadRequest} guildsPaginateBooleanString Paginate query parameter must be a boolean (true or false)
 * @apiError (400) {BadRequest} guildsPageInteger Page query parameter must be a positive integer
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
    let user = res.locals.user;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty();
    // pagination options, can only be used with public guilds
    req.checkQuery('paginate').optional().isIn(['true', 'false'], apiMessages('guildsPaginateBooleanString'));
    req.checkQuery('page').optional().isInt({min: 0}, apiMessages('guildsPageInteger'));

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let types = req.query.type.split(',');

    let paginate = req.query.paginate === 'true' ? true : false;
    if (paginate && !_.includes(types, 'publicGuilds')) {
      throw new BadRequest(apiMessages('guildsOnlyPaginate'));
    }

    let groupFields = basicGroupFields.concat(' description memberCount balance');
    let sort = '-memberCount';

    let filters = {};
    if (req.query.categories) {
      let categorySlugs = req.query.categories.split(',');
      filters.categories = { $elemMatch: { slug: {$in: categorySlugs} } };
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
      const searchWords = req.query.search.split(' ').join('|');
      const searchQuery = { $regex: new RegExp(`${searchWords}`, 'i') };
      filters.$or.push({name: searchQuery});
      filters.$or.push({description: searchQuery});
    }

    let results = await Group.getGroups({
      user, types, groupFields, sort,
      paginate, page: req.query.page, filters,
    });
    res.respond(200, results);
  },
};

/**
 * @api {get} /api/v3/groups/:groupId Get group
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
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
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let group = await Group.getGroup({user, groupId, populateLeader: false});
    if (!group) {
      throw new NotFound(res.t('groupNotFound'));
    }

    let groupJson = Group.toJSONCleanChat(group, user);

    if (groupJson.leader === user._id) {
      groupJson.purchased.plan = group.purchased.plan.toObject();
    }

    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    let leader = await User.findById(groupJson.leader).select(nameFields).exec();
    if (leader) groupJson.leader = leader.toJSON({minimize: true});

    res.respond(200, groupJson);
  },
};

/**
 * @api {put} /api/v3/groups/:groupId Update group
 * @apiName UpdateGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParamExample {String} Tavern:
 *     /api/v3/groups/habitrpg
 *
 * @apiError (400) {NotAuthorized} messageGroupOnlyLeaderCanUpdate Only the group's leader can update the party
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
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    let optionalMembership = Boolean(user.contributor.admin);
    let group = await Group.getGroup({user, groupId: req.params.groupId, optionalMembership});

    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id && group.type === 'party') throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));
    else if (group.leader !== user._id && !user.contributor.admin) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    if (req.body.leader !== user._id && group.hasNotCancelled()) throw new NotAuthorized(res.t('cannotChangeLeaderWithActiveGroupPlan'));

    _.assign(group, _.merge(group.toObject(), Group.sanitizeUpdate(req.body)));

    let savedGroup = await group.save();
    let response = Group.toJSONCleanChat(savedGroup, user);

    // If the leader changed fetch new data, otherwise use authenticated user
    if (response.leader !== user._id) {
      let rawLeader = await User.findById(response.leader).select(nameFields).exec();
      response.leader = rawLeader.toJSON({minimize: true});
    } else {
      response.leader = {
        _id: user._id,
        profile: {name: user.profile.name},
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
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
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
    let user = res.locals.user;
    let inviter;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // Works even if the user is not yet a member of the group
    let group = await Group.getGroup({user, groupId: req.params.groupId, optionalMembership: true}); // Do not fetch chat and work even if the user is not yet a member of the group
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let isUserInvited = false;

    if (group.type === 'party') {
      // Check if was invited to party
      let inviterParty = _.find(user.invitations.parties, {id: group._id});
      if (inviterParty) {
        inviter = inviterParty.inviter;

        // Clear all invitations of new user
        user.invitations.parties = [];
        user.invitations.party = {};

        // invite new user to pending quest
        if (group.quest.key && !group.quest.active) {
          user.party.quest.RSVPNeeded = true;
          user.party.quest.key = group.quest.key;
          group.quest.members[user._id] = null;
          group.markModified('quest.members');
        }

        // If user was in a different party (when partying solo you can be invited to a new party)
        // make them leave that party before doing anything
        if (user.party._id) {
          let userPreviousParty = await Group.getGroup({user, groupId: user.party._id});
          if (userPreviousParty) await userPreviousParty.leave(user);
        }

        user.party._id = group._id; // Set group as user's party

        isUserInvited = true;
      }
    } else if (group.type === 'guild') {
      let hasInvitation = removeFromArray(user.invitations.guilds, { id: group._id });

      if (hasInvitation) {
        isUserInvited = true;
        inviter = hasInvitation.inviter;
      } else {
        isUserInvited = group.privacy === 'private' ? false : true;
      }
    }

    if (isUserInvited && group.type === 'guild') {
      if (user.guilds.indexOf(group._id) !== -1) { // if user is already a member (party is checked previously)
        throw new NotAuthorized(res.t('userAlreadyInGroup'));
      }
      user.guilds.push(group._id); // Add group to user's guilds
      if (!user.achievements.joinedGuild) {
        user.achievements.joinedGuild = true;
        user.addNotification('GUILD_JOINED_ACHIEVEMENT');
      }
      if (user._ABtests && user._ABtests.guildReminder && user._ABtests.counter !== -1) {
        user._ABtests.counter = -1;
        user.markModified('_ABtests');
      }
    }
    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    if (group.memberCount === 0) group.leader = user._id; // If new user is only member -> set as leader

    if (group.hasNotCancelled())  {
      await payments.addSubToGroupUser(user, group);
      await group.updateGroupPlan();
    }

    group.memberCount += 1;

    let promises = [group.save(), user.save()];

    if (inviter) {
      inviter = await User.findById(inviter).exec();

      let data = {
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
        inviter.items.quests.basilist++;
      }
      promises.push(inviter.save());
    }

    if (group.type === 'party' && inviter) {
      if (group.memberCount > 1) {
        promises.push(User.update({
          $or: [{'party._id': group._id}, {_id: user._id}],
          'achievements.partyUp': {$ne: true},
        }, {$set: {'achievements.partyUp': true}}, {multi: true}).exec());
      }
      if (group.memberCount > 3) {
        promises.push(User.update({
          $or: [{'party._id': group._id}, {_id: user._id}],
          'achievements.partyOn': {$ne: true},
        }, {$set: {'achievements.partyOn': true}}, {multi: true}).exec());
      }
    }

    promises = await Bluebird.all(promises);

    let response = Group.toJSONCleanChat(promises[0], user);
    let leader = await User.findById(response.leader).select(nameFields).exec();
    if (leader) {
      response.leader = leader.toJSON({minimize: true});
    }

    let analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      owner: false,
      groupType: group.type,
      privacy: group.privacy,
      headers: req.headers,
    };

    if (group.privacy === 'public') {
      analyticsObject.groupName = group.name;
    }

    res.analytics.track('join group', analyticsObject);

    res.respond(200, response);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/reject Reject a group invitation
 * @apiName RejectGroupInvite
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/reject
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
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let isUserInvited = false;

    let hasPartyInvitation = removeFromArray(user.invitations.parties, { id: groupId });
    if (hasPartyInvitation) {
      user.invitations.party = user.invitations.parties.length > 0 ? user.invitations.parties[user.invitations.parties.length - 1] : {};
      user.markModified('invitations.party');
      isUserInvited = true;
    } else {
      let hasInvitation = removeFromArray(user.invitations.guilds, { id: groupId });

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
}

/**
 * @api {post} /api/v3/groups/:groupId/leave Leave a group
 * @apiName LeaveGroup
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam (Query) {String="remove-all","keep-all"} keep=keep-all Whether or not to keep challenge tasks belonging to the group being left.
 * @apiParam (Body) {String="remain-in-challenges","leave-challenges"} [keepChallenges=leave-challenges] Whether or not to remain in the challenges of the group being left.
 *
 * @apiParamExample {json} Leave Party:
 *     /api/v3/groups/party/leave
 *     {
 *       "keepChallenges": "remain-in-challenges"
 *     }
 *
 * @apiError (400) {BadRequest} keepOrRemoveAll "keep" parameter is not "remove-all" or "keep-all"
 * @apiError (400) {NotAuthorized} questLeaderCannotLeaveGroup User could not leave party because they are the owner of a quest currently running
 * @apiError (400) {NotAuthorized} cannotLeaveWhileActiveQuest User could not leave party due to being in a quest
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
    let user = res.locals.user;
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    // When removing the user from challenges, should we keep the tasks?
    req.checkQuery('keep', res.t('keepOrRemoveAll')).optional().isIn(['keep-all', 'remove-all']);
    req.checkBody('keepChallenges', res.t('remainOrLeaveChallenges')).optional().isIn(['remain-in-challenges', 'leave-challenges']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let group = await Group.getGroup({user, groupId, fields: '-chat', requireMembership: true});
    if (!group) {
      throw new NotFound(res.t('groupNotFound'));
    }

    // During quests, check if user can leave
    if (group.type === 'party') {
      if (group.quest && group.quest.leader === user._id) {
        throw new NotAuthorized(res.t('questLeaderCannotLeaveGroup'));
      }

      if (group.quest && group.quest.active && group.quest.members && group.quest.members[user._id]) {
        throw new NotAuthorized(res.t('cannotLeaveWhileActiveQuest'));
      }
    }

    await group.leave(user, req.query.keep, req.body.keepChallenges);
    if (group.hasNotCancelled()) await group.updateGroupPlan(true);
    _removeMessagesFromMember(user, group._id);
    await user.save();

    if (group.type !== 'party') {
      let guildIndex = user.guilds.indexOf(group._id);
      user.guilds.splice(guildIndex, 1);
    }

    let isMemberOfGroupPlan = await user.isMemberOfGroupPlan();
    if (!isMemberOfGroupPlan) {
      await payments.cancelGroupSubscriptionForUser(user, group);
    }

    res.respond(200, {});
  },
};

// Send an email to the removed user with an optional message from the leader
function _sendMessageToRemoved (group, removedUser, message, isInGroup) {
  if (removedUser.preferences.emailNotifications.kickedGroup !== false) {
    let subject = isInGroup ? `kicked-from-${group.type}` : `${group.type}-invite-rescinded`;
    sendTxnEmail(removedUser, subject, [
      {name: 'GROUP_NAME', content: group.name},
      {name: 'MESSAGE', content: message},
      {name: 'GUILDS_LINK', content: '/groups/discovery'},
      {name: 'PARTY_WANTED_GUILD', content: '/groups/guild/f2db2a7f-13c5-454d-b3ee-ea1f5089e601'},
    ]);
  }
}

/**
 * @api {post} /api/v3/groups/:groupId/removeMember/:memberId Remove a member from a group
 * @apiName RemoveGroupMember
 * @apiGroup Group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam (Path) {UUID} memberId The _id of the member to remove
 * @apiParam (Query) {String} message Query parameter - The message to send to the removed members
 *
 * @apiParamExample {URL} Remove member from party:
 *     /api/v3/groups/party/removeMember/[User's ID]?message=Bye
 *
 * @apiError (400) {BadRequest} userIdrequired "memberId" cannot be empty or not a UUID
 * @apiError (400) {NotAuthorized} onlyLeaderCanRemoveMember Only the group leader can remove members
 * @apiError (400) {NotAuthorized} memberCannotRemoveYourself Group leader cannot remove themselves
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
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('memberId', res.t('userIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    let optionalMembership = Boolean(user.contributor.admin);
    let group = await Group.getGroup({user, groupId: req.params.groupId, optionalMembership, fields: '-chat'}); // Do not fetch chat

    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuid = req.params.memberId;

    if (group.leader !== user._id && group.type === 'party') throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
    if (group.leader !== user._id && !user.contributor.admin) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));

    if (group.leader === uuid && user.contributor.admin) throw new NotAuthorized(res.t('cannotRemoveCurrentLeader'));

    if (user._id === uuid) throw new NotAuthorized(res.t('memberCannotRemoveYourself'));

    let member = await User.findOne({_id: uuid}).exec();

    // We're removing the user from a guild or a party? is the user invited only?
    let isInGroup;
    if (member.party._id === group._id) {
      isInGroup = 'party';
    } else if (member.guilds.indexOf(group._id) !== -1) {
      isInGroup = 'guild';
    }

    let isInvited;
    if (_.find(member.invitations.parties, {id: group._id})) {
      isInvited = 'party';
    } else if (_.findIndex(member.invitations.guilds, {id: group._id}) !== -1) {
      isInvited = 'guild';
    }

    if (isInGroup) {
      group.memberCount -= 1;
      if (group.hasNotCancelled())  {
        await group.updateGroupPlan(true);
        await payments.cancelGroupSubscriptionForUser(member, group, true);
      }

      if (group.quest && group.quest.leader === member._id) {
        group.quest.key = undefined;
        group.quest.leader = undefined;
      } else if (group.quest && group.quest.members) {
        // remove member from quest
        delete group.quest.members[member._id];
        group.markModified('quest.members');
      }

      if (isInGroup === 'guild') {
        removeFromArray(member.guilds, group._id);
      }
      if (isInGroup === 'party') {
        // Tell the realtime clients that a user is being removed
        // If the user that is being removed is still connected, they'll get disconnected automatically
        pusher.trigger(`presence-group-${group._id}`, 'user-removed', {
          userId: user._id,
        });

        member.party._id = undefined; // TODO remove quest information too? Use group.leave()?
      }

      _removeMessagesFromMember(member, group._id);

      if (group.quest && group.quest.active && group.quest.leader === member._id) {
        member.items.quests[group.quest.key] += 1;
      }
    } else if (isInvited) {
      if (isInvited === 'guild') {
        removeFromArray(member.invitations.guilds, { id: group._id });
      }
      if (isInvited === 'party') {
        removeFromArray(member.invitations.parties, { id: group._id });
        member.invitations.party = member.invitations.parties.length > 0 ? member.invitations.parties[member.invitations.parties.length - 1] : {};
        member.markModified('invitations.party');
      }
    } else {
      throw new NotFound(res.t('groupMemberNotFound'));
    }

    let message = req.query.message || req.body.message;
    _sendMessageToRemoved(group, member, message, isInGroup);

    await Bluebird.all([
      member.save(),
      group.save(),
    ]);
    res.respond(200, {});
  },
};

async function _inviteByUUID (uuid, group, inviter, req, res) {
  let userToInvite = await User.findById(uuid).exec();

  if (!userToInvite) {
    throw new NotFound(res.t('userWithIDNotFound', {userId: uuid}));
  } else if (inviter._id === userToInvite._id) {
    throw new BadRequest(res.t('cannotInviteSelfToGroup'));
  }

  if (group.type === 'guild') {
    if (_.includes(userToInvite.guilds, group._id)) {
      throw new NotAuthorized(res.t('userAlreadyInGroup'));
    }
    if (_.find(userToInvite.invitations.guilds, {id: group._id})) {
      throw new NotAuthorized(res.t('userAlreadyInvitedToGroup'));
    }

    let guildInvite = {id: group._id, name: group.name, inviter: inviter._id};
    if (group.isSubscribed() && !group.hasNotCancelled()) guildInvite.cancelledPlan = true;
    userToInvite.invitations.guilds.push(guildInvite);
  } else if (group.type === 'party') {
    // Do not add to invitations.parties array if the user is already invited to that party
    if (_.find(userToInvite.invitations.parties, {id: group._id})) {
      throw new NotAuthorized(res.t('userAlreadyPendingInvitation'));
    }

    if (userToInvite.party._id) {
      let userParty = await Group.getGroup({user: userToInvite, groupId: 'party', fields: 'memberCount'});

      // Allow user to be invited to a new party when they're partying solo
      if (userParty && userParty.memberCount !== 1) throw new NotAuthorized(res.t('userAlreadyInAParty'));
    }

    let partyInvite = {id: group._id, name: group.name, inviter: inviter._id};
    if (group.isSubscribed() && !group.hasNotCancelled()) partyInvite.cancelledPlan = true;

    userToInvite.invitations.parties.push(partyInvite);
    userToInvite.invitations.party = partyInvite;
  }

  let groupLabel = group.type === 'guild' ? 'Guild' : 'Party';
  let groupTemplate = group.type === 'guild' ? 'guild' : 'party';
  if (userToInvite.preferences.emailNotifications[`invited${groupLabel}`] !== false) {
    let emailVars = [
      {name: 'INVITER', content: inviter.profile.name},
    ];

    if (group.type === 'guild') {
      emailVars.push(
        {name: 'GUILD_NAME', content: group.name},
        {name: 'GUILD_URL', content: '/groups/discovery'}
      );
    } else {
      emailVars.push(
        {name: 'PARTY_NAME', content: group.name},
        {name: 'PARTY_URL', content: '/party'}
      );
    }

    sendTxnEmail(userToInvite, `invited-${groupTemplate}`, emailVars);
  }

  if (userToInvite.preferences.pushNotifications[`invited${groupLabel}`] !== false) {
    let identifier = group.type === 'guild' ? 'invitedGuild' : 'invitedParty';
    sendPushNotification(
      userToInvite,
      {
        title: group.name,
        message: res.t(identifier),
        identifier,
        payload: {groupID: group._id},
      }
    );
  }

  let userInvited = await userToInvite.save();
  if (group.type === 'guild') {
    return userInvited.invitations.guilds[userToInvite.invitations.guilds.length - 1];
  } else if (group.type === 'party') {
    return userInvited.invitations.parties[userToInvite.invitations.parties.length - 1];
  }
}

async function _inviteByEmail (invite, group, inviter, req, res) {
  let userReturnInfo;

  if (!invite.email) throw new BadRequest(res.t('inviteMissingEmail'));

  let userToContact = await User.findOne({$or: [
      {'auth.local.email': invite.email},
      {'auth.facebook.emails.value': invite.email},
      {'auth.google.emails.value': invite.email},
  ]})
    .select({_id: true, 'preferences.emailNotifications': true})
    .exec();

  if (userToContact) {
    userReturnInfo = await _inviteByUUID(userToContact._id, group, inviter, req, res);
  } else {
    userReturnInfo = invite.email;

    let cancelledPlan = false;
    if (group.isSubscribed() && !group.hasNotCancelled()) cancelledPlan = true;

    const groupQueryString = JSON.stringify({
      id: group._id,
      inviter: inviter._id,
      sentAt: Date.now(), // so we can let it expire
      cancelledPlan,
    });
    let link = `/static/front?groupInvite=${encrypt(groupQueryString)}`;

    let variables = [
      {name: 'LINK', content: link},
      {name: 'INVITER', content: req.body.inviter || inviter.profile.name},
    ];

    if (group.type === 'guild') {
      variables.push({name: 'GUILD_NAME', content: group.name});
    }

    // Check for the email address not to be unsubscribed
    let userIsUnsubscribed = await EmailUnsubscription.findOne({email: invite.email}).exec();
    let groupLabel = group.type === 'guild' ? '-guild' : '';
    if (!userIsUnsubscribed) sendTxnEmail(invite, `invite-friend${groupLabel}`, variables);
  }

  return userReturnInfo;
}

/**
 * @api {post} /api/v3/groups/:groupId/invite Invite users to a group
 * @apiName InviteToGroup
 * @apiGroup Group
 * @apiDescription You can provide both `emails` and `uuids`, or just one. You must provide at least one.
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParam (Body) {Object[]} [emails] An array of objects, each representing one email address to invite
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
 * @apiParamExample {json} User Ids
 *   {
 *     "uuids": ["user-id-of-existing-user", "user-id-of-another-existing-user"]
 *   }
 * @apiParamExample {json} User Ids and Emails
 * {
 *   "emails": [
 *       {"email": "user-1@example.com"},
 *       {"email": "user-2@example.com"}
 *   ],
 *   "uuids": ["user-id-of-existing-user"]
 * }
 *
 * @apiSuccess {Array} data The invites
 * @apiSuccess {Object} data[0] If the invitation was a user id, you'll receive back an object. You'll receive one Object for each succesful user id invite.
 * @apiSuccess {String} data[1] If the invitation was an email, you'll receive back the email. You'll receive one String for each successful email invite.
 *
 * @apiSuccessExample {json} Successful Response with Emails
 * {
 *   "data": [
 *      "user-1@example.com",
 *      "user-2@exmaple.com"
 *   ]
 * }
 *
 * @apiSuccessExample {json} Successful Response with User Id
 * {
 *   "data": [
 *     { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' }
 *   ]
 * }
 * @apiSuccessExample {json} Successful Response with User Ids and Emails
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
 * @apiError (400) {BadRequest} NoEmailProvided An email address was not provided in the `emails` body
 * param `Array`.
 * @apiError (400) {BadRequest} UuidOrEmailOnly The `emails` and `uuids` params were both missing and/or a
 * key other than `emails` or `uuids` was provided in the body param.
 * @apiError (400) {BadRequest} CannotInviteSelf User id or email of invitee matches that of the inviter.
 * @apiError (400) {BadRequest} MustBeArray The `uuids` or `emails` body param was not an array.
 * @apiError (400) {BadRequest} TooManyInvites A max of 100 invites (combined emails and user ids) can
 * be sent out at a time.
 * @apiError (400) {BadRequest} ExceedsMembersLimit A max of 30 members can join a party.
 *
 * @apiError (401) {NotAuthorized} UserAlreadyInvited The user has already been invited to the group.
 * @apiError (401) {NotAuthorized} UserAlreadyInGroup The user is already a member of the group.
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
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    if (user.invitesSent >= MAX_EMAIL_INVITES_BY_USER) throw new NotAuthorized(res.t('inviteLimitReached', { techAssistanceEmail: TECH_ASSISTANCE_EMAIL }));

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.purchased && group.purchased.plan.customerId && user._id !== group.leader) throw new NotAuthorized(res.t('onlyGroupLeaderCanInviteToGroupPlan'));

    let uuids = req.body.uuids;
    let emails = req.body.emails;

    await Group.validateInvitations(uuids, emails, res, group);

    let results = [];

    if (uuids) {
      let uuidInvites = uuids.map((uuid) => _inviteByUUID(uuid, group, user, req, res));
      let uuidResults = await Bluebird.all(uuidInvites);
      results.push(...uuidResults);
    }

    if (emails) {
      let emailInvites = emails.map((invite) => _inviteByEmail(invite, group, user, req, res));
      user.invitesSent += emails.length;
      await user.save();
      let emailResults = await Bluebird.all(emailInvites);
      results.push(...emailResults);
    }

    res.respond(200, results);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/add-manager Add a manager to a group
 * @apiName AddGroupManager
 * @apiGroup Group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/add-manager
 *
 * @apiBody (Body) {UUID} managerId The user _id of the member to promote to manager
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
    let user = res.locals.user;
    let managerId = req.body.managerId;

    req.checkParams('groupId', apiMessages('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'
    req.checkBody('managerId', apiMessages('managerIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let newManager = await User.findById(managerId, 'guilds party').exec();
    let groupFields = basicGroupFields.concat(' managers');
    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: groupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    let isMember = group.isMember(newManager);
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
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParamExample {String} party:
 *     /api/v3/groups/party/add-manager
 *
 * @apiBody (Body) {UUID} managerId The user _id of the member to remove
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
    let user = res.locals.user;
    let managerId = req.body.managerId;

    req.checkParams('groupId', apiMessages('groupIdRequired')).notEmpty(); // .isUUID(); can't be used because it would block 'habitrpg' or 'party'
    req.checkBody('managerId', apiMessages('managerIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupFields = basicGroupFields.concat(' managers');
    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: groupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    if (!group.managers[managerId]) throw new NotAuthorized(res.t('userIsNotManager'));

    delete group.managers[managerId];
    group.markModified('managers');
    await group.save();

    let manager = await User.findById(managerId, 'notifications').exec();
    let newNotifications = manager.notifications.filter((notification) => {
      return notification.type !== 'GROUP_TASK_APPROVAL';
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
    let user = res.locals.user;

    const userGroups = user.getGroups();

    const groups = await Group
      .find({
        _id: {$in: userGroups},
      })
      .select('leaderOnly leader purchased name managers')
      .exec();

    let groupPlans = groups.filter(group => {
      return group.isSubscribed();
    });

    res.respond(200, groupPlans);
  },
};

module.exports = api;
