import axios from 'axios';
import { loadAsyncResource } from 'client/libs/asyncResource';
import buyOp from 'common/script/ops/buy';
import buyQuestOp from 'common/script/ops/buyQuest';
import purchaseOp from 'common/script/ops/purchaseWithSpell';
import buyMysterySetOp from 'common/script/ops/buyMysterySet';
import hourglassPurchaseOp from 'common/script/ops/hourglassPurchase';
import sellOp from 'common/script/ops/sell';
import unlockOp from 'common/script/ops/unlock';

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

export function fetchTimeTravelers (store, forceLoad = false) { // eslint-disable-line no-shadow
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
  let opResult = buyOp(user, {params});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy/${params.key}`),
  };
}

export function buyQuestItem (store, params) {
  const user = store.state.user.data;
  let opResult = buyQuestOp(user, {params});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy-quest/${params.key}`),
  };
}

export function purchase (store, params) {
  const user = store.state.user.data;
  let opResult = purchaseOp(user, {params});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/purchase/${params.type}/${params.key}`),
  };
}

export function purchaseMysterySet (store, params) {
  const user = store.state.user.data;
  let opResult = buyMysterySetOp(user, {params, noConfirm: true});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy-mystery-set/${params.key}`),
  };
}

export function purchaseHourglassItem (store, params) {
  const user = store.state.user.data;
  let opResult = hourglassPurchaseOp(user, {params});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/purchase-hourglass/${params.type}/${params.key}`),
  };
}

export function unlock (store, params) {
  const user = store.state.user.data;
  let opResult = unlockOp(user, params);

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/unlock?path=${params.query.path}`),
  };
}

export function genericPurchase (store, params) {
  switch (params.pinType) {
    case 'mystery_set':
      return purchaseMysterySet(store, params);
    case 'potion':
    case 'armoire':
    case 'marketGear':
      return buyItem(store, params);
    case 'background':
      return unlock(store, {
        query: {
          path: `background.${params.key}`,
        },
      });
    default:
      if (params.pinType === 'quests' && params.currency === 'gold') {
        return buyQuestItem(store, params);
      } else if (params.key === 'rebirth_orb') {
        return store.dispatch('user:rebirth');
      } else if (params.currency === 'hourglasses') {
        return purchaseHourglassItem(store, params);
      } else {
        return purchase(store, params);
      }
  }
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
