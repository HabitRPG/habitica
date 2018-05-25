import get from 'lodash/get';
import axios from 'axios';

// Return an object used to describe, in the app state, an
// async resource loaded from the server with its data and status.
export function asyncResourceFactory () {
  return {
    loadingStatus: 'NOT_LOADED', // NOT_LOADED, LOADING, LOADED
    data: null,
  };
}

export function loadAsyncResource ({store, path, url, deserialize, forceLoad = false}) {
  if (!store) throw new Error('"store" is required and must be the application store.');
  if (!path) throw new Error('The path to the resource in the application state is required.');
  if (!url) throw new Error('The resource\'s url on the server is required.');
  if (!deserialize) throw new Error('A response deserialization function named must be passed as "deserialize".');

  const resource = get(store.state, path);
  if (!resource) throw new Error(`No resouce found at path "${path}".`);
  const loadingStatus = resource.loadingStatus;

  if (loadingStatus === 'LOADED' && !forceLoad) {
    return Promise.resolve(resource);
  } else if (loadingStatus === 'LOADING') {
    return new Promise((resolve, reject) => {
      const resourceWatcher = store.watch(state => get(state, `${path}.loadingStatus`), (newLoadingStatus) => {
        resourceWatcher(); // remove the watcher
        if (newLoadingStatus === 'LOADED') {
          return resolve(resource);
        } else {
          return reject(); // TODO add reason?
        }
      });
    });
  } else if (loadingStatus === 'NOT_LOADED' || loadingStatus === 'LOADED' && forceLoad) {
    return axios.get(url).then(response => { // TODO support more params
      resource.loadingStatus = 'LOADED';
      // deserialize can be a promise
      return Promise.resolve(deserialize(response)).then(deserializedData => {
        resource.data = deserializedData;
        return resource;
      });
    });
  } else {
    return Promise.reject(new Error(`Invalid loading status "${loadingStatus} for resource at "${path}".`));
  }
}
