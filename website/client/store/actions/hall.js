import axios from 'axios';

export async function getHeroes  () {
  let url = '/api/v3/hall/heroes';
  let response = await axios.get(url);
  return response.data.data;
}

export async function getHero  (store, payload) {
  let url = `/api/v3/hall/heroes/${payload.uuid}`;
  let response = await axios.get(url);
  return response.data.data;
}

export async function updateHero  (store, payload) {
  let url = `/api/v3/hall/heroes/${payload.heroDetails._id}`;
  let response = await axios.put(url, payload.heroDetails);
  return response.data.data;
}

export async function getPatrons (store, payload) {
  let page = 0;
  if (payload.page) page = payload.page;

  let url = `/api/v3/hall/patrons/?page=${page}`;
  let response = await axios.get(url);
  return response.data.data;
}
