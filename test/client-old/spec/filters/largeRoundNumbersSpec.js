describe('roundLargeNumbers', function() {

  beforeEach(module('habitrpg'));

  it('returns same number if less than 1000', inject(function(roundLargeNumbersFilter) {
    for(var num = 0; num < 1000; num++) {
      expect(roundLargeNumbersFilter(num)).to.eql(num);
    };
  }));

  it('truncates number and appends "k" if number is 1000-999999', inject(function(roundLargeNumbersFilter) {
    expect(roundLargeNumbersFilter(999.01)).to.eql("1.0k");
    expect(roundLargeNumbersFilter(1000)).to.eql("1.0k");
    expect(roundLargeNumbersFilter(3284.12)).to.eql("3.3k");
    expect(roundLargeNumbersFilter(52983.99)).to.eql("53.0k");
    expect(roundLargeNumbersFilter(452983.99)).to.eql("453.0k");
    expect(roundLargeNumbersFilter(999999)).to.eql("1000.0k");
  }));

  it('truncates number and appends "m" if number is 1000000-999999999', inject(function(roundLargeNumbersFilter) {
    expect(roundLargeNumbersFilter(999999.01)).to.eql("1.0m");
    expect(roundLargeNumbersFilter(1000000)).to.eql("1.0m");
    expect(roundLargeNumbersFilter(3284124.12)).to.eql("3.3m");
    expect(roundLargeNumbersFilter(52983105.99)).to.eql("53.0m");
    expect(roundLargeNumbersFilter(452983410.99)).to.eql("453.0m");
    expect(roundLargeNumbersFilter(999999999)).to.eql("1000.0m");
  }));

  it('truncates number and appends b" if number is greater than 999999999', inject(function(roundLargeNumbersFilter) {
    expect(roundLargeNumbersFilter(999999999.01)).to.eql("1.0b");
    expect(roundLargeNumbersFilter(1423985738.54)).to.eql("1.4b");
  }));
});
