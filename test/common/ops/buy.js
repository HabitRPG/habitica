/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../helpers/common.helper';
import count from '../../../common/script/count';
import buy from '../../../common/script/ops/buy';
import shared from '../../../common/script';
import content from '../../../common/script/content/index';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';

describe('shared.ops.buy', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
          },
          equipped: {
            weapon_warrior_0: true,
          },
        },
      },
      stats: { gp: 200 },
    });

    sinon.stub(shared.fns, 'randomVal');
    sinon.stub(shared.fns, 'predictableRandom');
  });

  afterEach(() => {
    shared.fns.randomVal.restore();
    shared.fns.predictableRandom.restore();
  });

  context('Potion', () => {
    it('recovers 15 hp', () => {
      user.stats.hp = 30;
      buy(user, {params: {key: 'potion'}});
      expect(user.stats.hp).to.eql(45);
    });

    it('does not increase hp above 50', () => {
      user.stats.hp = 45;
      buy(user, {params: {key: 'potion'}});
      expect(user.stats.hp).to.eql(50);
    });

    it('deducts 25 gp', () => {
      user.stats.hp = 45;
      buy(user, {params: {key: 'potion'}});

      expect(user.stats.gp).to.eql(175);
    });

    it('does not purchase if not enough gp', (done) => {
      user.stats.hp = 45;
      user.stats.gp = 5;
      try {
        buy(user, {params: {key: 'potion'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.stats.hp).to.eql(45);
        expect(user.stats.gp).to.eql(5);

        done();
      }
    });
  });

  context('Gear', () => {
    it('adds equipment to inventory', () => {
      user.stats.gp = 31;

      buy(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.owned).to.eql({ weapon_warrior_0: true, armor_warrior_1: true });
    });

    it('deducts gold from user', () => {
      user.stats.gp = 31;

      buy(user, {params: {key: 'armor_warrior_1'}});

      expect(user.stats.gp).to.eql(1);
    });

    it('auto equips equipment if user has auto-equip preference turned on', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = true;

      buy(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped).to.have.property('armor', 'armor_warrior_1');
    });

    it('buys equipment but does not auto-equip', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = false;

      buy(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped.property).to.not.equal('armor_warrior_1');
    });

    // TODO after user.ops.equip is done
    xit('removes one-handed weapon and shield if auto-equip is on and a two-hander is bought', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = true;
      buy(user, {params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      buy(user, {params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      buy(user, {params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_base_0');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_wizard_1');
    });

    // TODO after user.ops.equip is done
    xit('buys two-handed equipment but does not automatically remove sword or shield', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = false;
      buy(user, {params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      buy(user, {params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      buy(user, {params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_warrior_1');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_warrior_1');
    });

    it('does not buy equipment without enough Gold', (done) => {
      user.stats.gp = 20;

      try {
        buy(user, {params: {key: 'armor_warrior_1'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.not.have.property('armor_warrior_1');
        done();
      }
    });
  });

  context('Enchanted Armoire', () => {
    let YIELD_EQUIPMENT = 0.5;
    let YIELD_FOOD = 0.7;
    let YIELD_EXP = 0.9;

    let fullArmoire = {};

    _(content.gearTypes).each((type) => {
      _(content.gear.tree[type].armoire).each((gearObject) => {
        let armoireKey = gearObject.key;

        fullArmoire[armoireKey] = true;
      }).value();
    }).value();

    beforeEach(() => {
      user.achievements.ultimateGearSets = { rogue: true };
      user.flags.armoireOpened = true;
      user.stats.exp = 0;
      user.items.food = {};
    });

    context('failure conditions', () => {
      it('does not open if user does not have enough gold', (done) => {
        shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.stats.gp = 50;

        try {
          buy(user, {params: {key: 'armoire'}});
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
          expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        }
      });

      it('does not open without Ultimate Gear achievement', (done) => {
        shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.achievements.ultimateGearSets = {healer: false, wizard: false, rogue: false, warrior: false};

        try {
          buy(user, {params: {key: 'armoire'}});
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('cannoyBuyItem'));
          expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        }
      });
    });

    context('non-gear awards', () => {
      // Skipped because can't stub predictableRandom correctly
      xit('gives Experience', () => {
        shared.fns.predictableRandom.returns(YIELD_EXP);

        buy(user, {params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(46);
        expect(user.stats.gp).to.eql(100);
      });

      // Skipped because can't stub predictableRandom correctly
      xit('gives food', () => {
        let honey = content.food.Honey;

        shared.fns.randomVal.returns(honey);
        shared.fns.predictableRandom.returns(YIELD_FOOD);

        buy(user, {params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
        expect(user.items.food).to.eql({Honey: 1});
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      // Skipped because can't stub predictableRandom correctly
      xit('does not give equipment if all equipment has been found', () => {
        shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = fullArmoire;
        user.stats.gp = 150;

        buy(user, {params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql(fullArmoire);
        let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(0);

        expect(user.stats.exp).to.eql(30);
        expect(user.stats.gp).to.eql(50);
      });
    });

    context('gear awards', () => {
      beforeEach(() => {
        let shield = content.gear.tree.shield.armoire.gladiatorShield;

        shared.fns.randomVal.returns(shield);
      });

      // Skipped because can't stub predictableRandom correctly
      xit('always drops equipment the first time', () => {
        delete user.flags.armoireOpened;
        shared.fns.predictableRandom.returns(YIELD_EXP);

        buy(user, {params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
          shield_armoire_gladiatorShield: true,
        });

        let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(_.size(fullArmoire) - 1);
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      // Skipped because can't stub predictableRandom correctly
      xit('gives more equipment', () => {
        shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = {
          weapon_warrior_0: true,
          head_armoire_hornedIronHelm: true,
        };
        user.stats.gp = 200;

        buy(user, {params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true, shield_armoire_gladiatorShield: true, head_armoire_hornedIronHelm: true});
        let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(_.size(fullArmoire) - 2);
        expect(user.stats.gp).to.eql(100);
      });
    });
  });
});
