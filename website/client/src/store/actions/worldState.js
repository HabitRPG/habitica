import { loadAsyncResource } from '@/libs/asyncResource';

export async function getWorldState (store, options = {}) {
  return loadAsyncResource({
    store,
    path: 'worldState',
    url: '/api/v4/world-state',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad: options.forceLoad,
    reloadOnAppVersionChange: true, // reload when the server has been updated
  });
}
