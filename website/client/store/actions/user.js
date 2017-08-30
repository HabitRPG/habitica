import { loadAsyncResource } from 'client/libs/asyncResource';
import setProps from 'lodash/set';
import axios from 'axios';

import { togglePinnedItem as togglePinnedItemOp } from 'common/script/ops/pinnedGearUtils';
import changeClassOp from 'common/script/ops/changeClass';
import disableClassesOp from 'common/script/ops/disableClasses';


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

export async function changeClass (store, params) {
  const user = store.state.user.data;

  changeClassOp(user, params);
  let response = await axios.post(`/api/v3/user/change-class?class=${params.query.class}`);
  return response.data.data;
}

export async function disableClasses (store) {
  const user = store.state.user.data;

  disableClassesOp(user);
  let response = await axios.post('/api/v3/user/disable-classes');
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

export function castSpell (store, params) {
  let spellUrl = `/api/v3/user/class/cast/${params.key}`;
  if (params.targetId) spellUrl += `?targetId=${params.targetId}`;

  return axios.post(spellUrl);
}

export function openMysteryItem () {
  return axios.post('/api/v3/user/open-mystery-item');
}

export async function rebirth () {
  let result = await axios.post('/api/v3/user/rebirth');

  window.location.reload(true);

  return result;
}
