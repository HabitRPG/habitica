import axios from 'axios';

export async function fetchAll (store) {
  let response = await axios.get('/api/v3/groups?type=publicGuilds');
  store.state.guilds = response.data.data;
}