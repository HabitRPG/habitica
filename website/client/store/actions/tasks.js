import { loadAsyncResource } from 'client/libs/asyncResource';

export function fetchUserTasks (store, forceReload = false) {
  return loadAsyncResource({
    store,
    path: 'tasks',
    url: '/api/v3/tasks/user',
    deserialize (response) {
      return response.data.data;
    },
    forceReload,
  });
}