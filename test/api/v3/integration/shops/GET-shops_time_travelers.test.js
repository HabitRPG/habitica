import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/time-travelers', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    let shop = await user.get('/shops/time-travelers');
    expect(shop.identifier).to.equal('timeTravelersShop');
    expect(shop.text).to.be.a('string');
    expect(shop.notes).to.be.a('string');
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');
  });
});
