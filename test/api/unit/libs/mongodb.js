import os from 'os';
import nconf from 'nconf';
import requireAgain from 'require-again';

const pathToMongoLib = '../../../../website/server/libs/mongodb';

describe('mongodb', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('getDevelopmentConnectionUrl', () => {
    it('returns the original connection url if not on windows', () => {
      sandbox.stub(os, 'platform').returns('linux');
      const mongoLibOverride = requireAgain(pathToMongoLib);

      const originalString = 'mongodb://localhost:3030';
      const string = mongoLibOverride.getDevelopmentConnectionUrl(originalString);
      expect(string).to.equal(originalString);
    });

    it('replaces localhost with hostname on windows', () => {
      sandbox.stub(os, 'platform').returns('win32');
      sandbox.stub(os, 'hostname').returns('hostname');
      const mongoLibOverride = requireAgain(pathToMongoLib);

      const originalString = 'mongodb://localhost:3030';
      const string = mongoLibOverride.getDevelopmentConnectionUrl(originalString);
      expect(string).to.equal('mongodb://hostname:3030');
    });
  });

  describe('getDefaultConnectionOptions', () => {
    it('returns development config when IS_PROD is false', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);
      const mongoLibOverride = requireAgain(pathToMongoLib);

      const options = mongoLibOverride.getDefaultConnectionOptions();
      expect(options).to.have.all.keys(['useNewUrlParser', 'useUnifiedTopology']);
    });

    it('returns production config when IS_PROD is true', () => {
      sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);
      const mongoLibOverride = requireAgain(pathToMongoLib);

      const options = mongoLibOverride.getDefaultConnectionOptions();
      expect(options).to.have.all.keys(['useNewUrlParser', 'useUnifiedTopology', 'keepAlive', 'keepAliveInitialDelay']);
    });
  });
});
