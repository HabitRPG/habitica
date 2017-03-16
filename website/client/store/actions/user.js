import { loadAsyncResource } from 'client/libs/asyncResource';

export function fetch (store, forceReload = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'user',
    url: '/api/v3/user',
    deserialize (response) {
      return response.data.data;
    },
    forceReload,
  });
}