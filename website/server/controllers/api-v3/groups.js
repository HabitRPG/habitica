import { authWithHeaders } from '../../middlewares/auth';
import Bluebird from 'bluebird';
import _ from 'lodash';
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

/**
 * @apiDefine GroupNotFound
 * @apiError (404) {NotFound} GroupNotFound The specified group could not be found.
 */

/**
 * @apiDefine PartyNotFound
 * @apiError (404) {NotFound} PartyNotFound The user's party could not be found.
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
 * @apiSuccess {Object} data The create group
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
 * @api {get} /api/v3/groups Get groups for a user
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam {String} type The type of groups to retrieve. Must be a query string representing a list of values like 'tavern,party'. Possible values are party, guilds, privateGuilds, publicGuilds, tavern
 *
 * @apiSuccess {Array} data An array of the requested groups
 */
api.getGroups = {
  method: 'GET',
  url: '/groups',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let types = req.query.type.split(',');
    let groupFields = basicGroupFields.concat(' description memberCount balance');
    let sort = '-memberCount';

    let results = await Group.getGroups({user, types, groupFields, sort});
    res.respond(200, results);
  },
};

/**
 * @api {get} /api/v3/groups/:groupId Get group
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiSuccess {Object} data The group object
 *
 * @apiUse GroupNotFound
 */
api.getGroup = {
  method: 'GET',
  url: '/groups/:groupId',
  runCron: false, // Do not run cron to avoid double cronning because it's called in parallel to GET /user when the site loads
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

    group = Group.toJSONCleanChat(group, user);
    // Instead of populate we make a find call manually because of https://github.com/Automattic/mongoose/issues/3833
    let leader = await User.findById(group.leader).select(nameFields).exec();
    if (leader) group.leader = leader.toJSON({minimize: true});

    res.respond(200, group);
  },
};

