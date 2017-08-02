import { loadAsyncResource } from 'client/libs/asyncResource';
import setProps from 'lodash/set';
import axios from 'axios';

export function fetch (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'user',
    url: '/api/v3/user',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function set (store, changes) {
  const user = store.state.user.data;

  for (let key in changes) {
    setProps(user, key, changes[key]);
  }

  axios.put('/api/v3/user', changes);
  // TODO
  // .then((res) => console.log('set', res))
  // .catch((err) => console.error('set', err));
}

export async function sleep () {
  let response = await axios.post('/api/v3/user/sleep');
  return response.data.data;
}

export async function addWebhook (store, payload) {
  let response = await axios.post('/api/v3/user/webhook', payload.webhookInfo);
  return response.data.data;
}

export async function updateWebhook (store, payload) {
  let response = await axios.put(`/api/v3/user/webhook/${payload.webhook.id}`, payload.webhook);
  return response.data.data;
}

export async function deleteWebhook (store, payload) {
  let response = await axios.delete(`/api/v3/user/webhook/${payload.webhook.id}`);
  return response.data.data;
}


export async function togglePinnedItemAsync (store, params) {
  let response = await axios.get(`/api/v3/user/toggle-pinned-item/${params.type}/${params.key}`);
  const user = store.state.user.data;
  user.pinnedItems = response.data.data.pinnedItems;
  return user.pinnedItems;
}
