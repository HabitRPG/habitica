import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/market', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    const shop = await user.get('/shops/market');

    expect(shop.identifier).to.equal('market');
    expect(shop.text).to.eql(t('market'));
    expect(shop.notes).to.eql(t('welcomeMarketMobile'));
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');

    const categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.include('eggs');
    expect(categories).to.include('hatchingPotions');
    expect(categories).to.include('food');
  });

  describe('localizes the shops content', () => {
    it('from the users locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      await user.sync();
      const shop = await user.get('/shops/market');

      expect(shop.text).to.eql(t('market', {}, 'es'));
      expect(shop.notes).to.eql(t('welcomeMarketMobile', {}, 'es'));
      expect(shop.featured.text).to.eql(t('featuredItems', {}, 'es'));
      expect(shop.categories[0].text).to.eql(t('eggs', {}, 'es'));
      const firstPotion = shop.categories[1].items[0];
      expect(firstPotion.text).to.eql(t('potion', { potionType: t(`hatchingPotion${firstPotion.key}`, {}, 'es') }, 'es'));
    });

    it('from the passed locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const shop = await user.get('/shops/market?lang=de');

      expect(shop.text).to.eql(t('market', {}, 'de'));
      expect(shop.notes).to.eql(t('welcomeMarketMobile', {}, 'de'));
      expect(shop.featured.text).to.eql(t('featuredItems', {}, 'de'));
      expect(shop.categories[0].text).to.eql(t('eggs', {}, 'de'));
      const firstPotion = shop.categories[1].items[0];
      expect(firstPotion.text).to.eql(t('potion', { potionType: t(`hatchingPotion${firstPotion.key}`, {}, 'de') }, 'de'));
    });
  });

  it('can purchase anything returned from the shops object using the /user/purchase route', async () => {
    await user.updateOne({
      balance: 99999999,
      'stats.gp': 99999999,
    });

    const shop = await user.get('/shops/market');
    const items = shop.categories.reduce((array, category) => {
      category.items.forEach(item => {
        array.push(item);
      });

      return array;
    }, []);

    const results = await Promise.all(items.map(item => {
      const { purchaseType, key } = item;
      return user.post(`/user/purchase/${purchaseType}/${key}`);
    }));

    expect(results.length).to.be.greaterThan(0);
    items.forEach(item => {
      expect(item).to.include.keys('key', 'text', 'notes', 'class', 'value', 'currency');
    });
  });
});
