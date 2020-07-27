import {
  generateUser,
} from '../../helpers/common.helper';

import setDebuffPotionItems from '../../../website/common/script/libs/setDebuffPotionItems';

describe('setDebuffPotionItems', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('Should push the debuff item to pinned items of user', () => {
    user.stats.buffs.spookySparkles = true;
    const previousPinnedItemsLength = user.pinnedItems.length;

    const result = setDebuffPotionItems(user);

    expect(result.pinnedItems.length).to.be.greaterThan(previousPinnedItemsLength);
  });

  it('Shouldn\'t create duplicate of already added debuff potion', () => {
    user.stats.buffs.spookySparkles = true;

    const firstSetResult = [...setDebuffPotionItems(user).pinnedItems];
    const secondSetResult = [...setDebuffPotionItems(user).pinnedItems];

    expect(firstSetResult).to.be.deep.equal(secondSetResult);
  });

  it('Should remove all debuff items from pinnedItems of the user if user have no buffs', () => {
    user.stats.buffs.seafoam = true;
    user.stats.buffs.spookySparkles = true;
    user.stats.buffs.snowball = true;
    user.stats.buffs.shinySeed = true;

    const firstSetResult = [...setDebuffPotionItems(user).pinnedItems];

    expect(firstSetResult).to.have.lengthOf(4);

    user.stats.buffs.seafoam = false;
    user.stats.buffs.spookySparkles = false;
    user.stats.buffs.snowball = false;
    user.stats.buffs.shinySeed = false;

    const secondSetResult = [...setDebuffPotionItems(user).pinnedItems];

    expect(secondSetResult).to.have.lengthOf(0);
  });
});
