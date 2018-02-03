import axios from 'axios';

export async function getTags () {
  let url = 'api/v3/tags';
  let response = await axios.get(url);
  return response.data.data;
}

export async function createTag (store, payload) {
  let url = 'api/v3/tags';
  let response = await axios.post(url, {
    tagDetails: payload.tagDetails,
  });
  return response.data.data;
}

export async function getTag  (store, payload) {
  let url = `api/v3/tags/${payload.tagId}`;
  let response = await axios.get(url);
  return response.data.data;
}

export async function updateTag (store, payload) {
  let url = `api/v3/tags/${payload.tagId}`;
  let response = await axios.put(url, {
    tagDetails: payload.tagDetails,
  });
  return response.data.data;
}

export async function sortTag  (store, payload) {
  let url = 'api/v3/reorder-tags';
  let response = await axios.post(url, {
    tagDetails: payload.tagDetails,
    to: payload.to,
  });
  return response.data.data;
}

export async function deleteTag  (store, payload) {
  let url = `api/v3/tags/${payload.tagId}`;
  let response = await axios.delete(url);
  return response.data.data;
}
