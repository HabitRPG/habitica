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
});
