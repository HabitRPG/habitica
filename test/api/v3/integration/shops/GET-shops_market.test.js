import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import Bluebird from 'bluebird';

describe('GET /shops/market', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    let shop = await user.get('/shops/market');

    expect(shop.identifier).to.equal('market');
    expect(shop.text).to.eql(t('market'));
    expect(shop.notes).to.eql(t('welcomeMarketMobile'));
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');

    let categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.include('eggs');
    expect(categories).to.include('hatchingPotions');
    expect(categories).to.include('food');
  });

  it('can purchase anything returned from the shops object using the /user/purchase route', async () => {
    await user.update({
      balance: 99999999,
      'stats.gp': 99999999,
    });

    let shop = await user.get('/shops/market');
    let items = shop.categories.reduce((array, category) => {
      category.items.forEach((item) => {
        array.push(item);
      });

      return array;
    }, []);

    let results = await Bluebird.each(items, (item) => {
      let { purchaseType, key } = item;
      return user.post(`/user/purchase/${purchaseType}/${key}`);
    });

    expect(results.length).to.be.greaterThan(0);
    results.forEach((item) => {
      expect(item).to.include.keys('key', 'text', 'notes', 'class', 'value', 'currency');
    });
  });
});
