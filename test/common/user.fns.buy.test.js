/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow

let shared = require('../../common/script/index.js');

describe('user.fns.buy', () => {
  let user;

  beforeEach(() => {
    user = {
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
      preferences: {},
      stats: { gp: 200 },
      achievements: { },
      flags: { },
    };

    shared.wrap(user);

    sinon.stub(user.fns, 'randomVal');
    sinon.stub(user.fns, 'predictableRandom');
  });

  afterEach(() => {
    user.fns.randomVal.restore();
    user.fns.predictableRandom.restore();
  });

  context('Potion', () => {
    it('recovers 15 hp', () => {
      user.stats.hp = 30;
      user.ops.buy({params: {key: 'potion'}});
      expect(user.stats.hp).to.eql(45);
    });

    it('does not increase hp above 50', () => {
      user.stats.hp = 45;
      user.ops.buy({params: {key: 'potion'}});
      expect(user.stats.hp).to.eql(50);
    });

    it('deducts 25 gp', () => {
      user.stats.hp = 45;
      user.ops.buy({params: {key: 'potion'}});

      expect(user.stats.gp).to.eql(175);
    });

    it('does not purchase if not enough gp', () => {
      user.stats.hp = 45;
      user.stats.gp = 5;
      user.ops.buy({params: {key: 'potion'}});

      expect(user.stats.hp).to.eql(45);
      expect(user.stats.gp).to.eql(5);
    });
  });

  context('Gear', () => {
    it('adds equipment to inventory', () => {
      user.stats.gp = 31;

      user.ops.buy({params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.owned).to.eql({ weapon_warrior_0: true, armor_warrior_1: true });
    });

    it('deducts gold from user', () => {
      user.stats.gp = 31;

      user.ops.buy({params: {key: 'armor_warrior_1'}});

      expect(user.stats.gp).to.eql(1);
    });

    it('auto equips equipment if user has auto-equip preference turned on', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = true;

      user.ops.buy({params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped).to.have.property('armor', 'armor_warrior_1');
    });

    it('buys equipment but does not auto-equip', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = false;

      user.ops.buy({params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped).to.not.have.property('armor');
    });

    it('removes one-handed weapon and shield if auto-equip is on and a two-hander is bought', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = true;
      user.ops.buy({params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      user.ops.buy({params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      user.ops.buy({params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_base_0');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_wizard_1');
    });

    it('buys two-handed equipment but does not automatically remove sword or shield', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = false;
      user.ops.buy({params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      user.ops.buy({params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      user.ops.buy({params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_warrior_1');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_warrior_1');
    });

    it('does not buy equipment without enough Gold', () => {
      user.stats.gp = 20;

      user.ops.buy({params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.owned).to.not.have.property('armor_warrior_1');
    });
  });

  context('Quests', () => {
    it('buys a Quest scroll');

    it('does not buy Quests without enough Gold');

    it('does not buy nonexistent Quests');

    it('does not buy Gem-premium Quests');
  });

  context('Enchanted Armoire', () => {
    let YIELD_EQUIPMENT = 0.5;
    let YIELD_FOOD = 0.7;
    let YIELD_EXP = 0.9;

    let fullArmoire = {};

    _(shared.content.gearTypes).each((type) => {
      _(shared.content.gear.tree[type].armoire).each((gearObject) => {
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
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.stats.gp = 50;

        user.ops.buy({params: {key: 'armoire'}}, (response) => {
          expect(response.message).to.eql('Not Enough Gold');
          expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        });
      });

      it('does not open without Ultimate Gear achievement', (done) => {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.achievements.ultimateGearSets = {healer: false, wizard: false, rogue: false, warrior: false};

        user.ops.buy({params: {key: 'armoire'}}, (response) => {
          expect(response.message).to.eql('You can\'t buy this item');
          expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        });
      });
    });

    context('non-gear awards', () => {
      it('gives Experience', () => {
        user.fns.predictableRandom.returns(YIELD_EXP);

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(46);
        expect(user.stats.gp).to.eql(100);
      });

      it('gives food', () => {
        let honey = shared.content.food.Honey;

        user.fns.randomVal.returns(honey);
        user.fns.predictableRandom.returns(YIELD_FOOD);

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
        expect(user.items.food).to.eql({Honey: 1});
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      it('does not give equipment if all equipment has been found', () => {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = fullArmoire;
        user.stats.gp = 150;

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql(fullArmoire);
        let armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(0);

        expect(user.stats.exp).to.eql(30);
        expect(user.stats.gp).to.eql(50);
      });
    });

    context('gear awards', () => {
      beforeEach(() => {
        let shield = shared.content.gear.tree.shield.armoire.gladiatorShield;

        user.fns.randomVal.returns(shield);
      });

      it('always drops equipment the first time', () => {
        delete user.flags.armoireOpened;
        user.fns.predictableRandom.returns(YIELD_EXP);

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
          shield_armoire_gladiatorShield: true,
        });

        let armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(_.size(fullArmoire) - 1);
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      it('gives more equipment', () => {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = {
          weapon_warrior_0: true,
          head_armoire_hornedIronHelm: true,
        };
        user.stats.gp = 200;

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({weapon_warrior_0: true, shield_armoire_gladiatorShield: true, head_armoire_hornedIronHelm: true});
        let armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');

        expect(armoireCount).to.eql(_.size(fullArmoire) - 2);
        expect(user.stats.gp).to.eql(100);
      });
    });
  });
});
