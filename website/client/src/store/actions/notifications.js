import axios from 'axios';

export async function readNotification (store, payload) {
  const url = `/api/v4/notifications/${payload.notificationId}/read`;
  const response = await axios.post(url);
  store.state.notificationsRemoved.push(payload.notificationId);
  return response.data.data;
}

export async function readNotifications (store, payload) {
  const url = '/api/v4/notifications/read';
  const response = await axios.post(url, {
    notificationIds: payload.notificationIds,
  });
  store.state.notificationsRemoved.push(...payload.notificationIds);
  return response.data.data;
}

export async function seeNotification (store, payload) {
  const url = `/api/v4/notifications/${payload.notificationId}/see`;
  const response = await axios.post(url);
  return response.data.data;
}

export async function seeNotifications (store, payload) {
  const url = '/api/v4/notifications/see';
  const response = await axios.post(url, {
    notificationIds: payload.notificationIds,
  });
  return response.data.data;
}
