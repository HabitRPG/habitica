import {
  generateUser,
} from '../helpers/common.helper';
import spells from '../../website/common/script/content/spells';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import { TRANSFORMATION_DEBUFFS_LIST } from '../../website/common/script/constants';

// TODO complete the test suite...

describe('shared.ops.spells', () => {
  let user;
  let target;

  beforeEach(() => {
    user = generateUser();
    target = generateUser();
  });

  it('all spells have required properties', () => {
    for (const category of Object.values(spells)) {
      for (const spell of Object.values(category)) {
        expectValidTranslationString(spell.text, spell.key);
        expectValidTranslationString(spell.notes);
        expect(spell.target, spell.key).to.be.oneOf(['self', 'party', 'task', 'tasks', 'user']);
      }
    }
  });

  it('all special spells have a working cast method', async () => {
    for (const s of Object.values(spells.special)) {
      user.items.special[s.key] = 1;
      s.cast(user, target, { language: 'en' });
    }
  });

  it('all debuff spells cost 5 gold', () => {
    for (const s of Object.values(spells.special)) {
      if (s.purchaseType === 'debuffPotion') {
        user.stats.gp = 5;
        s.cast(user);
        expect(user.stats.gp).to.equal(0);
      }
    }
  });

  it('all debuff spells remove the buff', () => {
    const debuffMapping = {};
    Object.keys(TRANSFORMATION_DEBUFFS_LIST).forEach(key => {
      debuffMapping[TRANSFORMATION_DEBUFFS_LIST[key]] = key;
    });
    for (const s of Object.values(spells.special)) {
      if (s.purchaseType === 'debuffPotion') {
        user.stats.gp = 5;
        user.stats.buffs[debuffMapping[s.key]] = true;
        expect(user.stats.buffs[debuffMapping[s.key]]).to.equal(true);
        s.cast(user);
        expect(user.stats.buffs[debuffMapping[s.key]]).to.equal(false);
      }
    }
  });
});
