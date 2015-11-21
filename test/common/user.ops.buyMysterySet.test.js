/* eslint-disable camelcase */

let shared = require('../../common/script/index.js');

describe('user.ops.buyMysterySet', () => {
  let user;

  beforeEach(() => {
    user = {
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
          },
        },
      },
      purchased: {
        plan: {
          consecutive: {
            trinkets: 0,
          },
        },
      },
    };

    shared.wrap(user);
  });

  context('Mystery Sets', () => {
    context('failure conditions', () => {
      it('does not grant mystery sets without Mystic Hourglasses', (done) => {
        user.ops.buyMysterySet({params: {key: '201501'}}, (response) => {
          expect(response.message).to.eql('You don\'t have enough Mystic Hourglasses.');
          expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
          done();
        });
      });

      it('does not grant mystery set that has already been purchased', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.gear.owned = {
          weapon_warrior_0: true,
          weapon_mystery_301404: true,
          armor_mystery_301404: true,
          head_mystery_301404: true,
          eyewear_mystery_301404: true,
        };

        user.ops.buyMysterySet({params: {key: '301404'}}, (response) => {
          expect(response.message).to.eql('Mystery set not found, or set already owned');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });
    });

    context('successful purchases', () => {
      it('buys Steampunk Accessories Set', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.buyMysterySet({params: {key: '301404'}}, () => {
          expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
          expect(user.items.gear.owned).to.eql({
            weapon_warrior_0: true,
            weapon_mystery_301404: true,
            armor_mystery_301404: true,
            head_mystery_301404: true,
            eyewear_mystery_301404: true,
          });

          done();
        });
      });
    });
  });
});

