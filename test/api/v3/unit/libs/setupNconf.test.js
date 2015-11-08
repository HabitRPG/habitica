import setupNconf from '../../../../../website/src/libs/api-v3/setupNconf';

import nconf from 'nconf';

describe('setupNconf', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('sets up nconf to load command line arguments', () => {
    sandbox.spy(nconf, 'argv');

    setupNconf();

    expect(nconf.argv).to.be.calledOnce;
  });

  it('sets up nconf to load environmental variables', () => {
    sandbox.spy(nconf, 'env');

    setupNconf();

    expect(nconf.env).to.be.calledOnce;
  });

  it('sets up nconf to load variables from config file', () => {
    sandbox.spy(nconf, 'file');

    setupNconf();

    expect(nconf.file).to.be.calledOnce;
  });

  it('sets IS_PROD variable', () => {
    expect(nconf.get('IS_PROD')).to.exist;
  });

  it('sets IS_DEV variable', () => {
    expect(nconf.get('IS_DEV')).to.exist;
  });
});
