import { authWithHeaders } from '../../middlewares/api-v3/auth';
import Q from 'q';
import _ from 'lodash';
import cron from '../../middlewares/api-v3/cron';
import {
  INVITES_LIMIT,
  model as Group,
} from '../../models/group';
import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import { removeFromArray } from '../../libs/api-v3/collectionManipulators';
import * as firebase from '../../libs/api-v3/firebase';
import { sendTxn as sendTxnEmail } from '../../libs/api-v3/email';
import { encrypt } from '../../libs/api-v3/encryption';

let api = {};

// TODO shall we accept party as groupId in all routes?

/**
 * @api {post} /groups Create group
 * @apiVersion 3.0.0
 * @apiName CreateGroup
 * @apiGroup Group
 *
 * @apiSuccess {Object} group The group object
 */
api.createGroup = {
  method: 'POST',
  url: '/groups',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let group = new Group(Group.sanitize(req.body)); // TODO validate empty req.body
    group.leader = user._id;

    if (group.type === 'guild') {
      if (user.balance < 1) throw new NotAuthorized(res.t('messageInsufficientGems'));

      group.balance = 1;

      user.balance--;
      user.guilds.push(group._id);
    } else {
      if (group.privacy !== 'private') throw new NotAuthorized(res.t('partyMustbePrivate'));
      if (user.party._id) throw new NotAuthorized(res.t('messageGroupAlreadyInParty'));

      user.party._id = group._id;
    }

    let results = await Q.all([user.save(), group.save()]);
    let savedGroup = results[1];

    firebase.updateGroupData(savedGroup);
    firebase.addUserToGroup(savedGroup._id, user._id);

    return res.respond(201, savedGroup); // TODO populate
  },
};

/**
 * @api {get} /groups Get groups
 * @apiVersion 3.0.0
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam {string} type The type of groups to retrieve. Must be a query string representing a list of values like 'tavern,party'. Possible values are party, privateGuilds, publicGuilds, tavern
 *
 * @apiSuccess {Array} groups An array of the requested groups
 */
api.getGroups = {
  method: 'GET',
  url: '/groups',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty(); // TODO better validation

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // TODO validate types are acceptable? probably not necessary
    let types = req.query.type.split(',');
    let groupFields = 'name description memberCount balance';
    let sort = '-memberCount';
    let queries = [];

    types.forEach(type => {
      switch (type) {
        case 'party':
          queries.push(Group.getGroup({user, groupId: 'party', fields: groupFields}));
          break;
        case 'privateGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'private',
            _id: {$in: user.guilds},
          }).select(groupFields).sort(sort).exec());
          break;
        case 'publicGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'public',
          }).select(groupFields).sort(sort).exec()); // TODO use lean?
          break;
        case 'tavern':
          if (types.indexOf('publicGuilds') === -1) {
            queries.push(Group.getGroup({user, groupId: 'habitrpg', fields: groupFields}));
          }
          break;
      }
    });

    // If no valid value for type was supplied, return an error
    if (queries.length === 0) throw new BadRequest(res.t('groupTypesRequired'));

    // TODO we would like not to return a single big array but Q doesn't support the funtionality https://github.com/kriskowal/q/issues/328
    let results = _.reduce(await Q.all(queries), (previousValue, currentValue) => {
      if (_.isEmpty(currentValue)) return previousValue; // don't add anything to the results if the query returned null or an empty array
      return previousValue.concat(Array.isArray(currentValue) ? currentValue : [currentValue]); // otherwise concat the new results to the previousValue
    }, []);

    res.respond(200, results);
  },
};

/**
 * @api {get} /groups/:groupId Get group
 * @apiVersion 3.0.0
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} group The group object
 */
api.getGroup = {
  method: 'GET',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, populateLeader: true});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (!user.contributor.admin) {
      group = group.toJSON();
      _.remove(group.chat, function removeChat (chat) {
        chat.flags = {};
        return chat.flagCount >= 2;
      });
    }

    res.respond(200, group);
  },
};

/**
 * @api {put} /groups/:groupId Update group
 * @apiVersion 3.0.0
 * @apiName UpdateGroup
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Object} group The updated group object
 */
