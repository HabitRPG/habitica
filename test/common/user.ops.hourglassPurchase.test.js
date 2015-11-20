let shared = require('../../common/script/index.js');

describe('user.ops.hourglassPurchase', () => {
  let user;

  beforeEach(() => {
    user = {
      items: {
        pets: {},
        mounts: {},
        hatchingPotions: {},
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

  context('Time Travel Stable', () => {
    context('failure conditions', () => {
      it('does not allow purchase of unsupported item types', (done) => {
        user.ops.hourglassPurchase({params: {type: 'hatchingPotions', key: 'Base'}}, (response) => {
          expect(response.message).to.eql('Item type not supported for purchase with Mystic Hourglass. Allowed types: ["pets","mounts"]');
          expect(user.items.hatchingPotions).to.eql({});
          done();
        });
      });

      it('does not grant pets without Mystic Hourglasses', (done) => {
        user.ops.hourglassPurchase({params: {type: 'pets', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('You don\'t have enough Mystic Hourglasses.');
          expect(user.items.pets).to.eql({});
          done();
        });
      });

      it('does not grant mounts without Mystic Hourglasses', (done) => {
        user.ops.hourglassPurchase({params: {type: 'mounts', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('You don\'t have enough Mystic Hourglasses.');
          expect(user.items.mounts).to.eql({});
          done();
        });
      });

      it('does not grant pet that has already been purchased', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.pets = {
          'MantisShrimp-Base': true,
        };

        user.ops.hourglassPurchase({params: {type: 'pets', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('Pet already owned.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant mount that has already been purchased', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.mounts = {
          'MantisShrimp-Base': true,
        };

        user.ops.hourglassPurchase({params: {type: 'mounts', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('Mount already owned.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant pet that is not part of the Time Travel Stable', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.hourglassPurchase({params: {type: 'pets', key: 'Wolf-Veteran'}}, (response) => {
          expect(response.message).to.eql('Pet not available for purchase with Mystic Hourglass.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant mount that is not part of the Time Travel Stable', (done) => {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.hourglassPurchase({params: {type: 'mounts', key: 'Orca-Base'}}, (response) => {
          expect(response.message).to.eql('Mount not available for purchase with Mystic Hourglass.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });
    });

    context('successful purchases', () => {
      it('buys a pet', (done) => {
        user.purchased.plan.consecutive.trinkets = 2;

        user.ops.hourglassPurchase({params: {type: 'pets', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('Purchased an item using a Mystic Hourglass!');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          expect(user.items.pets).to.eql({'MantisShrimp-Base': 5});
          done();
        });
      });

      it('buys a mount', (done) => {
        user.purchased.plan.consecutive.trinkets = 2;

        user.ops.hourglassPurchase({params: {type: 'mounts', key: 'MantisShrimp-Base'}}, (response) => {
          expect(response.message).to.eql('Purchased an item using a Mystic Hourglass!');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          expect(user.items.mounts).to.eql({'MantisShrimp-Base': true});
          done();
        });
      });
    });
  });
});
