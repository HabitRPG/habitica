import { loadAsyncResource } from 'client/libs/asyncResource';
import setProps from 'lodash/set';
import axios from 'axios';

export function fetch (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'user',
    url: '/api/v3/user',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function set (store, changes) {
  const user = store.state.user.data;

  for (let key in changes) {
    setProps(user, key, changes[key]);
  }

  axios.put('/api/v3/user', changes);
  // TODO
  // .then((res) => console.log('set', res))
  // .catch((err) => console.error('set', err));
}