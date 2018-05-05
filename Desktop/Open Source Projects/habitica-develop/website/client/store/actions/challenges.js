import axios from 'axios';
import omit from 'lodash/omit';

export async function createChallenge (store, payload) {
  let response = await axios.post('/api/v3/challenges', payload.challenge);
  let newChallenge = response.data.data;

  store.state.user.data.challenges.push(newChallenge._id);

  return newChallenge;
}

export async function joinChallenge (store, payload) {
  let response = await axios.post(`/api/v3/challenges/${payload.challengeId}/join`);

  return response.data.data;
}

export async function leaveChallenge (store, payload) {
  let url = `/api/v3/challenges/${payload.challengeId}/leave`;
  let response = await axios.post(url, {
    keep: payload.keep,
  });

  return response.data.data;
}

export async function getUserChallenges (store, payload) {
  let url = '/api/v3/challenges/user';
  if (payload && payload.member) url += '?member=true';
  let response = await axios.get(url);
  return response.data.data;
}

export async function getGroupChallenges (store, payload) {
  let response = await axios.get(`/api/v3/challenges/groups/${payload.groupId}`);

  return response.data.data;
}

export async function getChallenge (store, payload) {
  let response = await axios.get(`/api/v3/challenges/${payload.challengeId}`);

  return response.data.data;
}

export async function exportChallengeCsv (store, payload) {
  let response = await axios.get(`/api/v3/challenges/${payload.challengeId}/export/csv`);

  return response.data.data;
}


export async function updateChallenge (store, payload) {
  let challengeDataToSend = omit(payload.challenge, ['tasks', 'habits', 'todos', 'rewards', 'group']);

  if (challengeDataToSend.leader && challengeDataToSend.leader._id) challengeDataToSend.leader = challengeDataToSend.leader._id;

  let response = await axios.put(`/api/v3/challenges/${payload.challenge._id}`, challengeDataToSend);

  return response.data.data;
}

export async function deleteChallenge (store, payload) {
  let response = await axios.delete(`/api/v3/challenges/${payload.challengeId}`);

  return response.data.data;
}

export async function selectChallengeWinner (store, payload) {
  let response = await axios.post(`/api/v3/challenges/${payload.challengeId}/selectWinner/${payload.winnerId}`);

  return response.data.data;
}
