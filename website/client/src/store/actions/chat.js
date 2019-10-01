import axios from 'axios';
import * as Analytics from 'client/libs/analytics';

export async function getChat (store, payload) {
  let response = await axios.get(`/api/v4/groups/${payload.groupId}/chat`);

  return response.data.data;
}

export async function postChat (store, payload) {
  const group = payload.group;

  let url = `/api/v4/groups/${group._id}/chat`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
  }

  if (group.type === 'party') {
    Analytics.updateUser({
      partyID: group.id,
      partySize: group.memberCount,
    });
  }

  let response = await axios.post(url, {
    message: payload.message,
  });

  return response.data.data;
}

export async function deleteChat (store, payload) {
  let url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
  }

  let response = await axios.delete(url);
  return response.data.data;
}

export async function like (store, payload) {
  let url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}/like`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function flag (store, payload) {
  let url = '';

  if (payload.groupId === 'privateMessage') {
    url = `/api/v4/members/flag-private-message/${payload.chatId}`;
  } else {
    url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}/flag`;
  }

  const response = await axios.post(url, {
    comment: payload.comment,
  });

  return response.data.data;
}

export async function clearFlagCount (store, payload) {
  let url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}/clearflags`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function markChatSeen (store, payload) {
  if (store.state.user.newMessages) delete store.state.user.newMessages[payload.groupId];
  let url = `/api/v4/groups/${payload.groupId}/chat/seen`;
  let response = await axios.post(url);
  return response.data.data;
}
