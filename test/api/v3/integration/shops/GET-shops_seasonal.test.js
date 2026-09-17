import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/seasonal', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('localizes the shops content', () => {
    it('from the users locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/seasonal');

      expect(shop.text).to.eql(t('seasonalShop', {}, 'es'));
    });

    it('from the passed locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/seasonal?lang=de');

      expect(shop.text).to.eql(t('seasonalShop', {}, 'de'));
    });
  });

  it('returns a valid shop object', async () => {
    const shop = await user.get('/shops/seasonal');

    expect(shop.identifier).to.equal('seasonalShop');
    expect(shop.text).to.eql(t('seasonalShop'));
    expect(shop.notes).to.be.a('string');
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');
  });
});
