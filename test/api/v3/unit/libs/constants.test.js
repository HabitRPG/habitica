import constants from '../../../../../website/src/libs/api-v3/constants';

describe.only('constants', () => {
  it('exports IS_PROD constant', () => {
    expect(constants).to.have.property('IS_PROD');
  });

  it('exports IS_DEV constant', () => {
    expect(constants).to.have.property('IS_DEV');
  });
});