/**
 * @api {put} /api/v3/groups/:groupId Update group
 * @apiName UpdateGroup
 * @apiGroup Group
 *
 * @apiParam {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiSuccess {Object} data The updated group
 *
 * @apiUse GroupNotFound
 *
 * @apiPermission GroupLeader
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

    let group = await Group.getGroup({user, groupId: req.params.groupId});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('messageGroupOnlyLeaderCanUpdate'));

    _.assign(group, _.merge(group.toObject(), Group.sanitizeUpdate(req.body)));

    let savedGroup = await group.save();
    let response = Group.toJSONCleanChat(savedGroup, user);
    // If the leader changed fetch new data, otherwise use authenticated user
    if (response.leader !== user._id) {
      response.leader = (await User.findById(response.leader).select(nameFields).exec()).toJSON({minimize: true});
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
 * @apiParam {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiSuccess {Object} data The joined group
 *
 * @apiUse GroupNotFound
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

    if (group.type === 'party' && group._id === user.invitations.party.id) {
      inviter = user.invitations.party.inviter;
      user.invitations.party = {}; // Clear invite
      user.markModified('invitations.party');

      // invite new user to pending quest
      if (group.quest.key && !group.quest.active) {
        user.party.quest.RSVPNeeded = true;
        user.party.quest.key = group.quest.key;
        group.quest.members[user._id] = null;
        group.markModified('quest.members');
      }

      // If user was in a different party (when partying solo you can be invited to a new party)
      // make him leave that party before doing anything
      if (user.party._id) {
        let userPreviousParty = await Group.getGroup({user, groupId: user.party._id});
        if (userPreviousParty) await userPreviousParty.leave(user);
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

    if (isUserInvited && group.type === 'guild') {
      if (user.guilds.indexOf(group._id) !== -1) { // if user is already a member (party is checked previously)
        throw new NotAuthorized(res.t('userAlreadyInGroup'));
      }
      user.guilds.push(group._id); // Add group to user's guilds
    }
    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    if (group.memberCount === 0) group.leader = user._id; // If new user is only member -> set as leader

    group.memberCount += 1;

    let promises = [group.save(), user.save()];

    if (group.type === 'party' && inviter) {
      promises.push(User.update({_id: inviter}, {$inc: {'items.quests.basilist': 1}}).exec()); // Reward inviter
      if (group.memberCount > 1) {
        promises.push(User.update({$or: [{'party._id': group._id}, {_id: user._id}], 'achievements.partyUp': {$ne: true}}, {$set: {'achievements.partyUp': true}}, {multi: true}).exec());
      }
      if (group.memberCount > 3) {
        promises.push(User.update({$or: [{'party._id': group._id}, {_id: user._id}], 'achievements.partyOn': {$ne: true}}, {$set: {'achievements.partyOn': true}}, {multi: true}).exec());
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
 * @apiParam {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiSuccess {Object} data An empty object
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

    if (groupId === user.invitations.party.id) {
      user.invitations.party = {};
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

/**
 * @api {post} /api/v3/groups/:groupId/leave Leave a group
 * @apiName LeaveGroup
 * @apiGroup Group
 *
 * @apiParam {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam {String="remove-all","keep-all"} keep Query parameter - Whether to keep or not challenges' tasks. Defaults to keep-all
 *
 * @apiSuccess {Object} data An empty object
 *
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

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let group = await Group.getGroup({user, groupId, fields: '-chat', requireMembership: true});
    if (!group) {
      throw new NotFound(res.t('groupNotFound'));
    }

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
 * @api {post} /api/v3/groups/:groupId/removeMember/:memberId Remove a member from a group
 * @apiName RemoveGroupMember
 * @apiGroup Group
 *
 * @apiParam {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam {UUID} memberId The _id of the member to remove
 * @apiParam {String} message Query parameter - The message to send to the removed members
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiPermission GroupLeader
 *
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

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'}); // Do not fetch chat
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuid = req.params.memberId;

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
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
    if (member.invitations.party && member.invitations.party.id === group._id) {
      isInvited = 'party';
    } else if (_.findIndex(member.invitations.guilds, {id: group._id}) !== -1) {
      isInvited = 'guild';
    }

    if (isInGroup) {
      group.memberCount -= 1;

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

      if (member.newMessages[group._id]) {
        member.newMessages[group._id] = undefined;
        member.markModified('newMessages');
      }

      if (group.quest && group.quest.active && group.quest.leader === member._id) {
        member.items.quests[group.quest.key] += 1;
      }
    } else if (isInvited) {
      if (isInvited === 'guild') {
        removeFromArray(member.invitations.guilds, { id: group._id });
      }
      if (isInvited === 'party') {
        member.invitations.party = {};
        member.markModified('invitations.party');
      }
    } else {
      throw new NotFound(res.t('groupMemberNotFound'));
    }

    let message = req.query.message;
    if (message) _sendMessageToRemoved(group, member, message);

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
    if (_.contains(userToInvite.guilds, group._id)) {
      throw new NotAuthorized(res.t('userAlreadyInGroup'));
    }
    if (_.find(userToInvite.invitations.guilds, {id: group._id})) {
      throw new NotAuthorized(res.t('userAlreadyInvitedToGroup'));
    }
    userToInvite.invitations.guilds.push({id: group._id, name: group.name, inviter: inviter._id});
  } else if (group.type === 'party') {
    if (userToInvite.invitations.party.id) {
      throw new NotAuthorized(res.t('userAlreadyPendingInvitation'));
    }

    if (userToInvite.party._id) {
      let userParty = await Group.getGroup({user: userToInvite, groupId: 'party', fields: 'memberCount'});

      // Allow user to be invited to a new party when they're partying solo
      if (userParty && userParty.memberCount !== 1) throw new NotAuthorized(res.t('userAlreadyInAParty'));
    }

    userToInvite.invitations.party = {id: group._id, name: group.name, inviter: inviter._id};
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
        {name: 'GUILD_URL', content: '/#/options/groups/guilds/public'}
      );
    } else {
      emailVars.push(
        {name: 'PARTY_NAME', content: group.name},
        {name: 'PARTY_URL', content: '/#/options/groups/party'}
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
    return userInvited.invitations.party;
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
    const groupQueryString = JSON.stringify({
      id: group._id,
      inviter: inviter._id,
      sentAt: Date.now(), // so we can let it expire
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
 * @apiParam {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiParam {Array} [emails] Body parameter - An array of emails addresses to invite
 * @apiParam {Array} [uuids] Body parameter - An array of uuids to invite
 *
 * @apiParamExample {json} Emails
 *   {
 *     "emails": ["user-1@example.com", "user-2@exmaple.com"]
 *   }
 * @apiParamExample {json} User Ids
 *   {
 *     "uuids": ["user-id-of-existing-user", "user-id-of-another-existing-user"]
 *   }
 * @apiParamExample {json} User Ids and Emails
 *   {
 *     "emails": ["user-1@example.com", "user-2@exmaple.com"],
 *     "uuids": ["user-id-of-existing-user", "user-id-of-another-existing-user"],
 *   }
 *
 * @apiSuccess {Array} data The invites
 * @apiSuccess {Object} data[0] If the invitation was a user id, you'll receive back an object. You'll recieve one Object for each succesful user id invite.
 * @apiSuccess {String} data[1] If the invitation was an email, you'll receive back the email. You'll recieve one String for each successful email invite.
 *
 * @apiSuccessExample {json} Successful Response
 *   {
 *     data: [
 *       { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' },
 *       "user@example.com"
 *     ]
 *   }
 *
 * @apiUse GroupNotFound
 * @apiError InvalidInvitationParams An error relating to the data sent in `emails` and/or `uuids`
 * @apiError TooManyInvites A max of 100 invites (combined emails and user ids) can be sent out at a time
 */
api.inviteToGroup = {
  method: 'POST',
  url: '/groups/:groupId/invite',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: '-chat'});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuids = req.body.uuids;
    let emails = req.body.emails;

    Group.validateInvitations(uuids, emails, res);

    let results = [];

    if (uuids) {
      let uuidInvites = uuids.map((uuid) => _inviteByUUID(uuid, group, user, req, res));
      let uuidResults = await Bluebird.all(uuidInvites);
      results.push(...uuidResults);
    }

    if (emails) {
      let emailInvites = emails.map((invite) => _inviteByEmail(invite, group, user, req, res));
      let emailResults = await Bluebird.all(emailInvites);
      results.push(...emailResults);
    }

    res.respond(200, results);
  },
};

module.exports = api;
