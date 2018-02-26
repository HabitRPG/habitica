import axios from 'axios';
import buyOp from 'common/script/ops/buy/buy';
import content from 'common/script/content/index';
import purchaseOp from 'common/script/ops/buy/purchaseWithSpell';
import hourglassPurchaseOp from 'common/script/ops/buy/hourglassPurchase';
import sellOp from 'common/script/ops/sell';
import unlockOp from 'common/script/ops/unlock';
import rerollOp from 'common/script/ops/reroll';
import releasePetsOp from 'common/script/ops/releasePets';
import releaseMountsOp from 'common/script/ops/releaseMounts';
import releaseBothOp from 'common/script/ops/releaseBoth';

import { getDropClass } from 'client/libs/notifications';

// @TODO: Purchase means gems and buy means gold. That wording is misused below, but we should also change
// the generic buy functions to something else. Or have a Gold Vendor and Gem Vendor, etc

export function buyItem (store, params) {
  const quantity = params.quantity || 1;
  const user = store.state.user.data;

  const userPinned = user.pinnedItems.slice();
  let opResult = buyOp(user, {params, quantity});

  // @TODO: Currently resetting the pinned items will reset the market. Purchasing some items does not reset pinned.
  // For now, I've added this hack for items like contributor gear to update while I am working on add more computed
  // properties to the market. We will use this quick fix while testing the other changes.
  user.pinnedItems = userPinned;


  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy/${params.key}`),
  };
}

export function buyQuestItem (store, params) {
  const quantity = params.quantity || 1;
  const user = store.state.user.data;
  let opResult = buyOp(user, {
    params,
    type: 'quest',
    quantity,
  });

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy/${params.key}`, {type: 'quest', quantity}),
  };
}

async function buyArmoire (store, params) {
  const quantity = params.quantity || 1;
  let armoire = content.armoire;

  // We need the server result because Armoire has random item in the result
  let result = await axios.post('/api/v3/user/buy/armoire', {
    type: 'armoire',
    quantity,
  });
  let buyResult = result.data.data;

  if (buyResult) {
    const resData = buyResult;
    const item = resData.armoire;
    const message = result.data.message;

    const isExperience = item.type === 'experience';
    if (item.type === 'gear') {
      store.state.user.data.items.gear.owned[item.dropKey] = true;
    }
    store.state.user.data.stats.gp -= armoire.value;

    // @TODO: We might need to abstract notifications to library rather than mixin
    const notificationOptions = isExperience ?
    {
      text: `+ ${item.value}`,
      type: 'xp',
      flavorMessage: message,
    } :
    {
      text: message,
      type: 'drop',
      icon: getDropClass({type: item.type, key: item.dropKey}),
    };

    store.dispatch('snackbars:add', {
      title: '',
      timeout: true,
      ...notificationOptions,
    });
  }
}

export function purchase (store, params) {
  const quantity = params.quantity || 1;
  const user = store.state.user.data;
  let opResult = purchaseOp(user, {params, quantity});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/purchase/${params.type}/${params.key}`, {quantity}),
  };
}

export function purchaseMysterySet (store, params) {
  const user = store.state.user.data;
  let opResult = buyOp(user, {params, type: 'mystery'});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v3/user/buy/${params.key}`, {type: 'mystery'}),
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
      await buyArmoire(store, params);
      return;
    case 'fortify': {
      let rerollResult = rerollOp(store.state.user.data, store.state.tasks.data);

      await axios.post('/api/v3/user/reroll');
      await Promise.all([
        store.dispatch('user:fetch', {forceLoad: true}),
        store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
      ]);

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
  axios.post(`/api/v3/user/sell/${params.type}/${params.key}?amount=${params.amount}`);
}

export function releasePets (store, params) {
  releasePetsOp(params.user);
  console.log(params.user);
  axios.post('/api/v3/user/release-pets');
}

export function releaseMounts (store, params) {
  releaseMountsOp(params.user);
  axios.post('/api/v3/user/release-mounts');
}

export function releaseBoth (store, params) {
  releaseBothOp(params.user);
  axios.post('/api/v3/user/release-both');
}
