import * as contentLib from '../../../../website/server/libs/content';
import content from '../../../../website/common/script/content';

describe('contentLib', () => {
  describe('CONTENT_CACHE_PATH', () => {
    it('exports CONTENT_CACHE_PATH', () => {
      expect(contentLib.CONTENT_CACHE_PATH).to.be.a.string;
    });
  });

  describe('getLocalizedContentResponse', () => {
    it('clones, not modify, the original content data', () => {
      contentLib.getLocalizedContentResponse();
      expect(typeof content.backgrounds.backgrounds062014.beach.text).to.equal('function');
    });
  });
});
