import { loadAsyncResource } from 'client/libs/asyncResource';

export function getMembers (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'partyMembers',
    url: '/api/v3/groups/party/members?includeAllPublicFields=true',
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
    url: '/api/v3/groups/party',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}
