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

export async function leaveGuild (store, payload) {
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
