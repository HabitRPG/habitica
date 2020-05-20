import axios from 'axios';
// import omit from 'lodash/omit';
// import findIndex from 'lodash/findIndex';

const apiv4Prefix = '/api/v4';

export async function getGroupMembers (store, payload) {
  const url = `${apiv4Prefix}/groups/${payload.groupId}/members`;

  const params = {};

  if (payload.includeAllPublicFields) {
    params.includeAllPublicFields = true;
  }

  if (payload.lastMemberId) {
    params.lastId = payload.lastMemberId;
  }

  if (payload.searchTerm) {
    params.search = payload.searchTerm;
  }

  const response = await axios.get(url, { params });
  return response.data.data;
}

export async function fetchMember (store, payload) {
  const url = `${apiv4Prefix}/members/${payload.memberId}`;
  const response = await axios.get(url);
  return response;
}

export async function fetchMemberByUsername (store, payload) {
  const url = `${apiv4Prefix}/members/username/${payload.username}`;
  const response = await axios.get(url);
  return response;
}

export async function getGroupInvites (store, payload) {
  let url = `${apiv4Prefix}/groups/${payload.groupId}/invites`;
  if (payload.includeAllPublicFields) {
    url += '?includeAllPublicFields=true';
  }
  const response = await axios.get(url);
  return response.data.data;
}

export async function getChallengeMembers (store, payload) {
  const url = `${apiv4Prefix}/challenges/${payload.challengeId}/members`;

  const params = {};

  if (payload.includeAllPublicFields) {
    params.includeAllPublicFields = true;
  }

  if (payload.lastMemberId) {
    params.lastId = payload.lastMemberId;
  }

  if (payload.searchTerm) {
    params.search = payload.searchTerm;
  }

  const response = await axios.get(url, { params });
  return response.data.data;
}

export async function getChallengeMemberProgress (store, payload) {
  const url = `${apiv4Prefix}/challenges/${payload.challengeId}/members/${payload.memberId}`;
  const response = await axios.get(url);
  return response;
}

export async function sendPrivateMessage (store, payload) {
  const url = `${apiv4Prefix}/members/send-private-message`;
  const data = {
    message: payload.message,
    toUserId: payload.toUserId,
  };
  const response = await axios.post(url, data);
  return response;
}

export async function transferGems (store, payload) {
  const url = `${apiv4Prefix}/members/transfer-gems`;
  const data = {
    message: payload.message,
    toUserId: payload.toUserId,
    gemAmount: payload.gemAmount,
  };
  const response = await axios.post(url, data);
  store.state.user.data.balance -= payload.gemAmount / 4;
  return response;
}

export async function removeMember (store, payload) {
  const url = `${apiv4Prefix}/groups/${payload.groupId}/removeMember/${payload.memberId}`;
  const data = {
    message: payload.message,
  };
  const response = await axios.post(url, data);
  return response;
}

// export async function selectMember (uid) {
//   let memberIsReady = _checkIfMemberIsReady(members[uid]);
//
//   if (memberIsReady) {
//     _prepareMember(members[uid], self);
//     return
//   } else {
//     fetchMember(uid)
//       .then(function (response) {
//         var member = response.data.data;
//         addToMembersList(member); // lazy load for later
//         _prepareMember(member, self);
//         deferred.resolve();
//       });
//   }
// }

// function addToMembersList (member) {
//   if (member._id) {
//     members[member._id] = member;
//   }
// }

// function _checkIfMemberIsReady (member) {
//   return member && member.items && member.items.weapon;
// }
//
// function _prepareMember(member, self) {
//   self.selectedMember = members[member._id];
// }
//
// $rootScope.$on('userUpdated', function(event, user){
//   addToMembersList(user);
// })
