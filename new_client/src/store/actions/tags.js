import axios from 'axios';

export async function getTags () {
  let url = 'api/v4/tags';
  let response = await axios.get(url);
  return response.data.data;
}

export async function createTag (store, payload) {
  let url = 'api/v4/tags';
  let response = await axios.post(url, {
    tagDetails: payload.tagDetails,
  });
  return response.data.data;
}

export async function getTag  (store, payload) {
  let url = `api/v4/tags/${payload.tagId}`;
  let response = await axios.get(url);
  return response.data.data;
}

export async function updateTag (store, payload) {
  let url = `api/v4/tags/${payload.tagId}`;
  let response = await axios.put(url, {
    tagDetails: payload.tagDetails,
  });
  return response.data.data;
}

export async function sortTag  (store, payload) {
  let url = 'api/v4/reorder-tags';
  let response = await axios.post(url, {
    tagId: payload.tagId,
    to: payload.to,
  });
  return response.data.data;
}

export async function deleteTag  (store, payload) {
  let url = `api/v4/tags/${payload.tagId}`;
  let response = await axios.delete(url);
  return response.data.data;
}
