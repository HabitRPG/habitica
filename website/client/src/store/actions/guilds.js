import axios from 'axios';
import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';
import * as Analytics from '@/libs/analytics';
import { loadAsyncResource } from '@/libs/asyncResource';

export async function getPublicGuilds (store, payload) {
  const params = {
    type: 'publicGuilds',
    paginate: true,
    page: payload.page,
  };

  if (payload.categories) params.categories = payload.categories;
  if (payload.minMemberCount) params.minMemberCount = payload.minMemberCount;
  if (payload.maxMemberCount) params.maxMemberCount = payload.maxMemberCount;
  if (payload.leader) params.leader = payload.leader;
  if (payload.member) params.member = payload.member;
  if (payload.search) params.search = payload.search;

  const response = await axios.get('/api/v4/groups', {
    params,
  });

  return response.data.data;
}

export async function getMyGuilds (store) {
  const params = {
    type: 'guilds',
  };

  const response = await axios.get('/api/v4/groups', { params });

  const guilds = response.data.data;
  store.state.myGuilds = guilds;

  return response.data.data;
}

export async function getGroup (store, payload) {
  const response = await axios.get(`/api/v4/groups/${payload.groupId}`);
  // @TODO: should we store the active group for modifying?
  // let guilds = response.data.data;
  // store.state.myGuilds = guilds;

  // @TODO: Populate with members, challenges, and invites

  return response.data.data;
}

export async function join (store, payload) {
  const { groupId } = payload;
  const { type } = payload;
  const user = store.state.user.data;
  const { invitations } = user;

  let response;
  try {
    response = await axios.post(`/api/v4/groups/${groupId}/join`);
  } catch (err) {
    window.alert(err.response.data.message); // eslint-disable-line no-alert
    return null;
  }

  if (type === 'guild') {
    const invitationI = invitations.guilds.findIndex(i => i.id === groupId);
    if (invitationI !== -1) invitations.guilds.splice(invitationI, 1);

    user.guilds.push(groupId);
    store.state.myGuilds.push(response.data.data);
  } else if (type === 'party') {
    const invitationI = invitations.parties.findIndex(i => i.id === groupId);
    if (invitationI !== -1) invitations.parties.splice(invitationI, 1);

    user.party._id = groupId;
    Analytics.updateUser({ partyID: groupId });
    // load the party members so that they get shown in the header
    store.dispatch('party:getMembers');
  }

  return response.data.data;
}

export async function leave (store, payload) {
  // @TODO: is the dafault for keepChallenges 'remain-in-challenges'
  const data = {
    keep: payload.keep,
    keepChallenges: payload.keepChallenges,
  };
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/leave`, data);

  // @TODO: update for party
  const index = store.state.user.data.guilds.indexOf(payload.groupId);
  store.state.user.data.guilds.splice(index, 1);
  if (payload.type === 'myGuilds') {
    const guildIndex = findIndex(store.state.myGuilds, guild => guild._id === payload.groupId);
    store.state.myGuilds.splice(guildIndex, 1);
  } else if (payload.type === 'party') {
    store.state.user.data.party._id = null;
    store.state.party.data = {};
    store.state.party.status = 'NOT_LOADED';
  }

  return response.data.data;
}

export async function create (store, payload) {
  const response = await axios.post('/api/v4/groups/', payload.group);
  const newGroup = response.data.data;

  if (newGroup.leader._id === store.state.user.data._id || newGroup.privacy === 'private') {
    store.state.myGuilds.push(newGroup);
  }

  store.state.user.data.guilds.push(newGroup._id);

  return newGroup;
}

export async function update (store, payload) {
  //  Remove populated fields
  const groupDetailsToSend = omit(payload.group, ['chat', 'challenges', 'members', 'invites']);
  if (groupDetailsToSend.leader && groupDetailsToSend.leader._id) {
    groupDetailsToSend.leader = groupDetailsToSend.leader._id;
  }

  const response = await axios.put(`/api/v4/groups/${payload.group.id}`, groupDetailsToSend);

  const updatedGroup = response.data.data;

  return updatedGroup;
}

export async function rejectInvite (store, payload) {
  const { groupId } = payload;
  const { type } = payload;
  const user = store.state.user.data;
  const { invitations } = user;

  const response = await axios.post(`/api/v4/groups/${groupId}/reject-invite`);

  if (type === 'guild') {
    const invitationI = invitations.guilds.findIndex(i => i.id === groupId);
    if (invitationI !== -1) invitations.guilds.splice(invitationI, 1);
  } else if (type === 'party') {
    const invitationI = invitations.parties.findIndex(i => i.id === groupId);
    if (invitationI !== -1) invitations.parties.splice(invitationI, 1);
  }

  return response;
}

export async function removeMember (store, payload) {
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/removeMember/${payload.memberId}`, {
    message: payload.message,
  });

  // @TODO: find guild and remove member

  return response;
}

export async function invite (store, payload) {
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/invite`, {
    uuids: payload.invitationDetails.uuids,
    emails: payload.invitationDetails.emails,
    usernames: payload.invitationDetails.usernames,
  });

  // @TODO: find guild and add invites

  return response;
}

export async function inviteToQuest (store, payload) {
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/quests/invite/${payload.key}`);

  // @TODO: Any updates?

  return response;
}

export async function addManager (store, payload) {
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/add-manager/`, {
    managerId: payload.memberId,
  });

  // @TODO: Add managers to group or does the component handle?

  return response;
}

export async function removeManager (store, payload) {
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/remove-manager/`, {
    managerId: payload.memberId,
  });

  // @TODO: Add managers to group or does the component handle?

  return response;
}

export function getGroupPlans (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'groupPlans',
    url: '/api/v4/group-plans',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}
