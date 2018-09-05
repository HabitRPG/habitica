import moment from 'moment';

import { loginSocial, _loginRes } from './social.js';
import common from '../../../common';
import logger from '../logger';
import { decrypt } from '../encryption';
import {
  NotFound,
} from '../errors';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';

// When the user signed up after having been invited to a group, invite them automatically to the group
async function _handleGroupInvitation (user, invite) {
  // wrapping the code in a try because we don't want it to prevent the user from signing up
  // that's why errors are not translated
  try {
    let {sentAt, id: groupId, inviter} = JSON.parse(decrypt(invite));

    // check that the invite has not expired (after 7 days)
    if (sentAt && moment().subtract(7, 'days').isAfter(sentAt)) {
      let err = new Error('Invite expired.');
      err.privateData = invite;
      throw err;
    }

    let group = await Group.getGroup({user, optionalMembership: true, groupId, fields: 'name type'});
    if (!group) throw new NotFound('Group not found.');

    if (group.type === 'party') {
      user.invitations.party = {id: group._id, name: group.name, inviter};
      user.invitations.parties.push(user.invitations.party);
    } else {
      user.invitations.guilds.push({id: group._id, name: group.name, inviter});
    }

    // award the inviter with 'Invited a Friend' achievement
    inviter = await User.findById(inviter);
    if (!inviter.achievements.invitedFriend) {
      inviter.achievements.invitedFriend = true;
      inviter.addNotification('INVITED_FRIEND_ACHIEVEMENT');
      await inviter.save();
    }
  } catch (err) {
    logger.error(err);
  }
}

function hasLocalAuth (user) {
  return user.auth.local.email && user.auth.local.hashed_password;
}

function hasBackupAuth (user, networkToRemove) {
  if (hasLocalAuth(user)) {
    return true;
  }

  let hasAlternateNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find((network) => {
    return network.key !== networkToRemove && user.auth[network.key].id;
  });

  return hasAlternateNetwork;
}

module.exports = {
  _handleGroupInvitation,
  _loginRes,
  hasBackupAuth,
  loginSocial,
  hasLocalAuth,
};