api.updateGroup = {
  method: 'PUT',
  url: '/groups/:groupId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    _.assign(group, _.merge(group.toObject(), Group.sanitizeUpdate(req.body)));

    let savedGroup = await group.save();
    res.respond(200, savedGroup);
    firebase.updateGroupData(savedGroup);
  },
};

/**
 * @api {post} /groups/:groupId/join Join a group
 * @apiVersion 3.0.0
 * @apiName JoinGroup
 * @apiGroup Group
 *
 * @apiParam {UUID} groupId The group _id
 *
 * @apiSuccess {Object} empty An empty object
 */
api.joinGroup = {
  method: 'POST',
  url: '/groups/:groupId/join',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let inviter;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

     // Do not fetch chat and work even if the user is not yet a member of the group
    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat', optionalMembership: true}); // Do not fetch chat and work even if the user is not yet a member of the group
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let isUserInvited = false;

    if (group.type === 'party' && group._id === (user.invitations.party && user.invitations.party.id)) {
      inviter = user.invitations.party.inviter;
      user.invitations.party = {}; // Clear invite TODO mark modified?

      // invite new user to pending quest
      if (group.quest.key && !group.quest.active) {
        user.party.quest.RSVPNeeded = true;
        user.party.quest.key = group.quest.key;
        group.quest.members[user._id] = undefined;
        group.markModified('quest.members');
      }

      user.party._id = group._id; // Set group as user's party

      isUserInvited = true;
    } else if (group.type === 'guild') {
      let hasInvitation = removeFromArray(user.invitations.guilds, { id: group._id });

      if (hasInvitation) {
        isUserInvited = true;
      } else {
        isUserInvited = group.privacy === 'private' ? false : true;
      }
    }

    if (isUserInvited && group.type === 'guild') user.guilds.push(group._id); // Add group to user's guilds
    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    if (group.memberCount === 0) group.leader = user._id; // If new user is only member -> set as leader

    group.memberCount += 1;

    let promises = [group.save(), user.save()];

    if (group.type === 'party' && inviter) {
      promises.push(User.update({_id: inviter}, {$inc: {'items.quests.basilist': 1}}).exec()); // Reward inviter
    }

    await Q.all(promises);

    firebase.addUserToGroup(group._id, user._id);
    res.respond(200, {}); // TODO what to return?
  },
};

/**
 * @api {post} /groups/:groupId/leave Leave a group
 * @apiVersion 3.0.0
 * @apiName LeaveGroup
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 * @apiParam {string="remove-all","keep-all"} keep Wheter to keep or not challenges' tasks, as an optional query string
 *
 * @apiSuccess {Object} empty An empty object
 */
api.leaveGroup = {
  method: 'POST',
  url: '/groups/:groupId/leave',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    // When removing the user from challenges, should we keep the tasks?
    req.checkQuery('keep', res.t('keepOrRemoveAll')).optional().isIn(['keep-all', 'remove-all']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'}); // Do not fetch chat
    if (!group) throw new NotFound(res.t('groupNotFound'));

    // During quests, checke wheter user can leave
    if (group.type === 'party') {
      if (group.quest && group.quest.leader === user._id) {
        throw new NotAuthorized(res.t('questLeaderCannotLeaveGroup'));
      }

      if (group.quest && group.quest.active && group.quest.members && group.quest.members[user._id]) {
        throw new NotAuthorized(res.t('cannotLeaveWhileActiveQuest'));
      }
    }

    await group.leave(user, req.query.keep);
    res.respond(200, {});
  },
};

// Send an email to the removed user with an optional message from the leader
function _sendMessageToRemoved (group, removedUser, message) {
  if (removedUser.preferences.emailNotifications.kickedGroup !== false) {
    sendTxnEmail(removedUser, `kicked-from-${group.type}`, [
      {name: 'GROUP_NAME', content: group.name},
      {name: 'MESSAGE', content: message},
      {name: 'GUILDS_LINK', content: '/#/options/groups/guilds/public'},
      {name: 'PARTY_WANTED_GUILD', content: '/#/options/groups/guilds/f2db2a7f-13c5-454d-b3ee-ea1f5089e601'},
    ]);
  }
}

