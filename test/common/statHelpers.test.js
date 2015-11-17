var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect

var shared = require('../../common/script/index.js');

describe('helper functions used in stat calculations', function() {

  var HEALTH_CAP = 50;
  var LEVEL_CAP = 100;
  var LEVEL = 57;
  var BONUS = 600;
  var MAXIMUM = 200;
  var HALFWAY = 75;

  it('provides a maximum Health value', function() {
    expect(shared.maxHealth).to.eql(HEALTH_CAP);
  });

  describe('maximum level cap', function() {
    it('returns a maximum level for attribute gain', function() {
      expect(shared.maxLevel).to.eql(LEVEL_CAP);
    });

    it('returns level given if below cap', function() {
      expect(shared.capByLevel(LEVEL)).to.eql(LEVEL);
    });

    it('returns level given if equal to cap', function() {
      expect(shared.capByLevel(LEVEL_CAP)).to.eql(LEVEL_CAP);
    });

    it('returns level cap if above cap', function() {
      expect(shared.capByLevel(LEVEL_CAP + LEVEL)).to.eql(LEVEL_CAP);
    });
  });

  describe('Experience to next level', function() {
    it('increases Experience target from one level to the next', function() {
      expect(shared.tnl(LEVEL + 1)).to.be.greaterThan(shared.tnl(LEVEL));
    });
  });

  describe('diminishing returns', function() {
    it('provides a value under the maximum, given a bonus and maximum', function() {
      expect(shared.diminishingReturns(BONUS,MAXIMUM)).to.be.lessThan(MAXIMUM);
    });

    it('provides a value under the maximum, given a bonus, maximum, and halfway point', function() {
      expect(shared.diminishingReturns(BONUS,MAXIMUM,HALFWAY)).to.be.lessThan(MAXIMUM);
    });

    it('provides a different curve if a halfway point is defined', function() {
      expect(shared.diminishingReturns(BONUS,MAXIMUM,HALFWAY)).to.not.eql(shared.diminishingReturns(BONUS,MAXIMUM));
    });
  });
});
