import axios from 'axios';

export async function getHeroes () {
  const url = '/api/v4/hall/heroes';
  const response = await axios.get(url);
  return response.data.data;
}

export async function getHero (store, payload) {
  const url = `/api/v4/hall/heroes/${payload.uuid}`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function updateHero (store, payload) {
  const url = `/api/v4/hall/heroes/${payload.heroDetails._id}`;
  const response = await axios.put(url, payload.heroDetails);
  return response.data.data;
}

export async function getPatrons (store, payload) {
  let page = 0;
  if (payload.page) page = payload.page;

  const url = `/api/v4/hall/patrons/?page=${page}`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function getHeroParty (store, payload) {
  const url = `/api/v4/hall/heroes/party/${payload.groupId}`;
  const response = await axios.get(url);
  return response.data.data;
}
