/* eslint-disable camelcase */

import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/refund-gear/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 400,
    });
  });

  // More tests in common code unit tests

  it('returns an error if the item is not found', async () => {
    await expect(user.post('/user/refund-gear/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('itemNotFound', {key: 'notExisting'}),
      });
  });

  it('refunds a piece of gear', async () => {
    let key = 'armor_warrior_1';

    await user.post(`/user/refund-gear/${key}`);
    await user.sync();

    expect(user.items.gear.owned.armor_warrior_1).to.eql(false);
  });
});
