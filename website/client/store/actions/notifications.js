import axios from 'axios';

export async function getPublicGuilds (store, payload) {
  let response = await axios.get('/api/v3/groups', {
    params: {
      type: 'publicGuilds',
      paginate: true,
      page: payload.page,
    },
  });

  return response.data.data;
}

export async function readNotification (store, payload) {
  let url = `api/v3/notifications/${payload.notificationId}/read`;
  let response = await axios.post(url);
  return response.data.data;
}

export async function readNotifications (store, payload) {
  let url = 'api/v3/notifications/read';
  let response = await axios.post(url, {
    notificationIds: payload.notificationIds,
  });
  return response.data.data;
}
