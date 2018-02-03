import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/quests', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    let shop = await user.get('/shops/quests');

    expect(shop.identifier).to.equal('questShop');
    expect(shop.text).to.eql(t('quests'));
    expect(shop.notes).to.eql(t('ianTextMobile'));
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');

    let categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.include('unlockable');
    expect(categories).to.include('gold');
    expect(categories).to.include('pet');
  });
});
