import axios from 'axios';

export async function getWorldState () { // eslint-disable-line import/prefer-default-export
  const url = '/api/v4/world-state';
  const response = await axios.get(url);
  return response.data.data;
}
