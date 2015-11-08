import setupNconf from '../../../../../website/src/libs/api-v3/setupNconf';

import nconf from 'nconf';

describe('setupNconf', () => {
  before(() => {
    sandbox.spy(nconf, 'argv');
    sandbox.spy(nconf, 'env');
    sandbox.spy(nconf, 'file');

    setupNconf();
  });

  after(() => {
    sandbox.restore();
  });

  it('sets up nconf', () => {
    expect(nconf.argv).to.be.calledOnce;
    expect(nconf.env).to.be.calledOnce;
    expect(nconf.file).to.be.calledOnce;
  });

  it('sets IS_PROD variable', () => {
    expect(nconf.get('IS_PROD')).to.exist;
  });

  it('sets IS_DEV variable', () => {
    expect(nconf.get('IS_DEV')).to.exist;
  });
});
