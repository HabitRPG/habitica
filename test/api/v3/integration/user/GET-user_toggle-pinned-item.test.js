import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /user/toggle-pinned-item', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('cannot unpin potion', async () => {
    await expect(user.get('/user/toggle-pinned-item/potion/potion'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('cannotUnpinItem'),
      });
  });

  it('can pin shield_rogue_5', async () => {
    const result = await user.get('/user/toggle-pinned-item/marketGear/gear.flat.shield_rogue_5');

    expect(result.pinnedItems.length).to.be.eql(user.pinnedItems.length + 1);
  });
});
