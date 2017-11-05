import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/allocate', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns an error if an invalid attribute is supplied', async () => {
    await expect(user.post('/user/allocate?stat=invalid'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidAttribute', {attr: 'invalid'}),
      });
  });

  it('returns an error if the user doesn\'t have attribute points', async () => {
    await expect(user.post('/user/allocate'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughAttrPoints'),
      });
  });

  it('allocates attribute points', async () => {
    await user.update({'stats.points': 1});
    let res = await user.post('/user/allocate?stat=con');
    await user.sync();
    expect(user.stats.con).to.equal(1);
    expect(user.stats.points).to.equal(0);
    expect(res.con).to.equal(1);
  });
});
