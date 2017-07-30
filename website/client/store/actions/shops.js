import axios from 'axios';
import { loadAsyncResource } from 'client/libs/asyncResource';
import buyOp from 'common/script/ops/buy';
import sellOp from 'common/script/ops/sell';

export function fetchMarket (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'shops.market',
    url: '/api/v3/shops/market',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function fetchQuests (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'shops.quests',
    url: '/api/v3/shops/quests',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function fetchSeasonal (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'shops.seasonal',
    url: '/api/v3/shops/seasonal',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}

export function fetchTimeTravel (store, forceLoad = false) { // eslint-disable-line no-shadow
  return loadAsyncResource({
    store,
    path: 'shops.time-travelers',
    url: '/api/v3/shops/time-travelers',
    deserialize (response) {
      return response.data.data;
    },
    forceLoad,
  });
}


export function buyItem (store, params) {
  const user = store.state.user.data;
  buyOp(user, {params});
  axios
    .post(`/api/v3/user/buy/${params.key}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));
}

export function sellItems (store, params) {
  const user = store.state.user.data;
  sellOp(user, {params, query: {amount: params.amount}});
  axios
    .post(`/api/v3/user/sell/${params.type}/${params.key}?amount=${params.amount}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));
}


export function pinGear () {
  // axios
  //  .post(`/api/v3/user/pin/${params.key}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));
}

export function unpinGear () {
  // axios
  //  .post(`/api/v3/user/unpin/${params.key}`);
  // TODO
  // .then((res) => console.log('equip', res))
  // .catch((err) => console.error('equip', err));
}
