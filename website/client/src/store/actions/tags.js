import axios from 'axios';

export async function getTags () {
  const url = '/api/v4/tags';
  const response = await axios.get(url);
  return response.data.data;
}

export async function createTag (store, payload) {
  const url = '/api/v4/tags';
  const response = await axios.post(url, {
    name: payload.name,
  });

  const tag = response.data.data;

  store.state.user.data.tags.push(tag);
  return tag;
}

export async function getTag (store, payload) {
  const url = `/api/v4/tags/${payload.tagId}`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function updateTag (store, payload) {
  const url = `/api/v4/tags/${payload.tagId}`;
  const response = await axios.put(url, {
    tagDetails: payload.tagDetails,
  });
  return response.data.data;
}

export async function sortTag (store, payload) {
  const url = '/api/v4/reorder-tags';
  const response = await axios.post(url, {
    tagId: payload.tagId,
    to: payload.to,
  });
  return response.data.data;
}

export async function deleteTag (store, payload) {
  const url = `/api/v4/tags/${payload.tagId}`;
  const response = await axios.delete(url);
  return response.data.data;
}
