import axios from 'axios';
import buyOp from 'common/script/ops/buy/buy';
import content from 'common/script/content/index';
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

function buyItem (store, params) {
  const quantity = params.quantity || 1;
  const user = store.state.user.data;

  let opResult = buyOp(user, {params, quantity});

  user.pinnedItems = opResult[0].pinnedItems;


  return {
    result: opResult,
    httpCall: axios.post(`/api/v4/user/buy/${params.key}`),
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
    httpCall: axios.post(`/api/v4/user/buy/${params.key}`, {type: 'quest', quantity}),
  };
}

async function buyArmoire (store, params) {
  const quantity = params.quantity || 1;
  let armoire = content.armoire;

  // We need the server result because Armoire has random item in the result
  let result = await axios.post('/api/v4/user/buy/armoire', {
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

    if (item.type === 'food') {
      if (!store.state.user.data.items.food[item.dropKey]) store.state.user.data.items.food[item.dropKey] = 0;
      store.state.user.data.items.food[item.dropKey] += 1;
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
  let opResult = buyOp(user, {params, quantity});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v4/user/purchase/${params.type}/${params.key}`, {quantity}),
  };
}

export function purchaseMysterySet (store, params) {
  const user = store.state.user.data;
  let opResult = buyOp(user, {params, type: 'mystery'});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v4/user/buy/${params.key}`, {type: 'mystery'}),
  };
}

export function purchaseHourglassItem (store, params) {
  const user = store.state.user.data;
  let opResult = hourglassPurchaseOp(user, {params});

  return {
    result: opResult,
    httpCall: axios.post(`/api/v4/user/purchase-hourglass/${params.type}/${params.key}`),
  };
}

export function unlock (store, params) {
  const user = store.state.user.data;
  let opResult = unlockOp(user, params);

  return {
    result: opResult,
    httpCall: axios.post(`/api/v4/user/unlock?path=${params.query.path}`),
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

      await axios.post('/api/v4/user/reroll');
      await Promise.all([
        store.dispatch('user:fetch', {forceLoad: true}),
        store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
      ]);

      return rerollResult;
    }
    case 'rebirth_orb':
      return store.dispatch('user:rebirth');
    case 'armory_key':
      return store.dispatch('user:emptyArmory');
    case 'potion':
    case 'marketGear':
      // 'marketGear' gets `type`= `gear` which is used for gem-purchasable gear
      // resetting type to pinType only here
      return buyItem(store, {...params, type: params.pinType});
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
  axios.post(`/api/v4/user/sell/${params.type}/${params.key}?amount=${params.amount}`);
}

export function releasePets (store, params) {
  releasePetsOp(params.user);
  axios.post('/api/v4/user/release-pets');
}

export function releaseMounts (store, params) {
  releaseMountsOp(params.user);
  axios.post('/api/v4/user/release-mounts');
}

export function releaseBoth (store, params) {
  releaseBothOp(params.user);
  axios.post('/api/v4/user/release-both');
}
