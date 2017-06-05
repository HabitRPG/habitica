import axios from 'axios';
import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';

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

export async function getMyGuilds (store) {
  let response = await axios.get('/api/v3/groups', {
    params: {
      type: 'privateGuilds',
    },
  });

  let guilds = response.data.data;
  store.state.myGuilds = guilds;

  return response.data.data;
}

export async function getGroup (store, payload) {
  let response = await axios.get(`/api/v3/groups/${payload.groupId}`);

  // @TODO: should we store the active group for modifying?
  // let guilds = response.data.data;
  // store.state.myGuilds = guilds;

  // @TODO: Populate wiht members, challenges, and invites

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
  let response = await axios.post(`/api/v3/groups/${payload.guildId}/leave`, data);

  // @TODO: update for party
  let index = store.state.user.data.guilds.indexOf(payload.guildId);
  store.state.user.data.guilds.splice(index, 1);
  if (payload.type === 'myGuilds') {
    let guildIndex = findIndex(store.state.myGuilds, (guild) => {
      return guild._id === payload.guildId;
    });
    store.state.myGuilds.splice(guildIndex, 1);
  }

  return response.data.data;
}

export async function create (store, payload) {
  let response = await axios.post('/api/v3/groups/', payload.group);
  let newGroup = response.data.data;

  // @TODO: Add party
  if (newGroup.privacy === 'public') {
    store.state.publicGuilds.push(newGroup);
  } else if (newGroup.privacy === 'private') {
    store.state.myGuilds.push(newGroup);
  }

  return newGroup;
}

export async function update (store, payload) {
  //  Remove populated fields
  let groupDetailsToSend = omit(payload.group, ['chat', 'challenges', 'members', 'invites']);
  if (groupDetailsToSend.leader && groupDetailsToSend.leader._id) groupDetailsToSend.leader = groupDetailsToSend.leader._id;

  let response = await axios.put(`/api/v3/groups/${payload.group.id}`, {
    data: groupDetailsToSend,
  });

  let updatedGroup = response.data.data;

  // @TODO: Replace old group
  // store.state.publicGuilds.push(newGroup);

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
