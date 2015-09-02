var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var _ = require('lodash');

require('coffee-script');
var shared = require('../../common/script/index.coffee');
var Content = require('../../common/script/content.coffee');

describe('user.ops.hourglassPurchase', function() {
  var user;

  beforeEach(function() {
    user = {
      items: {
        pets: {},
        mounts: {}
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

  context('Time Travel Stable', function() {

    context('failure conditions', function() {

      it('does not grant pets without Mystic Hourglasses', function(done) {
        user.ops.hourglassPurchase({params:{category: 'pets', key: 'MantisShrimp-Base'}}, function(response) {
          expect(response.message).to.eql("You don't have enough Mystic Hourglasses.");
          expect(user.items.pets).to.eql({});
          done();
        });
      });

      it('does not grant mounts without Mystic Hourglasses', function(done) {
        user.ops.hourglassPurchase({params:{category: 'mounts', key: 'MantisShrimp-Base'}}, function(response) {
          expect(response.message).to.eql("You don't have enough Mystic Hourglasses.");
          expect(user.items.mounts).to.eql({});
          done();
        });
      });
      
      it('does not grant pet that has already been purchased', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.pets = {
          'MantisShrimp-Base': true
        }; 

        user.ops.hourglassPurchase({params:{category: 'pets', key: 'MantisShrimp-Base'}}, function(response) {
          expect(response.message).to.eql("Pet already owned.");
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant mount that has already been purchased', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.mounts = {
          'MantisShrimp-Base': true
        }; 

        user.ops.hourglassPurchase({params:{category: 'mounts', key: 'MantisShrimp-Base'}}, function(response) {
          expect(response.message).to.eql("Mount already owned.");
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant pet that is not part of the Time Travel Stable', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.hourglassPurchase({params: {category: 'pets', key: 'Wolf-Veteran'}}, function(response) {
          expect(response.message).to.eql('Pet not available for purchase with Mystic Hourglass.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });

      it('does not grant mount that is not part of the Time Travel Stable', function(done) {
        user.purchased.plan.consecutive.trinkets = 1;

        user.ops.hourglassPurchase({params: {category: 'mounts', key: 'Orca-Base'}}, function(response) {
          expect(response.message).to.eql('Mount not available for purchase with Mystic Hourglass.');
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        });
      });
    });

    context('successful purchases', function() {

      it('buys a pet', function(done) {
        user.purchased.plan.consecutive.trinkets = 2;

        user.ops.hourglassPurchase({params: {category: 'pets', key: 'MantisShrimp-Base'}}, function() {
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          expect(user.items.pets).to.eql({'MantisShrimp-Base':true});
          done();
        });
      });

      it('buys a mount', function(done) {
        user.purchased.plan.consecutive.trinkets = 2;

        user.ops.hourglassPurchase({params: {category: 'mounts', key: 'MantisShrimp-Base'}}, function() {
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          expect(user.items.mounts).to.eql({'MantisShrimp-Base':true});
          done();
        });
      });
    });
  });
});

