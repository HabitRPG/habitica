import axios from 'axios';
import omit from 'lodash/omit';
import encodeParams from '@/libs/encodeParams';

export async function createChallenge (store, payload) {
  const response = await axios.post('/api/v4/challenges', payload.challenge);
  const newChallenge = response.data.data;

  return newChallenge;
}

export async function cloneChallenge (store, payload) {
  const response = await axios.post(`/api/v4/challenges/${payload.cloningChallengeId}/clone`, payload.challenge);
  const newChallenge = response.data.data.clonedChallenge;

  return newChallenge;
}

export async function joinChallenge (store, payload) {
  const response = await axios.post(`/api/v4/challenges/${payload.challengeId}/join`);

  return response.data.data;
}

export async function leaveChallenge (store, payload) {
  const url = `/api/v4/challenges/${payload.challengeId}/leave`;
  const response = await axios.post(url, {
    keep: payload.keep,
  });

  return response.data.data;
}

export async function getUserChallenges (store, payload) {
  const url = '/api/v4/challenges/user';
  const {
    member,
    page,
    search,
    categories,
    owned,
  } = payload;

  const query = {};
  if (member) query.member = member;
  if (page >= 0) query.page = page;
  if (search) query.search = search;
  if (categories) query.categories = categories;
  if (owned) query.owned = owned;

  const parms = encodeParams(query);
  const response = await axios.get(`${url}?${parms}`);

  return response.data.data;
}

export async function getGroupChallenges (store, payload) {
  const response = await axios.get(`/api/v4/challenges/groups/${payload.groupId}`);

  return response.data.data;
}

export async function getChallenge (store, payload) {
  const response = await axios.get(`/api/v4/challenges/${payload.challengeId}`);

  return response.data.data;
}

export async function exportChallengeCsv (store, payload) {
  const response = await axios.get(`/api/v4/challenges/${payload.challengeId}/export/csv`);

  return response.data.data;
}

export async function updateChallenge (store, payload) {
  const challengeDataToSend = omit(payload.challenge, ['tasks', 'habits', 'todos', 'rewards', 'group']);

  if (challengeDataToSend.leader && challengeDataToSend.leader._id) {
    challengeDataToSend.leader = challengeDataToSend.leader._id;
  }

  const response = await axios.put(`/api/v4/challenges/${payload.challenge._id}`, challengeDataToSend);

  return response.data.data;
}

export async function deleteChallenge (store, payload) {
  const response = await axios.delete(`/api/v4/challenges/${payload.challengeId}`);
  if (payload.prize) {
    store.state.user.data.balance += payload.prize / 4;
  }
  return response.data.data;
}

export async function selectChallengeWinner (store, payload) {
  const response = await axios.post(`/api/v4/challenges/${payload.challengeId}/selectWinner/${payload.winnerId}`);

  return response.data.data;
}
