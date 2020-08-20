/* eslint-disable camelcase */

import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import apiError from '../../../../../../website/server/libs/apiError';

describe('POST /user/buy-gear/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 400,
    });
  });

  // More tests in common code unit tests

  it('returns an error if the item is not found', async () => {
    await expect(user.post('/user/buy-gear/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: apiError('itemNotFound', { key: 'notExisting' }),
      });
  });

  it('buys the first level weapon gear', async () => {
    const key = 'weapon_warrior_0';

    await user.post(`/user/buy-gear/${key}`);
    await user.sync();

    expect(user.items.gear.owned[key]).to.eql(true);
  });

  it('buys the first level armor gear', async () => {
    const key = 'armor_warrior_1';

    await user.post(`/user/buy-gear/${key}`);
    await user.sync();

    expect(user.items.gear.owned[key]).to.eql(true);
  });

  it('tries to buy subsequent, level gear', async () => {
    const key = 'armor_warrior_2';

    return expect(user.post(`/user/buy-gear/${key}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: 'You need to purchase a lower level gear before this one.',
      });
  });

  it('returns an error if tries to buy gear from a different class', async () => {
    const key = 'armor_rogue_1';

    return expect(user.post(`/user/buy-gear/${key}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: 'You can\'t buy this item.',
      });
  });
});
