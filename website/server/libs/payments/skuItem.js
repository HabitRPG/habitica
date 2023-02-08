import moment from 'moment';
import {
  BadRequest,
} from '../errors';
import shared from '../../../common';
import { getAnalyticsServiceByEnvironment } from '../analyticsService';
import { getGemsBlock, buyGems } from './gems'; // eslint-disable-line import/no-cycle

const analytics = getAnalyticsServiceByEnvironment();

const RESPONSE_INVALID_ITEM = 'INVALID_ITEM_PURCHASED';

const EVENTS = {
  birthday10: {
    start: '2023-01-30T08:00-05:00',
    end: '2023-02-08T23:59-05:00',
  },
};

function canBuyGryphatrice (user) {
  if (!moment().isBetween(EVENTS.birthday10.start, EVENTS.birthday10.end)) return false;
  if (user.items.pets['Gryphatrice-Jubilant']) return false;
  return true;
}

async function buyGryphatrice (data) {
  // Double check it's available
  if (!canBuyGryphatrice(data.user)) throw new BadRequest();
  const key = 'Gryphatrice-Jubilant';
  data.user.items.pets[key] = 5;
  data.user.purchased.txnCount += 1;

  analytics.trackPurchase({
    uuid: data.user._id,
    itemPurchased: 'Gryphatrice',
    sku: `${data.paymentMethod.toLowerCase()}-checkout`,
    purchaseType: 'checkout',
    paymentMethod: data.paymentMethod,
    quantity: 1,
    gift: Boolean(data.gift),
    purchaseValue: 10,
    headers: data.headers,
    firstPurchase: data.user.purchased.txnCount === 1,
  });
  if (data.user.markModified) data.user.markModified('items.pets');
  await data.user.save();
}

export function canBuySkuItem (sku, user) {
  switch (sku) {
    case 'com.habitrpg.android.habitica.iap.pets.gryphatrice_jubilant':
    case 'com.habitrpg.ios.Habitica.pets.Gryphatrice_Jubilant':
    case 'Pet-Gryphatrice-Jubilant':
    case 'price_0MPZ6iZCD0RifGXlLah2furv':
      return canBuyGryphatrice(user);
    default:
      return true;
  }
}

export async function buySkuItem (data) {
  let gemsBlockKey;

  switch (data.sku) { // eslint-disable-line default-case
    case 'com.habitrpg.android.habitica.iap.4gems':
    case 'com.habitrpg.ios.Habitica.4gems':
      gemsBlockKey = '4gems';
      break;
    case 'com.habitrpg.android.habitica.iap.20gems':
    case 'com.habitrpg.android.habitica.iap.21gems':
    case 'com.habitrpg.ios.Habitica.20gems':
    case 'com.habitrpg.ios.Habitica.21gems':
      gemsBlockKey = '21gems';
      break;
    case 'com.habitrpg.android.habitica.iap.42gems':
    case 'com.habitrpg.ios.Habitica.42gems':
      gemsBlockKey = '42gems';
      break;
    case 'com.habitrpg.android.habitica.iap.84gems':
    case 'com.habitrpg.ios.Habitica.84gems':
      gemsBlockKey = '84gems';
      break;
    case 'com.habitrpg.android.habitica.iap.pets.gryphatrice_jubilant':
    case 'com.habitrpg.ios.Habitica.pets.Gryphatrice_Jubilant':
    case 'Pet-Gryphatrice-Jubilant':
    case 'price_0MPZ6iZCD0RifGXlLah2furv':
      buyGryphatrice(data);
      return;
  }

  if (gemsBlockKey) {
    const gemsBlock = getGemsBlock(gemsBlockKey);

    if (data.gift) {
      data.gift.type = 'gems';
      if (!data.gift.gems) data.gift.gems = {};
      data.gift.gems.amount = shared.content.gems[gemsBlock.key].gems;
    }

    await buyGems({
      user: data.user,
      gift: data.gift,
      paymentMethod: data.paymentMethod,
      gemsBlock,
      headers: data.headers,
    });
    return;
  }
  throw new BadRequest(RESPONSE_INVALID_ITEM);
}