/**
 * @api {post} /groups/:groupId/removeMember/:memberId Remove a member from a group
 * @apiVersion 3.0.0
 * @apiName RemoveGroupMember
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 * @apiParam {UUID} memberId The _id of the member to remove
 * @apiParam {string} message The message to send to the removed members, as a query string // TODO in req.body?
 *
 * @apiSuccess {Object} empty An empty object
 */
api.removeGroupMember = {
  method: 'POST',
  url: '/groups/:groupId/removeMember/:memberId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('memberId', res.t('userIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'}); // Do not fetch chat
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuid = req.params.memberId;

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
    if (user._id === uuid) throw new NotAuthorized(res.t('memberCannotRemoveYourself'));

    let member = await User.findOne({_id: uuid}).select('party guilds invitations newMessages').exec();

    // We're removing the user from a guild or a party? is the user invited only?
    let isInGroup;
    if (member.party._id === group._id) {
      isInGroup = 'party';
    } else if (member.guilds.indexOf(group._id) !== -1) {
      isInGroup = 'guild';
    }

    let isInvited;
    if (member.invitations.party && member.invitations.party.id === group._id) {
      isInvited = 'party';
    } else if (_.findIndex(member.invitations.guilds, {id: group._id}) !== -1) {
      isInvited = 'guild';
    }

    if (isInGroup) {
      group.memberCount -= 1;

      if (group.quest && group.quest.leader === member._id) {
        group.quest.key = null;
        group.quest.leader = null; // TODO markmodified?
      } else if (group.quest && group.quest.members) {
        // remove member from quest
        group.quest.members[member._id] = undefined;
      }

      if (isInGroup === 'guild') _.pull(member.guilds, group._id);
      if (isInGroup === 'party') member.party._id = undefined; // TODO remove quest information too?

      if (member.newMessages.group) {
        member.newMessages.group._id = undefined;
      }

      if (group.quest && group.quest.active && group.quest.leader === member._id) {
        member.items.quests[group.quest.key] += 1; // TODO why this?
      }
    } else if (isInvited) {
      if (isInvited === 'guild') {
        removeFromArray(member.invitations.guilds, { id: group._id });
      }
      if (isInvited === 'party') user.invitations.party = {}; // TODO mark modified?
    } else {
      throw new NotFound(res.t('groupMemberNotFound'));
    }

    let message = req.query.message;
    if (message) _sendMessageToRemoved(group, member, message);

    await Q.all([
      member.save(),
      group.save(),
    ]);
    res.respond(200, {});
  },
};

async function _inviteByUUID (uuid, group, inviter, req, res) {
  // @TODO: Add Push Notifications
  let userToInvite = await User.findById(uuid).exec();

  if (!userToInvite) {
    throw new NotFound(res.t('userWithIDNotFound', {userId: uuid}));
  }

  if (group.type === 'guild') {
    if (_.contains(userToInvite.guilds, group._id)) {
      throw new NotAuthorized(res.t('userAlreadyInGroup'));
    }
    if (_.find(userToInvite.invitations.guilds, {id: group._id})) {
      throw new NotAuthorized(res.t('userAlreadyInvitedToGroup'));
    }
    userToInvite.invitations.guilds.push({id: group._id, name: group.name, inviter: inviter._id});
  } else if (group.type === 'party') {
    if (!_.isEmpty(userToInvite.invitations.party)) {
      throw new NotAuthorized(res.t('userAlreadyPendingInvitation'));
    }
    if (userToInvite.party._id) {
      throw new NotAuthorized(res.t('userAlreadyInAParty'));
    }
    // @TODO: Why was this here?
    // req.body.type in 'guild', 'party'
    userToInvite.invitations.party = {id: group._id, name: group.name, inviter: inviter._id};
  }

  let groupLabel = group.type === 'guild' ? 'Guild' : 'Party';
  if (userToInvite.preferences.emailNotifications[`invited${groupLabel}`] !== false) {
    let emailVars = [
      {name: 'INVITER', content: inviter.profile.name},
      {name: 'REPLY_TO_ADDRESS', content: inviter.email},
    ];

    if (group.type === 'guild') {
      emailVars.push(
        {name: 'GUILD_NAME', content: group.name},
        {name: 'GUILD_URL', content: '/#/options/groups/guilds/public'},
      );
    } else {
      emailVars.push(
        {name: 'PARTY_NAME', content: group.name},
        {name: 'PARTY_URL', content: '/#/options/groups/party'},
      );
    }

    sendTxnEmail(userToInvite, `invited-${groupLabel}`, emailVars);
  }

  let userInvited = await userToInvite.save();
  if (group.type === 'guild') {
    return userInvited.invitations.guilds[userToInvite.invitations.guilds.length - 1];
  } else if (group.type === 'party') {
    return userInvited.invitations.party;
  }
}

