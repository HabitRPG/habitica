import {
  generateUser,
} from '../../helpers/common.helper';
import spells from '../../../website/common/script/content/spells';
import {
  NotAuthorized,
  BadRequest,
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
      spell.cast(user, null, { language: 'en' });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageHealthAlreadyMax'));
      expect(user.stats.hp).to.eql(50);
      expect(user.stats.mp).to.eql(200);

      done();
    }
  });

  it('Issue #12361: returns an error if chilling frost has already been cast', done => {
    user.stats.class = 'wizard';
    user.stats.lvl = 15;
    user.stats.mp = 400;
    user.stats.buffs.streaks = true;

    const spell = spells.wizard.frost;
    try {
      spell.cast(user, null, { language: 'en' });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('spellAlreadyCast'));
      expect(user.stats.mp).to.eql(400);

      done();
    }
  });
});
