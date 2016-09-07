import {
  getManifestFiles,
} from '../../../../../website/server/libs/buildManifest';

describe('Build Manifest', () => {
  describe('getManifestFiles', () => {
    it('returns an html string', () => {
      let htmlCode = getManifestFiles('app');

      expect(htmlCode.startsWith('<script') || htmlCode.startsWith('<link')).to.be.true;
    });

    it('can return only js files', () => {
      let htmlCode = getManifestFiles('app', 'js');

      expect(htmlCode.indexOf('<link') === -1).to.be.true;
    });

    it('can return only css files', () => {
      let htmlCode = getManifestFiles('app', 'css');

      expect(htmlCode.indexOf('<script') === -1).to.be.true;
    });

    it('throws an error in case the page does not exist', () => {
      expect(() => {
        getManifestFiles('strange name here');
      }).to.throw(Error);
    });
  });
});
