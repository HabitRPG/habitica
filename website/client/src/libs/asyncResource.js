import get from 'lodash/get';
import axios from 'axios';

// Return an object used to describe, in the app state, an
// async resource loaded from the server with its data and status.
export function asyncResourceFactory () {
  return {
    loadingStatus: 'NOT_LOADED', // NOT_LOADED, LOADING, LOADED
    appVersionOnLoad: null, // record the server app version the last time the resource was loaded
    data: null,
  };
}

export function loadAsyncResource ({
  store, path, url, deserialize,
  forceLoad = false, reloadOnAppVersionChange = false,
}) {
  if (!store) throw new Error('"store" is required and must be the application store.');
  if (!path) throw new Error('The path to the resource in the application state is required.');
  if (!url) throw new Error('The resource\'s url on the server is required.');
  if (!deserialize) throw new Error('A response deserialization function named must be passed as "deserialize".');

  const resource = get(store.state, path);
  if (!resource) throw new Error(`No resouce found at path "${path}".`);
  const { loadingStatus } = resource;

  // Has the server been updated since we last loaded this resource?
  const appVersionHasChanged = loadingStatus === 'LOADED'
    && store.state.serverAppVersion
    && store.state.serverAppVersion !== resource.appVersionOnLoad;

  let shouldUpdate = false;
  if (forceLoad) shouldUpdate = true;
  if (appVersionHasChanged && reloadOnAppVersionChange) shouldUpdate = true;

  if (loadingStatus === 'LOADED' && !shouldUpdate) {
    return Promise.resolve(resource);
  } if (loadingStatus === 'LOADING') {
    return new Promise((resolve, reject) => {
      const resourceWatcher = store.watch(state => get(state, `${path}.loadingStatus`), newLoadingStatus => {
        resourceWatcher(); // remove the watcher
        if (newLoadingStatus === 'LOADED') {
          return resolve(resource);
        }
        return reject(); // TODO add reason?
      });
    });
  } if (loadingStatus === 'NOT_LOADED' || shouldUpdate) { // @TODO set loadingStatus back to LOADING?
    return axios.get(url).then(response => { // @TODO support more params
      resource.loadingStatus = 'LOADED';
      // deserialize can be a promise
      return Promise.resolve(deserialize(response)).then(deserializedData => {
        resource.data = deserializedData;
        // record the app version when the resource was loaded
        // allows reloading if the app version has changed
        resource.appVersionOnLoad = store.state.serverAppVersion;
        return resource;
      });
    });
  }

  return Promise.reject(new Error(`Invalid loading status "${loadingStatus} for resource at "${path}".`));
}
