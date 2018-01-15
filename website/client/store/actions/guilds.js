import axios from 'axios';
import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';

export async function getPublicGuilds (store, payload) {
  let params = {
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

  let response = await axios.get('/api/v3/groups', {
    params,
  });

  return response.data.data;
}

export async function getMyGuilds (store) {
  let params = {
    type: 'guilds',
  };

  let response = await axios.get('/api/v3/groups', { params });

  let guilds = response.data.data;
  store.state.myGuilds = guilds;

  return response.data.data;
}

export async function getGroup (store, payload) {
  let response = await axios.get(`/api/v3/groups/${payload.groupId}`);
  // @TODO: should we store the active group for modifying?
  // let guilds = response.data.data;
  // store.state.myGuilds = guilds;

  // @TODO: Populate with members, challenges, and invites

  return response.data.data;
}


export async function join (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.guildId}/join`);

  // @TODO: abstract for parties as well
  store.state.user.data.guilds.push(payload.guildId);
  if (payload.type === 'myGuilds') {
    store.state.myGuilds.push(response.data.data);
  }

  return response.data.data;
}

export async function leave (store, payload) {
  // @TODO: is the dafault for keepChallenges 'remain-in-challenges'
  let data = {
    keep: payload.keep,
    keepChallenges: payload.keepChallenges,
  };
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/leave`, data);

  // @TODO: update for party
  let index = store.state.user.data.guilds.indexOf(payload.groupId);
  store.state.user.data.guilds.splice(index, 1);
  if (payload.type === 'myGuilds') {
    let guildIndex = findIndex(store.state.myGuilds, (guild) => {
      return guild._id === payload.groupId;
    });
    store.state.myGuilds.splice(guildIndex, 1);
  } else if (payload.type === 'party') {
    store.state.user.data.party._id = null;
    store.state.party.data = {};
    store.state.party.status = 'NOT_LOADED';
  }

  return response.data.data;
}

export async function create (store, payload) {
  let response = await axios.post('/api/v3/groups/', payload.group);
  let newGroup = response.data.data;

  if (newGroup.leader._id === store.state.user.data._id || newGroup.privacy === 'private') {
    store.state.myGuilds.push(newGroup);
  }

  store.state.user.data.guilds.push(newGroup._id);

  return newGroup;
}

export async function update (store, payload) {
  //  Remove populated fields
  let groupDetailsToSend = omit(payload.group, ['chat', 'challenges', 'members', 'invites']);
  if (groupDetailsToSend.leader && groupDetailsToSend.leader._id) groupDetailsToSend.leader = groupDetailsToSend.leader._id;

  let response = await axios.put(`/api/v3/groups/${payload.group.id}`, groupDetailsToSend);

  let updatedGroup = response.data.data;

  return updatedGroup;
}

export async function rejectInvite (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/reject-invite`);

  // @TODO: refresh or add guild

  return response;
}

export async function removeMember (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/removeMember/${payload.memberId}`, {
    message: payload.message,
  });

  // @TODO: find guild and remove member

  return response;
}

export async function invite (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/invite`, {
    uuids: payload.invitationDetails.uuids,
    emails: payload.invitationDetails.emails,
  });

  // @TODO: find guild and add invites

  return response;
}

export async function inviteToQuest (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/quests/invite/${payload.key}`);

  // @TODO: Any updates?

  return response;
}

export async function addManager (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/add-manager/`, {
    managerId: payload.memberId,
  });

  // @TODO: Add managers to group or does the component handle?

  return response;
}

export async function removeManager  (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/remove-manager/`, {
    managerId: payload.memberId,
  });

  // @TODO: Add managers to group or does the component handle?

  return response;
}

export async function getGroupPlans () {
  let response = await axios.get('/api/v3/group-plans');
  return response.data.data;
}
