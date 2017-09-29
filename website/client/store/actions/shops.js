import axios from 'axios';
import buyOp from 'common/script/ops/buy';
import buyQuestOp from 'common/script/ops/buyQuest';
import purchaseOp from 'common/script/ops/purchaseWithSpell';
import buyMysterySetOp from 'common/script/ops/buyMysterySet';
import hourglassPurchaseOp from 'common/script/ops/hourglassPurchase';
import sellOp from 'common/script/ops/sell';
import unlockOp from 'common/script/ops/unlock';
import buyArmoire from 'common/script/ops/buyArmoire';
import rerollOp from 'common/script/ops/reroll';

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
    case 'armoire': // eslint-disable-line
      let buyResult = buyArmoire(store.state.user.data);

      // @TODO: We might need to abstract notifications to library rather than mixin
      if (buyResult[1]) {
        store.state.notificationStore.push({
          title: '',
          text: buyResult[1],
          type: 'drop',
          timeout: true,
        });
      }

      axios.post('/api/v3/user/buy-armoire');
      return;
    case 'fortify': {
      let rerollResult = rerollOp(store.state.user.data);

      axios.post('/api/v3/user/reroll');

      return rerollResult;
    }
    case 'rebirth_orb':
      return store.dispatch('user:rebirth');
    case 'potion':
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
