import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/seasonal', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
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
