import axios from 'axios';
import generateStore from '@/store';

import content from '@/../../common/script/content';
import getItemInfo from '@/../../common/script/libs/getItemInfo';

import getOfficialPinnedItems from '@/../../common/script/libs/getOfficialPinnedItems';

describe('shops actions', () => {
  let store;

  beforeEach(() => {
    store = generateStore();
  });

  describe('genericPurchase', () => {
    it('buy gear', async () => {
      const user = {
        id: 1,
        stats: {
          class: 'rogue',
        },
        items: {
          gear: {
            owned: {},
            equipped: {},
          },
        },
        pinnedItems: [],
        preferences: {
          autoEquip: true,
        },
        achievements: {},
      };

      store.state.user.data = user;

      // select a gear item
      const gearItem = content.gear.flat.armor_rogue_1;

      const item = getItemInfo(user, 'marketGear', gearItem, getOfficialPinnedItems(user));

      sandbox.stub(axios, 'post').withArgs('/api/v4/user/buy/armor_rogue_1').returns(Promise.resolve({ data: { data: {} } }));

      await store.dispatch('shops:genericPurchase', {
        pinType: item.pinType,
        type: item.purchaseType,
        key: item.key,
        currency: item.currency,
        quantity: 1,
      });

      expect(store.state.user.data.items.gear.equipped.armor).to.equal('armor_rogue_1');
    });
  });
});
