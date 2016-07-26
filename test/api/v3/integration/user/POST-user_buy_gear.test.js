/* eslint-disable camelcase */

import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

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
        message: t('itemNotFound', {key: 'notExisting'}),
      });
  });

  it('buys a piece of gear', async () => {
    let key = 'armor_warrior_1';

    await user.post(`/user/buy-gear/${key}`);
    await user.sync();

    expect(user.items.gear.owned).to.eql({
      armor_warrior_1: true,
      eyewear_special_blackTopFrame: true,
      eyewear_special_blueTopFrame: true,
      eyewear_special_greenTopFrame: true,
      eyewear_special_pinkTopFrame: true,
      eyewear_special_redTopFrame: true,
      eyewear_special_whiteTopFrame: true,
      eyewear_special_yellowTopFrame: true,
    });
  });
});
