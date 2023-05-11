import axios from 'axios';
import { loadAsyncResource } from '@/libs/asyncResource';

export function getMembers (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'partyMembers',
    url: '/api/v4/groups/party/members?includeAllPublicFields=true',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function getParty (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'party',
    url: '/api/v4/groups/party',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export async function lookingForParty (store, payload) {
  let response;
  if (payload && payload.page) {
    response = await axios.get(`api/v4/looking-for-party?page=${payload.page}`);
  } else {
    response = await axios.get('api/v4/looking-for-party');
  }

  return response.data.data;
}
