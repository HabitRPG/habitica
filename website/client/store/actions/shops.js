import axios from 'axios';
import buyOp from 'common/script/ops/buy';
import purchaseOp from 'common/script/ops/purchaseWithSpell';
import hourglassPurchaseOp from 'common/script/ops/hourglassPurchase';
import sellOp from 'common/script/ops/sell';
import unlockOp from 'common/script/ops/unlock';
import rerollOp from 'common/script/ops/reroll';
import { getDropClass } from 'client/libs/notifications';

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
  let opResult = buyOp(user, {params, type: 'quest'});

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
  let opResult = buyOp(user, {params, noConfirm: true, type: 'mystery'});

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

export async function genericPurchase (store, params) {
  switch (params.pinType) {
    case 'mystery_set':
      return purchaseMysterySet(store, params);
    case 'armoire': // eslint-disable-line
      let buyResult = buyOp(store.state.user.data, {type: 'armoire'});

      // We need the server result because armoir has random item in the result
      let result = await axios.post('/api/v3/user/buy-armoire');
      buyResult = result.data.data;

      if (buyResult) {
        const resData = buyResult;
        const item = resData.armoire;

        const isExperience = item.type === 'experience';

        if (item.type === 'gear') {
          store.state.user.data.items.gear.owned[item.dropKey] = true;
        }

        // @TODO: We might need to abstract notifications to library rather than mixin
        store.state.notificationStore.push({
          title: '',
          text: isExperience ? item.value : item.dropText,
          type: isExperience ? 'xp' : 'drop',
          icon: isExperience ? null : getDropClass({type: item.type, key: item.dropKey}),
          timeout: true,
        });
      }

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
