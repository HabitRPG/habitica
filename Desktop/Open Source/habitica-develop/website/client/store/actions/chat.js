import axios from 'axios';
import * as Analytics from 'client/libs/analytics';

export async function getChat (store, payload) {
  let response = await axios.get(`/api/v3/groups/${payload.groupId}/chat`);

  return response.data.data;
}

export async function postChat (store, payload) {
  const group = payload.group;

  let url = `/api/v3/groups/${group._id}/chat`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
  }

  if (group.type === 'party') {
    Analytics.updateUser({
      partyID: group.id,
      partySize: group.memberCount,
    });
  }

  if (group.privacy === 'public') {
    Analytics.track({
      hitType: 'event',
      eventCategory: 'behavior',
      eventAction: 'group chat',
      groupType: group.type,
      privacy: group.privacy,
      groupName: group.name,
    });
  } else {
    Analytics.track({
      hitType: 'event',
      eventCategory: 'behavior',
      eventAction: 'group chat',
      groupType: group.type,
      privacy: group.privacy,
    });
  }

  let response = await axios.post(url, {
    message: payload.message,
  });

  // @TODO: pusherSocketId: $rootScope.pusherSocketId, // to make sure the send doesn't get notified of it's own message

  return response.data.data;
}

export async function deleteChat (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/chat/${payload.chatId}`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
  }

  let response = await axios.delete(url);
  return response.data.data;
}

export async function like (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/chat/${payload.chatId}/like`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function flag (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/chat/${payload.chatId}/flag`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function clearFlagCount (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/chat/${payload.chatId}/clearflags`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function markChatSeen (store, payload) {
  if (store.state.user.newMessages) delete store.state.user.newMessages[payload.groupId];
  let url = `/api/v3/groups/${payload.groupId}/chat/seen`;
  let response = await axios.post(url);
  return response.data.data;
}

// @TODO: should this be here?
// function clearCards () {
//   User.user._wrapped && User.set({'flags.cardReceived':false});
// }
