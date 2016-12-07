import floorFilter from 'client/filters/floor';

describe('floor filter', () => {
  it('can floor a decimal number', () => {
    expect(floorFilter(4.567)).to.equal(4.56);
    expect(floorFilter(4.562)).to.equal(4.56);
  });
});