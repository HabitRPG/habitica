var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var _ = require('lodash');

require('coffee-script');
var shared = require('../../common/script/index.coffee');

describe('user.ops', function() {
  var user;

  beforeEach(function() {
    user = {
      items: {
        gear: { },
        special: { }
      },
      achievements: { },
      flags: { }
    };

    shared.wrap(user);
  });

  describe('readCard', function() {
    it('removes card from invitation array', function() {
      user.items.special.valentineReceived = ['Leslie'];
      user.ops.readCard({ params: { cardType: 'valentine' } });

      expect(user.items.special.valentineReceived).to.be.empty;
    });

    it('removes the first card from invitation array', function() {
      user.items.special.valentineReceived = ['Leslie', 'Vicky'];
      user.ops.readCard({ params: { cardType: 'valentine' } });

      expect(user.items.special.valentineReceived).to.eql(['Vicky']);
    });
  });
});
