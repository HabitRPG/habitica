import axios from 'axios';

export async function getChat (store, payload) {
  let response = await axios.get(`/api/v3/groups/${payload.groupId}/chat`);

  return response.data.data;
}

export async function postChat (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/chat`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
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
  if (store.user.newMessages) delete store.user.newMessages[payload.groupId];
  let url = `/api/v3/groups/${payload.groupId}/chat/seen`;
  let response = await axios.post(url);
  return response.data.data;
}

// @TODO: should this be here?
// function clearCards () {
//   User.user._wrapped && User.set({'flags.cardReceived':false});
// }
