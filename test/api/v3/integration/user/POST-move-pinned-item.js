import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

import getOfficialPinnedItems from '../../../../../website/common/script/libs/getOfficialPinnedItems.js';

describe('POST /user/move-pinned-item/:path/move/to/:position', () => {
  let user;
  let officialPinnedItems;

  beforeEach(async () => {
    user = await generateUser();
    officialPinnedItems = getOfficialPinnedItems(user);
  });

  it('adjusts the order of pinned items with no order mismatch', async () => {
    let testPinnedItems = [
      { type: 'armoire', path: 'armoire' },
      { type: 'potion', path: 'potion' },
      { type: 'marketGear', path: 'gear.flat.weapon_warrior_1' },
      { type: 'marketGear', path: 'gear.flat.head_warrior_1' },
      { type: 'marketGear', path: 'gear.flat.armor_warrior_1' },
      { type: 'hatchingPotions', path: 'hatchingPotions.Golden' },
      { type: 'marketGear', path: 'gear.flat.shield_warrior_1' },
      { type: 'card', path: 'cardTypes.greeting' },
      { type: 'potion', path: 'hatchingPotions.Golden' },
      { type: 'card', path: 'cardTypes.thankyou' },
      { type: 'food', path: 'food.Saddle' },
    ];

    let testPinnedItemsOrder = [
      'hatchingPotions.Golden',
      'cardTypes.greeting',
      'armoire',
      'gear.flat.weapon_warrior_1',
      'gear.flat.head_warrior_1',
      'cardTypes.thankyou',
      'gear.flat.armor_warrior_1',
      'food.Saddle',
      'gear.flat.shield_warrior_1',
      'potion',
    ];

    let officialPinnedItemPaths = [];

    // officialPinnedItems are returned in { type: ..., path:... } format
    // but we just need the paths for testPinnedItemsOrder
    if (officialPinnedItems.length > 0) {
      officialPinnedItemPaths = officialPinnedItems.map(item => item.path);
      // For this test put the seasonal items at the end where they can stay out of the way
      testPinnedItemsOrder = testPinnedItemsOrder.concat(officialPinnedItemPaths);
    }

    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
    });

    let res = await user.post('/user/move-pinned-item/armoire/move/to/5');
    await user.sync();

    expect(user.pinnedItemsOrder[5]).to.equal('armoire');
    expect(user.pinnedItemsOrder[2]).to.equal('gear.flat.weapon_warrior_1');

    let expectedResponse = [
      'hatchingPotions.Golden',
      'cardTypes.greeting',
      'gear.flat.weapon_warrior_1',
      'gear.flat.head_warrior_1',
      'cardTypes.thankyou',
      'armoire',
      'gear.flat.armor_warrior_1',
      'food.Saddle',
      'gear.flat.shield_warrior_1',
      'potion',
    ];
    expectedResponse = expectedResponse.concat(officialPinnedItemPaths);

    expect(res).to.eql(expectedResponse);
  });

  it('adjusts the order of pinned items with order mismatch', async () => {
    // TODO - create test where pinned items need to be refreshed
  });

  it('adjusts the order of pinned items using seasonal unpinned item', async () => {
    // TODO - create a test with seasonal item that has been unpinned and thus
    // not used anymore
  });
});
