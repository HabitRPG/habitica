import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

import getOfficialPinnedItems from '../../../../../website/common/script/libs/getOfficialPinnedItems.js';

describe('POST /user/move-pinned-item/:path/move/to/:position', () => {
  let user;
  let officialPinnedItems;
  let officialPinnedItemPaths;

  beforeEach(async () => {
    user = await generateUser();
    officialPinnedItems = getOfficialPinnedItems(user);

    officialPinnedItemPaths = [];
    // officialPinnedItems are returned in { type: ..., path:... } format but we just need the paths for testPinnedItemsOrder
    if (officialPinnedItems.length > 0) {
      officialPinnedItemPaths = officialPinnedItems.map(item => item.path);
    }
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

    // For this test put seasonal items at the end so they stay out of the way
    testPinnedItemsOrder = testPinnedItemsOrder.concat(officialPinnedItemPaths);

    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
    });

    let res = await user.post('/user/move-pinned-item/armoire/move/to/5');
    await user.sync();

    expect(user.pinnedItemsOrder[5]).to.equal('armoire');
    expect(user.pinnedItemsOrder[2]).to.equal('gear.flat.weapon_warrior_1');

    // We have done nothing to change pinnedItems!
    expect(user.pinnedItems).to.deep.equal(testPinnedItems);

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
    let testPinnedItems = [
      { type: 'card', path: 'cardTypes.thankyou' },
      { type: 'card', path: 'cardTypes.greeting' },
      { type: 'potion', path: 'potion' },
      { type: 'armoire', path: 'armoire' },
    ];

    let testPinnedItemsOrder = [
      'armoire',
      'potion',
    ];

    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
    });

    let res = await user.post('/user/move-pinned-item/armoire/move/to/1');
    await user.sync();

    // The basic test
    expect(user.pinnedItemsOrder[1]).to.equal('armoire');

    // potion is now the last item because the 2 unacounted for cards show up
    // at the beginning of the order
    expect(user.pinnedItemsOrder[user.pinnedItemsOrder.length - 1]).to.equal('potion');

    let expectedResponse = [
      'cardTypes.thankyou',
      'cardTypes.greeting',
      'potion',
    ];
    // inAppRewards is used here and will by default put these seasonal items in the front like this:
    expectedResponse = officialPinnedItemPaths.concat(expectedResponse);
    // now put "armoire" in where we moved it:
    expectedResponse.splice(1, 0, 'armoire');

    expect(res).to.eql(expectedResponse);
  });

  it('cannot move pinned item that you do not have pinned', async () => {
    let testPinnedItems = [
      { type: 'potion', path: 'potion' },
      { type: 'armoire', path: 'armoire' },
    ];

    let testPinnedItemsOrder = [
      'armoire',
      'potion',
    ];

    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
    });

    try {
      await user.post('/user/move-pinned-item/cardTypes.thankyou/move/to/1');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});
