import axios from 'axios';

export async function markAsRead (store) {
  store.state.user.data.flags.newStuff = false;
  return axios.post('/api/v4/news/read');
}

export function remindMeLater (store) {
  store.state.user.data.flags.newStuff = false;
  return axios.post('/api/v4/news/tell-me-later');
}

export async function fetch () {
  const response = await axios.get('/api/v4/news');
  return response.data.data;
}
