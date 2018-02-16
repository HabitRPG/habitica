import axios from 'axios';

export async function getWorldState () {
  let url = '/api/v3/world-state';
  let response = await axios.get(url);
  return response.data.data;
}
