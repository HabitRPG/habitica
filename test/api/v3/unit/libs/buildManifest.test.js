import {
  getManifestFiles,
} from '../../../../../website/server/libs/api-v3/buildManifest';

describe('Build Manifest', () => {
  describe('getManifestFiles', () => {
    it('returns an html string', () => {
      let htmlCode = getManifestFiles('app');

      expect(htmlCode.startsWith('<script') || htmlCode.startsWith('<link')).to.be.true;
    });

    it('throws an error in case the page does not exist', () => {
      expect(() => {
        getManifestFiles('strange name here');
      }).to.throw(Error);
    });
  });
});
