import axios from 'axios';

export async function getBlockers () {
  const response = await axios.get('/api/v4/admin/blockers');
  console.log(response);
  return response.data.data;
}
