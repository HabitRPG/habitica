import _ from 'lodash';


module.exports = function clearInviteAcceptedNotification (user, req = {}) {
  let invitedUsername = req.params.invitedUsername;
  let groupId = req.params.id;

  _.remove(user.invitations.accepted, {invitedUsername, id: groupId});
  return user.invitations.accepted;
};
