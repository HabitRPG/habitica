import {
  generateUser,
} from '../../helpers/api-integration/v3';
import getOfficialPinnedItems from '../../../website/common/script/libs/getOfficialPinnedItems.js';
import inAppRewards from '../../../website/common/script/libs/inAppRewards';

describe('inAppRewards', () => {
  let user;
  let officialPinnedItems;
  let officialPinnedItemPaths;
  let testPinnedItems;
  let testPinnedItemsOrder;

  beforeEach(async () => {
    user = await generateUser();
    officialPinnedItems = getOfficialPinnedItems(user);

    officialPinnedItemPaths = [];
    // officialPinnedItems are returned in { type: ..., path:... } format but we just need the paths for testPinnedItemsOrder
    if (officialPinnedItems.length > 0) {
      officialPinnedItemPaths = officialPinnedItems.map(item => item.path);
    }

    testPinnedItems = [
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

    testPinnedItemsOrder = [
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
  });

  it.only('returns the pinned items in the correct order', async () => {
    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
    });
    await user.sync();
    let result = inAppRewards();
    expect(result[2].path).to.eql('armoire');
    expect(result[9].path).to.eql('potion');
  });

  it('does not return seasonal items which have been unpinned', async () => {
    if (officialPinnedItems.length > 0){
      let testUnpinnedItem = officialPinnedItems[0];
      let testUnpinnedPath = testUnpinnedItem.path;
    } else {
      return; // if no seasonal items, this test is not applicable
    }

    await user.update({
      pinnedItems: testPinnedItems,
      pinnedItemsOrder: testPinnedItemsOrder,
      unpinnedItems: testUnpinnedItems,
    });
    await user.sync();

    let result = inAppRewards();
    let itemPaths = result.map(item => item.path);
    expect(itemPaths).to.not.inlude(testUnpinnedPath);
  });
});
