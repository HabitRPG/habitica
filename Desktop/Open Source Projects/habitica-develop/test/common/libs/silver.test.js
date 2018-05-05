import silver from '../../../website/common/script/libs/silver';

describe('silver', () => {
  it('is 0', () => {
    expect(silver(0)).to.eql('00');
  });

  it('20 coins in 5.2 of gold: two decimal places', () => {
    expect(silver(5.2)).to.eql('20');
  });

  it('4 coint in 5.04 of gold: one decimal place', () => {
    expect(silver(5.04)).to.eql('04');
  });

  it('is no value', () => {
    expect(silver()).to.eql('00');
  });
});
