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
import txnEmail from '../../libs/api-v3/email';

let api = {};

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
  handler (req, res, next) {
    let user = res.locals.user;

    let group = new Group(Group.sanitize(req.body)); // TODO validate empty req.body
    group.leader = user._id;

    if (group.type === 'guild') {
      if (user.balance < 1) return next(new NotAuthorized(res.t('messageInsufficientGems')));

      group.balance = 1;

      user.balance--;
      user.guilds.push(group._id);
    } else {
      if (user.party._id) return next(new NotAuthorized(res.t('messageGroupAlreadyInParty')));

      user.party._id = group._id;
    }

    Q.all([
      user.save(),
      group.save(),
    ]).then(results => {
      let savedGroup = results[1];

      firebase.updateGroupData(savedGroup);
      firebase.addUserToGroup(savedGroup._id, user._id);
      return res.respond(201, savedGroup); // TODO populate
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkQuery('type', res.t('groupTypesRequired')).notEmpty(); // TODO better validation

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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
    if (queries.length === 0) return next(new BadRequest(res.t('groupTypesRequired')));

    Q.all(queries) // TODO we would like not to return a single big array but Q doesn't support the funtionality https://github.com/kriskowal/q/issues/328
    .then(results => {
      res.respond(200, _.reduce(results, (m, v) => {
        if (_.isEmpty(v)) return m;
        return m.concat(Array.isArray(v) ? v : [v]);
      }, []));
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, req.params.groupId)
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      res.respond(200, group);
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, req.params.groupId, '-chat') // Do not fetch chat
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      let isUserInvited = false;

      if (group.type === 'party' && group._id === (user.invitations.party && user.invitations.party.id)) {
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
      } else if (group.type === 'guild' && user.invitations.guilds) {
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

      Q.all([
        group.save(),
        user.save(),
        User.update({_id: user.invitations.party.inviter}, {$inc: {'items.quests.basilist': 1}}).exec(), // Reward inviter
      ]).then(() => {
        firebase.addUserToGroup(group._id, user._id);
        res.respond(200, {}); // TODO what to return?
      });
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    // When removing the user from challenges, should we keep the tasks?
    req.checkQuery('keep', res.t('keepOrRemoveAll')).optional().isIn(['keep-all', 'remove-all']);

    Group.getGroup(user, req.params.groupId, '-chat') // Do not fetch chat
    .then(group => {
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

      return group.leave(user, req.query.keep);
    })
    .then(() => res.respond(200, {}))
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;
    let group;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('groupId', res.t('userIdRequired')).notEmpty().isUUID();

    Group.getGroup(user, req.params.groupId, '-chat') // Do not fetch chat
    .then(foundGroup => {
      group = foundGroup;
      let uuid = req.query.memberId;

      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyLeaderCanRemoveMember'));
      if (user._id === uuid) throw new NotAuthorized(res.t('memberCannotRemoveYourself'));

      return User.findOne({_id: uuid}).select('party guilds invitations newMessages').exec();
    }).then(member => {
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

      return Q.all([
        member.save(),
        group.save(),
      ]);
    })
    .then(() => res.respond(200, {}))
    .catch(next);
  },
};

export default api;
