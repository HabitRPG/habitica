import setProps from 'lodash/set';
import axios from 'axios';
import { loadAsyncResource } from '@/libs/asyncResource';

import { togglePinnedItem as togglePinnedItemOp } from '@/../../common/script/ops/pinnedGearUtils';
import changeClassOp from '@/../../common/script/ops/changeClass';
import disableClassesOp from '@/../../common/script/ops/disableClasses';
import openMysteryItemOp from '@/../../common/script/ops/openMysteryItem';
import { unEquipByType } from '../../../../common/script/ops/unequip';
import markPMSRead from '../../../../common/script/ops/markPMSRead';

export function fetch (store, options = {}) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'user',
    url: '/api/v4/user',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad: options.forceLoad,
  });
}

export async function set (store, changes) {
  const user = store.state.user.data;

  for (const key of Object.keys(changes)) {
    if (key === 'tags') {
      // Keep challenge and group tags
      const oldTags = user.tags.filter(t => t.group);

      user.tags = changes[key].concat(oldTags);

      // Remove deleted tags from tasks
      const userTasksByType = (await store.dispatch('tasks:fetchUserTasks')).data; // eslint-disable-line no-await-in-loop

      Object.keys(userTasksByType).forEach(taskType => {
        userTasksByType[taskType].forEach(task => {
          const tagsIndexesToRemove = [];

          task.tags.forEach((tagId, tagIndex) => {
            if (user.tags.find(tag => tag.id === tagId)) return;
            tagsIndexesToRemove.push(tagIndex);
          });

          tagsIndexesToRemove.forEach(i => task.tags.splice(i, 1));
        });
      });
    } else {
      setProps(user, key, changes[key]);
    }
  }

  const response = await axios.put('/api/v4/user', changes);
  return response.data.data;
}

export async function sleep (store) {
  const user = store.state.user.data;

  user.preferences.sleep = !user.preferences.sleep;

  const response = await axios.post('/api/v4/user/sleep');
  return response.data.data;
}

export async function addWebhook (store, payload) {
  const response = await axios.post('/api/v4/user/webhook', payload.webhookInfo);
  return response.data.data;
}

export async function updateWebhook (store, payload) {
  const response = await axios.put(`/api/v4/user/webhook/${payload.webhook.id}`, payload.webhook);
  return response.data.data;
}

export async function deleteWebhook (store, payload) {
  const response = await axios.delete(`/api/v4/user/webhook/${payload.webhook.id}`);
  return response.data.data;
}

export async function changeClass (store, params) {
  const user = store.state.user.data;

  changeClassOp(user, params);
  user.flags.classSelected = true;

  const response = await axios.post(`/api/v4/user/change-class?class=${params.query.class}`);
  return response.data.data;
}

export async function disableClasses (store) {
  const user = store.state.user.data;

  disableClassesOp(user);
  const response = await axios.post('/api/v4/user/disable-classes');
  return response.data.data;
}

export function togglePinnedItem (store, params) {
  const user = store.state.user.data;

  const addedItem = togglePinnedItemOp(user, params);

  axios.get(`/api/v4/user/toggle-pinned-item/${params.type}/${params.path}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));

  return addedItem;
}

export async function movePinnedItem (store, params) {
  const response = await axios.post(`/api/v4/user/move-pinned-item/${params.path}/move/to/${params.position}`);
  return response.data.data;
}

export function castSpell (store, params) {
  let spellUrl = `/api/v4/user/class/cast/${params.key}`;

  const data = {};

  if (params.targetId) spellUrl += `?targetId=${params.targetId}`;
  if (params.quantity) data.quantity = params.quantity;

  return axios.post(spellUrl, data);
}

export async function openMysteryItem (store) {
  const user = store.state.user.data;
  openMysteryItemOp(user);
  return axios.post('/api/v4/user/open-mystery-item');
}

export async function rebirth () {
  const result = await axios.post('/api/v4/user/rebirth');

  return result;
}

export async function togglePrivateMessagesOpt (store) {
  const response = await axios.put('/api/v4/user',
    {
      'inbox.optOut': !store.state.user.data.inbox.optOut,
    });
  store.state.user.data.inbox.optOut = !store.state.user.data.inbox.optOut;
  return response;
}

export async function userLookup (store, params) {
  let response;
  if (params.uuid) {
    response = await axios.get(`/api/v4/members/${params.uuid}`);
  }
  if (params.username) {
    response = await axios.get(`/api/v4/members/username/${params.username}`);
  }
  return response;
}

export function block (store, params) {
  store.state.user.data.inbox.blocks.push(params.uuid);
  return axios.post(`/api/v4/user/block/${params.uuid}`);
}

export function unblock (store, params) {
  const index = store.state.user.data.inbox.blocks.indexOf(params.uuid);
  store.state.user.data.inbox.blocks.splice(index, 1);
  return axios.post(`/api/v4/user/block/${params.uuid}`);
}

export function markPrivMessagesRead (store) {
  markPMSRead(store.state.user.data);
  return axios.post('/api/v4/user/mark-pms-read');
}

export async function getPurchaseHistory () {
  const response = await axios.get('/api/v4/user/purchase-history');
  return response.data.data;
}


export function newPrivateMessageTo (store, params) {
  const { member } = params;

  const userStyles = {};
  userStyles.items = { gear: {} };

  if (member.items) {
    userStyles.items.gear = {};
    userStyles.items.gear.costume = { ...member.items.gear.costume };
    userStyles.items.gear.equipped = { ...member.items.gear.equipped };

    userStyles.items.currentMount = member.items.currentMount;
    userStyles.items.currentPet = member.items.currentPet;
  }

  if (member.preferences) {
    userStyles.preferences = {};
    if (member.preferences.style) userStyles.preferences.style = member.preferences.style;
    userStyles.preferences.hair = member.preferences.hair;
    userStyles.preferences.skin = member.preferences.skin;
    userStyles.preferences.shirt = member.preferences.shirt;
    userStyles.preferences.chair = member.preferences.chair;
    userStyles.preferences.size = member.preferences.size;
    userStyles.preferences.chair = member.preferences.chair;
    userStyles.preferences.background = member.preferences.background;
    userStyles.preferences.costume = member.preferences.costume;
  }

  if (member.stats) {
    userStyles.stats = {};
    userStyles.stats.class = member.stats.class;
    if (member.stats.buffs) {
      userStyles.stats.buffs = {
        seafoam: member.stats.buffs.seafoam,
        shinySeed: member.stats.buffs.shinySeed,
        spookySparkles: member.stats.buffs.spookySparkles,
        snowball: member.stats.buffs.snowball,
      };
    }
  }

  store.state.privateMessageOptions = {
    userIdToMessage: member._id,
    displayName: member.profile.name,
    username: member.auth.local.username,
    backer: member.backer,
    contributor: member.contributor,
    userStyles,
  };
}

export async function unequip (store, params) {
  const user = store.state.user.data;

  unEquipByType(user, { params });

  const response = await axios.post(`/api/v4/user/unequip/${params.type}`);

  store.dispatch('snackbars:add', {
    title: 'Habitica',
    text: response.data.message,
    type: 'info',
  });

  return response.data.data;
}
