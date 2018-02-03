import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/backgrounds', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    let shop = await user.get('/shops/backgrounds');
    expect(shop.identifier).to.equal('backgroundShop');
    expect(shop.text).to.eql(t('backgroundShop'));
    expect(shop.notes).to.eql(t('backgroundShopText'));
    expect(shop.imageName).to.equal('background_shop');
    expect(shop.sets).to.be.an('array');

    let sets = shop.sets.map(set => set.identifier);
    expect(sets).to.include('incentiveBackgrounds');
    expect(sets).to.include('backgrounds062014');
  });
});