import { loadAsyncResource } from 'client/libs/asyncResource';

export function getMembers (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'party.members',
    url: '/api/v3/groups/party/members?includeAllPublicFields=true',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}
