import axios from 'axios';

export async function getBlockers () {
  const response = await axios.get('/api/v4/admin/blockers');
  return response.data.data;
}
export async function createBlocker (store, payload) {
  const response = await axios.post('/api/v4/admin/blockers', payload.blocker);
  return response.data.data;
}
export async function updateBlocker (store, payload) {
  const response = await axios.put(`/api/v4/admin/blockers/${payload.blocker._id}`, payload.blocker);
  return response.data.data;
}

export async function deleteBlocker (store, payload) {
  const response = await axios.delete(`/api/v4/admin/blockers/${payload.blockerId}`);
  return response.data.data;
}
