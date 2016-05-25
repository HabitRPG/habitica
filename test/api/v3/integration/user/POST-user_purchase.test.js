import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/purchase/:type/:key', () => {
  let user;
  let type = 'hatchingPotions';
  let key = 'Base';

  beforeEach(async () => {
    user = await generateUser({
      balance: 40,
    });
  });

  // More tests in common code unit tests

  it('returns an error when key is not provided', async () => {
    await expect(user.post('/user/purchase/gems/gem'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('mustSubscribeToPurchaseGems'),
      });
  });

  it('purchases a gem item', async () => {
    await user.post(`/user/purchase/${type}/${key}`);
    await user.sync();

    expect(user.items[type][key]).to.equal(1);
  });
});
