import axios from 'axios';

export async function fetch (store) { // eslint-disable-line no-shadow
  let response = await  axios.get('/api/v3/user');
  store.state.user = response.data.data;
}