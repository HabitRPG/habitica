import {
  generateUser,
} from '../../helpers/common.helper';

import getDebuffPotionItems from '../../../website/common/script/libs/getDebuffPotionItems';
import { TRANSFORMATION_DEBUFFS_LIST } from '../../../website/common/script/constants';

describe('getDebuffPotionItems', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  for (const key of Object.keys(TRANSFORMATION_DEBUFFS_LIST)) {
    const debuff = TRANSFORMATION_DEBUFFS_LIST[key];
    // Here we iterate the whole object to dynamically create test suites as
    // described in mocha's docs
    // https://mochajs.org/#dynamically-generating-tests
    // That's why we have eslint-disable here
    // eslint-disable-next-line no-loop-func
    it(`Should return the ${debuff} on ${key} buff`, () => {
      user.stats.buffs[key] = true;

      const result = getDebuffPotionItems(user);

      expect(result).to.be.an('array').that.deep
        .includes({ path: `spells.special.${debuff}`, type: 'debuffPotion' });
    });
  }

  it('Should return all debuff potions for all buffs', () => {
    user.stats.buffs.seafoam = true;
    user.stats.buffs.spookySparkles = true;
    user.stats.buffs.snowball = true;
    user.stats.buffs.shinySeed = true;

    const result = getDebuffPotionItems(user);

    expect(result).to.be.an('array').that.deep.include.members([
      { path: 'spells.special.sand', type: 'debuffPotion' },
      { path: 'spells.special.petalFreePotion', type: 'debuffPotion' },
      { path: 'spells.special.salt', type: 'debuffPotion' },
      { path: 'spells.special.opaquePotion', type: 'debuffPotion' },
    ]);
  });
});
