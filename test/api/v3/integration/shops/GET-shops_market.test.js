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

  it('can purchase anything returned from the shops object using the /user/purchase route', async () => {
    await user.update({
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
