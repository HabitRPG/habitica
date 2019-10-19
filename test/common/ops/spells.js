import {
  generateUser,
} from '../../helpers/common.helper';
import spells from '../../../website/common/script/content/spells';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

// TODO complete the test suite...

describe('shared.ops.spells', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns an error when healer tries to cast Healing Light with full health', done => {
    user.stats.class = 'healer';
    user.stats.lvl = 11;
    user.stats.hp = 50;
    user.stats.mp = 200;

    const spell = spells.healer.heal;

    try {
      spell.cast(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageHealthAlreadyMax'));
      expect(user.stats.hp).to.eql(50);
      expect(user.stats.mp).to.eql(200);

      done();
    }
  });
});
