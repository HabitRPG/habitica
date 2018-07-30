import moment from 'moment';

function userIsMuted (user) {
  if (!user.flags.chatRevoked) return false;

  // User is muted indefinitely
  if (!user.flags.chatRevokedEndDate) return true;

  return moment(user.flags.chatRevokedEndDate).isAfter(moment());
}

module.exports = {
  userIsMuted,
};
