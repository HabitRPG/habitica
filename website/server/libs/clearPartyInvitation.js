// Transitioning invitation storage to an array of objects (see issue #7792 for reference)
module.exports = function clearPartyInvitation (user, groupID) {
  user.invitations.parties.forEach(function partyInvitationIterator (party, index, partiesArr) {
    if (party.id === groupID) {
      partiesArr.splice(index, 1);
    }
  });

  const lastInviteIndex = user.invitations.parties.length - 1;
  user.invitations.party = user.invitations.parties[lastInviteIndex] || {};

  user.markModified('invitations.party');
  user.markModified('invitations.parties');
};
