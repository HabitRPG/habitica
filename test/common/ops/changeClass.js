import changeClass from '../../../common/script/ops/changeClass';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.changeClass', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  context('req.query.class is a valid class', () => {
    it('changes class', () => {
      user.stats.class = 'healer';
      user.items.gear.owned.armor_rogue_1 = true; // eslint-disable-line camelcase

      let res = changeClass(user, {query: {class: 'rogue'}});
      expect(res).to.eql({
        data: {
          preferences: user.preferences,
          stats: user.stats,
          flags: user.flags,
          items: user.items,
        },
      });

      expect(user.stats.class).to.equal('rogue');
      expect(user.flags.classSelected).to.be.true;
      expect(user.items.gear.equipped.weapon).to.equal('weapon_rogue_0');
      expect(user.items.gear.owned.weapon_rogue_0).to.be.true;
      expect(user.items.gear.equipped.armor).to.equal('armor_rogue_1');
      expect(user.items.gear.owned.armor_rogue_1).to.be.true;
      expect(user.items.gear.equipped.shield).to.equal('shield_rogue_0');
      expect(user.items.gear.owned.shield_rogue_0).to.be.true;
      expect(user.items.gear.equipped.head).to.equal('head_base_0');
    });
  });

  context('req.query.class is missing', () => {
    it('has user.preferences.disableClasses === true', () => {
      user.balance = 1;
      user.preferences.disableClasses = true;
      user.preferences.autoAllocate = true;
      user.stats.points = 45;
      user.stats.lvl = 3;
      user.stats.str = 1;
      user.stats.con = 2;
      user.stats.per = 3;
      user.stats.int = 4;
      user.flags.classSelected = true;

      let res = changeClass(user);
      expect(res).to.eql({
        data: {
          preferences: user.preferences,
          stats: user.stats,
          flags: user.flags,
          items: user.items,
        },
      });

      expect(user.preferences.disableClasses).to.be.false;
      expect(user.preferences.autoAllocate).to.be.false;
      expect(user.balance).to.equal(1);
      expect(user.stats.str).to.equal(0);
      expect(user.stats.con).to.equal(0);
      expect(user.stats.per).to.equal(0);
      expect(user.stats.int).to.equal(0);
      expect(user.stats.points).to.equal(3);
      expect(user.flags.classSelected).to.equal(false);
    });

    context('has user.preferences.disableClasses !== true', () => {
      it('and less than 3 gems', (done) => {
        user.balance = 0.5;
        try {
          changeClass(user);
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('notEnoughGems'));
          done();
        }
      });

      it('and at least 3 gems', () => {
        user.balance = 1;
        user.stats.points = 45;
        user.stats.lvl = 3;
        user.stats.str = 1;
        user.stats.con = 2;
        user.stats.per = 3;
        user.stats.int = 4;
        user.flags.classSelected = true;

        let res = changeClass(user);
        expect(res).to.eql({
          data: {
            preferences: user.preferences,
            stats: user.stats,
            flags: user.flags,
            items: user.items,
          },
        });

        expect(user.balance).to.equal(0.25);
        expect(user.stats.str).to.equal(0);
        expect(user.stats.con).to.equal(0);
        expect(user.stats.per).to.equal(0);
        expect(user.stats.int).to.equal(0);
        expect(user.stats.points).to.equal(3);
        expect(user.flags.classSelected).to.equal(false);
      });
    });
  });
});
