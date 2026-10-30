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

export async function getPosts (store, payload = {}) {
  const response = await axios.get('/api/v4/news', { params: { page: payload.page || 0 } });
  return response.data.data;
}

export async function getPost (store, payload) {
  const response = await axios.get(`/api/v4/news/${payload.postId}`);
  return response.data.data;
}

export async function createPost (store, payload) {
  const response = await axios.post('/api/v4/news', payload.post);
  return response.data.data;
}

export async function updatePost (store, payload) {
  const response = await axios.put(`/api/v4/news/${payload.post._id}`, payload.post);
  return response.data.data;
}

export async function deletePost (store, payload) {
  const response = await axios.delete(`/api/v4/news/${payload.postId}`);
  return response.data.data;
}
