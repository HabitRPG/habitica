import axios from 'axios';

export async function fetch (store, forceReload) { // eslint-disable-line no-shadow
  let loadingStatus = forceReload ? 'NOT_LOADED' : store.state.loadingStatus.user;

  switch (loadingStatus) {
    case 'NOT_LOADED': {
      let response = await axios.get('/api/v3/user');
      store.state.loadingStatus.user = 'LOADED';
      return store.state.user = response.data.data;
    }
    case 'LOADING': {
      break;
    }
    case 'LOADED': {
      return store.state.user;
    }
  }
}