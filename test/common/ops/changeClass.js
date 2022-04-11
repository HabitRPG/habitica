/* eslint-disable camelcase */

import changeClass from '../../../website/common/script/ops/changeClass';
import {
  NotAuthorized,
  BadRequest,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.changeClass', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.stats.lvl = 11;
    user.stats.flagSelected = false;
  });

  it('user is not level 10', async () => {
    user.stats.lvl = 9;
    try {
      await await changeClass(user, { query: { class: 'rogue' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('lvl10ChangeClass'));
    }
  });

  it('req.query.class is an invalid class', async () => {
    user.flags.classSelected = false;
    user.preferences.disableClasses = false;

    try {
      await changeClass(user, { query: { class: 'cellist' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidClass'));
    }
  });

  context('req.query.class is a valid class', () => {
    it('errors if user.stats.flagSelected is true and user.balance < 0.75', async () => {
      user.flags.classSelected = true;
      user.preferences.disableClasses = false;
      user.balance = 0;

      try {
        await changeClass(user, { query: { class: 'rogue' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
      }
    });

    it('changes class', async () => {
      user.stats.class = 'healer';
      user.items.gear.owned.weapon_healer_3 = true;
      user.items.gear.equipped.weapon = 'weapon_healer_3';

      const [data] = await changeClass(user, { query: { class: 'rogue' } });
      expect(data).to.eql({
        preferences: user.preferences,
        stats: user.stats,
        flags: user.flags,
        items: user.items,
      });

      expect(user.stats.class).to.equal('rogue');
      expect(user.flags.classSelected).to.be.true;
      expect(user.items.gear.owned.weapon_rogue_0).to.be.true;
      expect(user.items.gear.owned.shield_rogue_0).to.be.true;
      expect(user.items.gear.owned.weapon_healer_3).to.be.true;
      expect(user.items.gear.equipped.weapon).to.equal('weapon_healer_3');
    });
  });

  context('req.query.class is missing or user.stats.flagSelected is true', () => {
    it('has user.preferences.disableClasses === true', async () => {
      user.balance = 1;
      user.preferences.disableClasses = true;
      user.preferences.autoAllocate = true;
      user.stats.points = 45;
      user.stats.str = 1;
      user.stats.con = 2;
      user.stats.per = 3;
      user.stats.int = 4;
      user.flags.classSelected = true;

      const [data] = await changeClass(user);
      expect(data).to.eql({
        preferences: user.preferences,
        stats: user.stats,
        flags: user.flags,
        items: user.items,
      });

      expect(user.preferences.disableClasses).to.be.false;
      expect(user.preferences.autoAllocate).to.be.false;
      expect(user.balance).to.equal(1);
      expect(user.stats.str).to.equal(0);
      expect(user.stats.con).to.equal(0);
      expect(user.stats.per).to.equal(0);
      expect(user.stats.int).to.equal(0);
      expect(user.stats.points).to.equal(11);
      expect(user.flags.classSelected).to.equal(false);
    });

    context('has user.preferences.disableClasses !== true', () => {
      it('and less than 3 gems', async () => {
        user.balance = 0.5;
        try {
          await changeClass(user);
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('notEnoughGems'));
        }
      });

      it('and at least 3 gems', async () => {
        user.balance = 1;
        user.stats.points = 45;
        user.stats.str = 1;
        user.stats.con = 2;
        user.stats.per = 3;
        user.stats.int = 4;
        user.flags.classSelected = true;

        const [data] = await changeClass(user);
        expect(data).to.eql({
          preferences: user.preferences,
          stats: user.stats,
          flags: user.flags,
          items: user.items,
        });

        expect(user.balance).to.equal(0.25);
        expect(user.stats.str).to.equal(0);
        expect(user.stats.con).to.equal(0);
        expect(user.stats.per).to.equal(0);
        expect(user.stats.int).to.equal(0);
        expect(user.stats.points).to.equal(11);
        expect(user.flags.classSelected).to.equal(false);
      });
    });
  });
});
