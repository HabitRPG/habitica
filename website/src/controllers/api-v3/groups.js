import { authWithHeaders } from '../../middlewares/api-v3/auth';
import Q from 'q';
import _ from 'lodash';
import cron from '../../middlewares/api-v3/cron';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as firebase from '../../libs/api-v3/firebase';
import { txnEmail } from '../../libs/api-v3/email';
// import { encrypt } from '../../libs/api-v3/encryption';

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
    let groupFields = 'name description memberCount balance leader';
    let sort = '-memberCount';
    let queries = [];

    types.forEach(type => {
      switch (type) {
        case 'party':
          queries.push(Group.getGroup(user, 'party', groupFields));
          break;
        case 'privateGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'private',
            _id: {$in: user.guilds},
          }).select(groupFields).sort(sort).exec()); // TODO isMember
          break;
        case 'publicGuilds':
          queries.push(Group.find({
            type: 'guild',
            privacy: 'public',
          }).select(groupFields).sort(sort).exec()); // TODO use lean? isMember
          break;
        case 'tavern':
          queries.push(Group.getGroup(user, 'habitrpg', groupFields));
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

    let group = await Group.getGroup(user, req.params.groupId);
    if (!group) throw new NotFound(res.t('groupNotFound'));

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

    let group = await Group.getGroup(user, req.params.groupId);
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

    let group = await Group.getGroup(user, req.params.groupId, '-chat', true); // Do not fetch chat and work even if the user is not yet a member of the group
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
      let i = _.findIndex(user.invitations.guilds, {id: group._id});

      if (i !== -1) {
        isUserInvited = true;
        user.invitations.guilds.splice(i, 1); // Remove invitation
      } else {
        isUserInvited = group.privacy === 'private' ? false : true;
      }
    }

    if (isUserInvited && group.type === 'guild') user.guilds.push(group._id); // Add group to user's guilds
    if (!isUserInvited) throw new NotAuthorized(res.t('messageGroupRequiresInvite'));

    if (group.memberCount === 0) group.leader = user._id; // If new user is only member -> set as leader

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

    let group = await Group.getGroup(user, req.params.groupId, '-chat'); // Do not fetch chat
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
    txnEmail(removedUser, `kicked-from-${group.type}`, [
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

    let group = await Group.getGroup(user, req.params.groupId, '-chat'); // Do not fetch chat
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuid = req.query.memberId;

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
    if (user._id === uuid) throw new NotAuthorized(res.t('memberCannotRemoveYourself'));

    let member = await User.findOne({_id: uuid}).select('party guilds invitations newMessages').exec();
    // We're removing the user from a guild or a party? is the user invited only?
    let isInGroup = member.party._id === group._id ? 'party' : member.guilds.indexOf(group._id) !== 1 ? 'guild' : undefined; // eslint-disable-line no-nested-ternary
    let isInvited = member.invitations.party.id === group._id ? 'party' : _.findIndex(member.invitations.guilds, {id: group._id}) !== 1 ? 'guild' : undefined; // eslint-disable-line no-nested-ternary

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

      member.newMessages.group._id = undefined;

      if (group.quest && group.quest.active && group.quest.leader === member._id) {
        member.items.quests[group.quest.key] += 1; // TODO why this?
      }
    } else if (isInvited) {
      if (isInvited === 'guild') {
        let i = _.findIndex(member.invitations.guilds, {id: group._id});
        if (i !== -1) member.invitations.guilds.splice(i, 1);
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

/* function _inviteByUUIDs (uuids, group, inviter, req, res, next) {
  async.each(uuids, function(uuid, cb){
    User.findById(uuid, function(err,invite){
      if (err) return cb(err);
      if (!invite)
         return cb({code:400,err:'User with id "' + uuid + '" not found'});
      if (group.type == 'guild') {
        if (_.contains(group.members,uuid))
          return cb({code:400, err: "User already in that group"});
        if (invite.invitations && invite.invitations.guilds && _.find(invite.invitations.guilds, {id:group._id}))
          return cb({code:400, err:"User already invited to that group"});
        sendInvite();
      } else if (group.type == 'party') {
        if (invite.invitations && !_.isEmpty(invite.invitations.party))
          return cb({code: 400,err:"User already pending invitation."});
        Group.find({type: 'party', members: {$in: [uuid]}}, function(err, groups){
          if (err) return cb(err);
          if (!_.isEmpty(groups) && groups[0].members.length > 1) {
            return cb({code: 400, err: "User already in a party."})
          }
          sendInvite();
        });
      }

      function sendInvite (){
        if(group.type === 'guild'){
          invite.invitations.guilds.push({id: group._id, name: group.name, inviter:res.locals.user._id});

          pushNotify.sendNotify(invite, shared.i18n.t('invitedGuild'), group.name);
        }else{
          //req.body.type in 'guild', 'party'
          invite.invitations.party = {id: group._id, name: group.name, inviter:res.locals.user._id};

          pushNotify.sendNotify(invite, shared.i18n.t('invitedParty'), group.name);
        }

        group.invites.push(invite._id);

        async.series([
          function(cb){
            invite.save(cb);
          }
        ], function(err, results){
          if (err) return cb(err);

          if(invite.preferences.emailNotifications['invited' + (group.type == 'guild' ? 'Guild' : 'Party')] !== false){
            var inviterVars = utils.getUserInfo(res.locals.user, ['name', 'email']);
            var emailVars = [
              {name: 'INVITER', content: inviterVars.name},
              {name: 'REPLY_TO_ADDRESS', content: inviterVars.email}
            ];

            if(group.type == 'guild'){
              emailVars.push(
                {name: 'GUILD_NAME', content: group.name},
                {name: 'GUILD_URL', content: '/#/options/groups/guilds/public'}
              );
            }else{
              emailVars.push(
                {name: 'PARTY_NAME', content: group.name},
                {name: 'PARTY_URL', content: '/#/options/groups/party'}
              )
            }

            utils.txnEmail(invite, ('invited-' + (group.type == 'guild' ? 'guild' : 'party')), emailVars);
          }

          cb();
        });
      }
    });
  }, function(err){
    if(err) return err.code ? res.json(err.code, {err: err.err}) : next(err);

    async.series([
      function(cb) {
        group.save(cb);
      },
      function(cb) {
        // TODO pass group from save above don't find it again, or you have to find it again in order to run populate?
        populateQuery(group.type, Group.findById(group._id)).exec(function(err, populatedGroup){
          if(err) return next(err);

          res.json(populatedGroup);
        });
      }
    ]);
  });
};

function _inviteByEmails (emails, group, inviter, req, res, next) {
  let usersAlreadyRegistered = [];
  let invitesToSend = [];

  return Q.all(emails.forEach(invite => {
    if (!invite.email) throw new BadRequest(res.t('inviteMissingEmail'));

    return User.findOne({$or: [
      {'auth.local.email': invite.email},
      {'auth.facebook.emails.value': invite.email}
    ]})
    .select({_id: true, 'preferences.emailNotifications': true})
    .exec()
    .then(userToContact => {
      if(userToContact){
        usersAlreadyRegistered.push(userToContact._id); // TODO does it work not returning
      } else {
        // yeah, it supports guild too but for backward compatibility we'll use partyInvite as query
        // TODO absolutely refactor this horrible code
        let link = `?partyInvite=${utils.encrypt(JSON.stringify({id: group._id, inviter: inviter, name: group.name}))}`;

        let inviterVars = getUserInfo(inviter, ['name', 'email']);
        let variables = [
          {name: 'LINK', content: link},
          {name: 'INVITER', content: req.body.inviter || inviterVars.name},
          {name: 'REPLY_TO_ADDRESS', content: inviterVars.email}
        ];

        if(group.type == 'guild'){
          variables.push({name: 'GUILD_NAME', content: group.name});
        }

        // TODO implement "users can only be invited once"
        // Check for the email address not to be unsubscribed
        return EmailUnsubscription.findOne({email: invite.email}).exec()
        .then(unsubscribed => {
          if (!unsubscribed) utils.txnEmail(invite, ('invite-friend' + (group.type == 'guild' ? '-guild' : '')), variables);
        });
      }
    });
  }))
  .then(() => {
    if (usersAlreadyRegistered.length > 0){
      return _inviteByUUIDs(usersAlreadyRegistered, group, inviter, req, res, next);
    }

    res.respond(200, {}); // TODO what to return?
  });
}; */

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

    let group = await Group.getGroup(user, req.params.groupId, '-chat'); // Do not fetch chat TODO other fields too?
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let uuids = req.body.uuids;
    let emails = req.body.emails;

    if (uuids && emails) { // TODO fix this, low priority, allow for inviting by both at the same time
      throw new BadRequest(res.t('canOnlyInviteEmailUuid'));
    } else if (Array.isArray(uuids)) {
      // return _inviteByUUIDs(uuids, group, user, req, res, next);
    } else if (Array.isArray(emails)) {
      // return _inviteByEmails(emails, group, user, req, res, next);
    } else {
      throw new BadRequest(res.t('canOnlyInviteEmailUuid'));
    }
  },
};

export default api;
