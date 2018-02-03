import percent from '../../../website/common/script/libs/percent';

describe('percent', () => {
  it('with direction "up"', () => {
    expect(percent(1, 10, 'up')).to.eql(10);
    expect(percent(1, 20, 'up')).to.eql(5);
    expect(percent(1.22, 10.99, 'up')).to.eql(12);
  });

  it('with direction "down"', () => {
    expect(percent(1, 10, 'down')).to.eql(10);
    expect(percent(1, 20, 'down')).to.eql(5);
    expect(percent(1.22, 10.99, 'down')).to.eql(11);
  });

  it('with no direction', () => {
    expect(percent(1.22, 10.99)).to.eql(11);
  });
});
