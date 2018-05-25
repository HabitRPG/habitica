import gold from '../../../website/common/script/libs/gold';

describe('gold', () => {
  it('is 0', () => {
    expect(gold()).to.eql('0');
  });

  it('is 5 in 5.2 of gold', () => {
    expect(gold(5.2)).to.eql(5);
  });
});
