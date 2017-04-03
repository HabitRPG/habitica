import setupNconf from '../../../../../website/server/libs/setupNconf';

import path from 'path';
import nconf from 'nconf';

describe('setupNconf', () => {
  beforeEach(() => {
    sandbox.stub(nconf, 'argv').returnsThis();
    sandbox.stub(nconf, 'env').returnsThis();
    sandbox.stub(nconf, 'file').returnsThis();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('sets up nconf', () => {
    setupNconf();

    expect(nconf.argv).to.be.calledOnce;
    expect(nconf.env).to.be.calledOnce;
    expect(nconf.file).to.be.calledOnce;

    let regexString = `\\${path.sep}config.json$`;
    expect(nconf.file).to.be.calledWithMatch('user', new RegExp(regexString));
  });

  it('sets IS_PROD variable', () => {
    setupNconf();
    expect(nconf.get('IS_PROD')).to.exist;
  });

  it('sets IS_DEV variable', () => {
    setupNconf();
    expect(nconf.get('IS_DEV')).to.exist;
  });

  it('allows a custom config.json file to be passed in', () => {
    setupNconf('customfile.json');

    expect(nconf.file).to.be.calledOnce;
    expect(nconf.file).to.be.calledWithMatch('user', 'customfile.json');
  });
});
