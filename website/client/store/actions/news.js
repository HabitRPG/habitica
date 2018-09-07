import axios from 'axios';

export async function getNews  () {
  let url = '/api/v4/news';
  let response = await axios.get(url);
  return response.data.data;
}

export async function createNewsPost  (store, payload) {
  let url = '/api/v4/news';
  let response = await axios.post(url, payload.postDetails);
  return response.data.data;
}

export async function updateNewsPost  (store, payload) {
  let url = `/api/v4/news/${payload.postDetails._id}`;
  let response = await axios.put(url, payload.postDetails);
  return response.data.data;
}
