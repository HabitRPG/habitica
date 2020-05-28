import axios from 'axios';
import Vue from 'vue';
import * as Analytics from '@/libs/analytics';

export async function getChat (store, payload) {
  const response = await axios.get(`/api/v4/groups/${payload.groupId}/chat`);

  return response.data.data;
}

export async function postChat (store, payload) {
  const { group } = payload;

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

  const response = await axios.post(url, {
    message: payload.message,
  });

  return response.data.data;
}

export async function deleteChat (store, payload) {
  let url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}`;

  if (payload.previousMsg) {
    url += `?previousMsg=${payload.previousMsg}`;
  }

  const response = await axios.delete(url);
  return response.data.data;
}

export async function like (store, payload) {
  const url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}/like`;
  const response = await axios.post(url);
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
  const url = `/api/v4/groups/${payload.groupId}/chat/${payload.chatId}/clearflags`;
  const response = await axios.post(url);
  return response.data.data;
}

export async function markChatSeen (store, payload) {
  const url = `/api/v4/groups/${payload.groupId}/chat/seen`;
  const response = await axios.post(url);

  if (store.state.user.data.newMessages[payload.groupId]) {
    Vue.delete(store.state.user.data.newMessages, payload.groupId);
  }
  if (payload.notificationId) {
    store.state.notificationsRemoved.push(payload.notificationId);
  }

  return response.data.data;
}
