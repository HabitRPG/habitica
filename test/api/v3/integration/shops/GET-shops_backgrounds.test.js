import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/backgrounds', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('localizes the shops content', () => {
    it('from the users locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/backgrounds');

      expect(shop.text).to.eql(t('backgroundShop', {}, 'es'));
      expect(shop.notes).to.eql(t('backgroundShop', {}, 'es'));
    });

    it('from the passed locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/backgrounds?lang=de');

      expect(shop.text).to.eql(t('backgroundShop', {}, 'de'));
      expect(shop.notes).to.eql(t('backgroundShop', {}, 'de'));
    });
  });

  it('returns a valid shop object', async () => {
    const shop = await user.get('/shops/backgrounds');
    expect(shop.identifier).to.equal('backgroundShop');
    expect(shop.text).to.eql(t('backgroundShop'));
    expect(shop.notes).to.eql(t('backgroundShop'));
    expect(shop.imageName).to.equal('background_shop');
    expect(shop.sets).to.be.an('array');
  });
});
