import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/revive', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'user.items.gear.owned': {weaponKey: true},
    });
  });

  it('returns an error when user is not dead', async () => {
    await expect(user.post('/user/revive'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cannotRevive'),
      });
  });

  // More tests in common code unit tests

  it('decreases a stat', async () => {
    await user.update({
      'stats.str': 2,
      'stats.hp': 0,
    });

    await user.post('/user/revive');
    await user.sync();

    expect(user.stats.str).to.equal(1);
  });
});
