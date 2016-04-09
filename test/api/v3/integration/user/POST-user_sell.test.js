import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../common/script/content';

describe('POST /user/sell/:type/:key', () => {
  let user;
  let type = 'eggs';
  let key = 'Wolf';

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns an error when user does not have item', async () => {
    await expect(user.post(`/user/sell/${type}/${key}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userItemsKeyNotFound', {type}),
      });
  });

  it('sells an item', async () => {
    await user.update({
      items: {
        eggs: {
          Wolf: 1,
        },
      },
    });

    let response = await user.post(`/user/sell/${type}/${key}`);
    await user.sync();

    expect(response.message).to.equal(t('sold', {type, key}));
    expect(user.stats.gp).to.equal(content[type][key].value);
  });
});
