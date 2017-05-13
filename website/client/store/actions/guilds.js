import axios from 'axios';

export async function getPublicGuilds (store, payload) {
  let response = await axios.get('/api/v3/groups', {
    params: {
      type: 'publicGuilds',
      paginate: true,
      page: payload.page,
    },
  });

  let guilds = response.data.data;
  store.state.publicGuilds = guilds;

  return response.data.data;
}

export async function getMyGuilds (store) {
  let response = await axios.get('/api/v3/groups', {
    params: {
      type: 'privateGuilds',
      // paginate: true,
      // page: payload.page,
    },
  });

  let guilds = response.data.data;
  store.state.myGuilds = guilds;

  return response.data.data;
}
// @TODO: abstract for parties as well
export async function joinGuild (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.guildId}/join`);

  store.state.user.data.guilds.push(payload.guildId);

  return response.data.data;
}

export async function leaveGuild (store, payload) {
  let response = await axios.post(`/api/v3/groups/${payload.guildId}/leave`);

  let index = store.state.user.data.guilds.indexOf(payload.guildId);
  store.state.user.data.guilds.splice(index, 1);

  return response.data.data;
}

export async function create (store, payload) {
  let response = await axios.post('/api/v3/groups/', payload.group);
  let newGroup = response.data.data;

  // @TODO: Check what type of guild
  store.state.publicGuilds.push(newGroup);

  return newGroup;
}
