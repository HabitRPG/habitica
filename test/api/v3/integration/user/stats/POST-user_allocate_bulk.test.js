import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/allocate-bulk', () => {
  let user;
  const statsUpdate = {
    stats: {
      con: 1,
      str: 2,
    },
  };

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns an error if user does not have enough points', async () => {
    await expect(user.post('/user/allocate-bulk', statsUpdate))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughAttrPoints'),
      });
  });

  it('allocates attribute points', async () => {
    await user.update({'stats.points': 3});

    await user.post('/user/allocate-bulk', statsUpdate);
    await user.sync();

    expect(user.stats.con).to.equal(1);
    expect(user.stats.str).to.equal(2);
    expect(user.stats.points).to.equal(0);
  });
});
