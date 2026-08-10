import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/quests', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  describe('localizes the shops content', () => {
    it('from the users locale', async () => {
      user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/quests');

      expect(shop.text).to.eql(t('quests', {}, 'es'));
      expect(shop.notes).to.eql(t('ianTextMobile', {}, 'es'));
      expect(shop.featured.text).to.eql(t('featuredQuests', {}, 'es'));
      const firstQuest = shop.categories[1].items[0];
      expect(firstQuest.text).to.eql(t('questBasilistText', {}, 'es'));
    });

    it('from the passed locale', async () => {
      user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/quests?lang=de');

      expect(shop.text).to.eql(t('quests', {}, 'de'));
      expect(shop.notes).to.eql(t('ianTextMobile', {}, 'de'));
      expect(shop.featured.text).to.eql(t('featuredQuests', {}, 'de'));
      const firstQuest = shop.categories[1].items[0];
      expect(firstQuest.text).to.eql(t('questBasilistText', {}, 'de'));
    });
  });

  it('returns a valid shop object', async () => {
    const shop = await user.get('/shops/quests');

    expect(shop.identifier).to.equal('questShop');
    expect(shop.text).to.eql(t('quests'));
    expect(shop.notes).to.eql(t('ianTextMobile'));
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');

    const categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.include('unlockable');
    expect(categories).to.include('gold');
    expect(categories).to.include('pet');
  });
});
