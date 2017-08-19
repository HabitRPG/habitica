import { loadAsyncResource } from 'client/libs/asyncResource';
import setProps from 'lodash/set';
import axios from 'axios';

import { togglePinnedItem as togglePinnedItemOp } from 'common/script/ops/pinnedGearUtils';

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
    if (key === 'tags') {
      // Keep challenge and group tags
      const oldTags = user.tags.filter(t => {
        return t.group || t.challenge;
      });

      user.tags = changes[key].concat(oldTags);
    } else {
      setProps(user, key, changes[key]);
    }
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


export function togglePinnedItem (store, params) {
  const user = store.state.user.data;

  let addedItem = togglePinnedItemOp(user, params);

  axios.get(`/api/v3/user/toggle-pinned-item/${params.type}/${params.path}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));

  return addedItem;
}
