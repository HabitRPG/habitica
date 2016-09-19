describe('filter', function() {

  beforeEach(module('habitrpg'));

  describe('gold', function() {
    it('rounds down decimal values', inject(function(goldFilter) {
      expect(goldFilter(10)).to.eql(10);
      expect(goldFilter(10.0)).to.eql(10);
      expect(goldFilter(10.1)).to.eql(10);
      expect(goldFilter(10.2)).to.eql(10);
      expect(goldFilter(10.3)).to.eql(10);
      expect(goldFilter(10.4)).to.eql(10);
      expect(goldFilter(10.5)).to.eql(10);
      expect(goldFilter(10.6)).to.eql(10);
      expect(goldFilter(10.7)).to.eql(10);
      expect(goldFilter(10.8)).to.eql(10);
      expect(goldFilter(10.9)).to.eql(10);
      expect(goldFilter(11)).to.eql(11);
    }));
  });

  describe('silver', function() {
    it('converts decimal value of gold to silver', inject(function(silverFilter) {
      expect(silverFilter(10)).to.be.closeTo(0, 1);
      expect(silverFilter(10.01)).to.be.closeTo(1, 1);
      expect(silverFilter(10.05)).to.be.closeTo(5, 1);
      expect(silverFilter(10.17)).to.be.closeTo(17, 1);
      expect(silverFilter(10.23)).to.be.closeTo(23, 1);
      expect(silverFilter(10.25)).to.be.closeTo(25, 1);
      expect(silverFilter(10.53)).to.be.closeTo(53, 1);
      expect(silverFilter(10.75)).to.be.closeTo(75, 1);
      expect(silverFilter(10.99)).to.be.closeTo(99, 1);
    }));
  });
});
