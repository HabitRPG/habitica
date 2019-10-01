import axios from 'axios';

export async function getWorldState () {
  const url = '/api/v4/world-state';
  const response = await axios.get(url);
  return response.data.data;
}
