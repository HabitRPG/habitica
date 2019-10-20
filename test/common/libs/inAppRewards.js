import {
  generateUser,
} from '../../helpers/common.helper';
import getOfficialPinnedItems from '../../../website/common/script/libs/getOfficialPinnedItems';
import inAppRewards from '../../../website/common/script/libs/inAppRewards';

describe('inAppRewards', () => {
  let user;
  let officialPinnedItems;
  let officialPinnedItemPaths;
  let testPinnedItems;
  let testPinnedItemsOrder;

  beforeEach(() => {
    user = generateUser();
    officialPinnedItems = getOfficialPinnedItems(user);

    officialPinnedItemPaths = [];
    // officialPinnedItems are returned in { type: ..., path:... } format
    // but we just need the paths for testPinnedItemsOrder
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

  it('returns the pinned items in the correct order', () => {
    user.pinnedItems = testPinnedItems;
    user.pinnedItemsOrder = testPinnedItemsOrder;

    const result = inAppRewards(user);

    expect(result[2].path).to.eql('armoire');
    expect(result[9].path).to.eql('potion');
  });

  it('ignores null/undefined entries', () => {
    user.pinnedItems = testPinnedItems;
    user.pinnedItems.push(null);
    user.pinnedItems.push(undefined);
    user.pinnedItemsOrder = testPinnedItemsOrder;

    const result = inAppRewards(user);

    expect(result[2].path).to.eql('armoire');
    expect(result[9].path).to.eql('potion');
  });

  it('does not return seasonal items which have been unpinned', () => {
    if (officialPinnedItems.length === 0) {
      return; // if no seasonal items, this test is not applicable
    }

    const testUnpinnedItem = officialPinnedItems[0];
    const testUnpinnedPath = testUnpinnedItem.path;
    const testUnpinnedItems = [
      { type: testUnpinnedItem.type, path: testUnpinnedPath },
    ];

    user.pinnedItems = testPinnedItems;
    user.pinnedItemsOrder = testPinnedItemsOrder;
    user.unpinnedItems = testUnpinnedItems;

    const result = inAppRewards(user);
    const itemPaths = result.map(item => item.path);
    expect(itemPaths).to.not.include(testUnpinnedPath);
  });
});
