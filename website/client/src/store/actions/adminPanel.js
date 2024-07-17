import axios from 'axios';

export async function searchUsers (store, payload) {
  const url = `/api/v4/admin/search/${payload.userIdentifier}`;
  const response = await axios.get(url);
  return response.data.data;
}