async function _inviteByEmail (invite, group, inviter, req, res) {
  let userReturnInfo;

  if (!invite.email) throw new BadRequest(res.t('inviteMissingEmail'));

  let userToContact = await User.findOne({$or: [
    {'auth.local.email': invite.email},
    {'auth.facebook.emails.value': invite.email},
  ]})
  .select({_id: true, 'preferences.emailNotifications': true})
  .exec();

  if (userToContact) {
    userReturnInfo = await _inviteByUUID(userToContact._id, group, inviter, req, res);
  } else {
    userReturnInfo = invite.email;
    // yeah, it supports guild too but for backward compatibility we'll use partyInvite as query
    // TODO absolutely refactor this horrible code
    const partyQueryString = JSON.stringify({id: group._id, inviter, name: group.name});
    const encryptedPartyqueryString = encrypt(partyQueryString);
    let link = `?partyInvite=${encryptedPartyqueryString}`;

    let variables = [
      {name: 'LINK', content: link},
      {name: 'INVITER', content: inviter || inviter.profile.name},
      {name: 'REPLY_TO_ADDRESS', content: inviter.email},
    ];

    if (group.type === 'guild') {
      variables.push({name: 'GUILD_NAME', content: group.name});
    }

    // TODO implement "users can only be invited once"
    // Check for the email address not to be unsubscribed
    let userIsUnsubscribed = await EmailUnsubscription.findOne({email: invite.email}).exec();
    let groupLabel = group.type === 'guild' ? '-guild' : '';
    if (!userIsUnsubscribed) sendTxnEmail(invite, `invite-friend${groupLabel}`, variables);
  }

  return userReturnInfo;
}

/**
 * @api {post} /groups/:groupId/invite Invite users to a group using their UUIDs or email addresses
 * @apiVersion 3.0.0
 * @apiName InviteToGroup
 * @apiGroup Group
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiParam {array} emails An array of emails addresses to invite (optional) (inside body)
 * @apiParam {array} uuids An array of uuids to invite (optional) (inside body)
 * @apiParam {string} inviter The inviters' name (optional) (inside body)
 *
 * @apiSuccess {Object} empty An empty object
 */
api.inviteToGroup = {
  method: 'POST',
  url: '/groups/:groupId/invite',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'}); // Do not fetch chat TODO other fields too?
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuids = req.body.uuids;
    let emails = req.body.emails;

    let uuidsIsArray = Array.isArray(uuids);
    let emailsIsArray  = Array.isArray(emails);

    if (!uuids && !emails) {
      throw new BadRequest(res.t('canOnlyInviteEmailUuid'));
    }

    let results = [];
    let totalInvites = 0;

    if (uuids) {
      if (!uuidsIsArray) {
        throw new BadRequest(res.t('uuidsMustBeAnArray'));
      } else {
        totalInvites += uuids.length;
      }
    }

    if (emails) {
      if (!emailsIsArray) {
        throw new BadRequest(res.t('emailsMustBeAnArray'));
      } else {
        totalInvites += emails.length;
      }
    }

    if (totalInvites > INVITES_LIMIT) {
      throw new BadRequest(res.t('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT}));
    }

    if (uuids) {
      let uuidInvites = uuids.map((uuid) => _inviteByUUID(uuid, group, user, req, res));
      let uuidResults = await Q.all(uuidInvites);
      results.push(...uuidResults);
    }

    if (emails) {
      let emailInvites = emails.map((invite) => _inviteByEmail(invite, group, user, req, res));
      let emailResults = await Q.all(emailInvites);
      results.push(...emailResults);
    }

    res.respond(200, results);
  },
};

export default api;
