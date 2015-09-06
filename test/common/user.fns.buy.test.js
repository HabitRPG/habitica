var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var _ = require('lodash');

require('coffee-script');
var shared = require('../../common/script/index.coffee');
var Content = require('../../common/script/content/index.coffee');

describe('user.fns.buy', function() {
  var user;

  beforeEach(function() {
    user = {
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true
          }
        }
      },
      stats: { gp: 200 },
      achievements: { },
      flags: { }
    };

    shared.wrap(user);

    sinon.stub(user.fns, 'randomVal');
    sinon.stub(user.fns, 'predictableRandom');
  });

  afterEach(function() {
    user.fns.randomVal.restore();
    user.fns.predictableRandom.restore();
  });

  context('Potion', function() {
    it('recovers hp');
  });

  context('Gear', function() {
    it('buys equipment');

    it('does not buy equipment without enough Gold');
  });

  context('Quests', function() {
    it('buys a Quest scroll');

    it('does not buy Quests without enough Gold');

    it('does not buy nonexistent Quests');

    it('does not buy Gem-premium Quests');
  });

  context('Enchanted Armoire', function() {
    var YIELD_EQUIPMENT = .5;
    var YIELD_FOOD = .7;
    var YIELD_EXP = .9;

    var fullArmoire = {}

    _(Content.gearTypes).each(function(type) {
      _(Content.gear.tree[type].armoire).each(function(gearObject, gearName) {
        armoireKey = gearObject.key;
        fullArmoire[armoireKey] = true;
      });
    });

    beforeEach(function() {
      user.achievements.ultimateGearSets = { rogue: true };
      user.flags.armoireOpened = true;
      user.stats.exp = 0;
      user.items.food = {};
    });

    context('failure conditions', function() {
      it('does not open if user does not have enough gold', function(done) {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.stats.gp = 50;

        user.ops.buy({params: {key: 'armoire'}}, function(response) {
          expect(response.message).to.eql('Not Enough Gold');
          expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        });
      });

      it('does not open without Ultimate Gear achievement',function(done) {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.achievements.ultimateGearSets = {'healer':false,'wizard':false,'rogue':false,'warrior':false};

        user.ops.buy({params: {key: 'armoire'}}, function(response) {
          expect(response.message).to.eql("You can't buy this item");
          expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true});
          expect(user.items.food).to.be.empty;
          expect(user.stats.exp).to.eql(0);
          done();
        });
      });
    });

    context('non-gear awards', function() {
      it('gives Experience', function() {
        user.fns.predictableRandom.returns(YIELD_EXP);

        user.ops.buy({params: {key: 'armoire'}})

        expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true});
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(46);
        expect(user.stats.gp).to.eql(100);
      });

      it('gives food', function() {
        var honey = Content.food.Honey;
        user.fns.randomVal.returns(honey);
        user.fns.predictableRandom.returns(YIELD_FOOD);

        user.ops.buy({params: {key: 'armoire'}})

        expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true});
        expect(user.items.food).to.eql({'Honey': 1});
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      it('does not give equipment if all equipment has been found', function() {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = fullArmoire;
        user.stats.gp = 150;

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql(fullArmoire);
        var armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');
        expect(armoireCount).to.eql(0);

        expect(user.stats.exp).to.eql(30);
        expect(user.stats.gp).to.eql(50);
      });
    });

    context('gear awards', function() {
      beforeEach(function() {
        var shield = Content.gear.tree.shield.armoire.gladiatorShield;
        user.fns.randomVal.returns(shield);
      });

      it('always drops equipment the first time', function() {
        delete user.flags.armoireOpened;
        user.fns.predictableRandom.returns(YIELD_EXP);

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({
          'weapon_warrior_0': true,
          'shield_armoire_gladiatorShield': true
        });

        var armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');
        expect(armoireCount).to.eql (_.size(fullArmoire) - 1)
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        expect(user.stats.gp).to.eql(100);
      });

      it('gives more equipment', function() {
        user.fns.predictableRandom.returns(YIELD_EQUIPMENT);
        user.items.gear.owned = {
          weapon_warrior_0: true,
          head_armoire_hornedIronHelm: true
        };
        user.stats.gp = 200;

        user.ops.buy({params: {key: 'armoire'}});

        expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true, 'shield_armoire_gladiatorShield':true, 'head_armoire_hornedIronHelm':true});
        var armoireCount = shared.count.remainingGearInSet(user.items.gear.owned, 'armoire');
        expect(armoireCount).to.eql((_.size(fullArmoire) - 2));
        expect(user.stats.gp).to.eql(100);
      });
    });
  });
});
