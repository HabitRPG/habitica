import roundBigNumberFilter from 'client/filters/roundBigNumber';

describe('round big number filter', () => {
  it('can round a decimal number', () => {
    expect(roundBigNumberFilter(4.567)).to.equal(4.57);
    expect(roundBigNumberFilter(4.562)).to.equal(4.56);
  });

  it('can round thousands', () => {
    expect(roundBigNumberFilter(70065)).to.equal('70.1k');
  });

  it('can round milions', () => {
    expect(roundBigNumberFilter(10000987)).to.equal('10.0m');
  });

  it('can round bilions', () => {
    expect(roundBigNumberFilter(1000000000)).to.equal('1.0b');
  });
});