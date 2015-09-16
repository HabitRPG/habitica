var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect

require('coffee-script');
var shared = require('../../common/script/index.coffee');
var Content = require('../../common/script/content/index.coffee');

describe('user.ops.buyMysterySet', function() {
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
      purchased: {
        plan: {
          consecutive: {
            trinkets: 0
          }
        }
      }
    };

    shared.wrap(user);
  });

  context('Mystery Sets', function() {

    context('failure conditions', function() {

      it('does not grant mystery sets without Mystic Hourglasses', function(done) {
        user.ops.buyMysterySet({params:{key:'201501'}}, function(response) {
          expect(response.message).to.eql("You don't have enough Mystic Hourglasses.");
          expect(user.items.gear.owned).to.eql({'weapon_warrior_0': true});
          done();
        });
      });

      it('does not grant mystery set that has already been purchased', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.gear.owned = {
          weapon_warrior_0: true,
          weapon_mystery_301404: true,
          armor_mystery_301404: true,
          head_mystery_301404: true,
          eyewear_mystery_301404: true
        };   

        user.ops.buyMysterySet({params:{key:'301404'}}, function(response) {
          expect(response.message).to.eql("Mystery set not found, or set already owned");
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });
    });

    context('successful purchases', function() {

      it('buys Steampunk Accessories Set', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.buyMysterySet({params:{key:'301404'}}, function() {
          expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
          expect(user.items.gear.owned).to.eql({
            weapon_warrior_0: true,
            weapon_mystery_301404: true,
            armor_mystery_301404: true,
            head_mystery_301404: true,
            eyewear_mystery_301404: true
          });
          done();
        });
      });
    });
  });
});

