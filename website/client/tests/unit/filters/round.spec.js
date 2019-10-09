import roundFilter from '@/filters/round';

describe('round filter', () => {
  it('can round a decimal number', () => {
    expect(roundFilter(4.567)).to.equal(4.57);
    expect(roundFilter(4.562)).to.equal(4.56);
  });
});
