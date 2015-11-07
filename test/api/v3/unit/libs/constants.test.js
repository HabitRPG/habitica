import config from '../../../../../website/src/libs/api-v3/constants';

describe('constants', () => {
  it('exports IS_PROD constant', () => {
    expect(config).to.have.property('IS_PROD');
  });

  it('exports IS_DEV constant', () => {
    expect(config).to.have.property('IS_DEV');
  });
});
