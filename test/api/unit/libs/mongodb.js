import os from 'os';
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
});
