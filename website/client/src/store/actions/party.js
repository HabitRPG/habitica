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
