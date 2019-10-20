import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import apiError from '../../../../../../website/server/libs/apiError';

describe('POST /user/allocate', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.lvl': 10,
      'flags.classSelected': true,
      'preferences.disableClasses': false,
    });
  });

  // More tests in common code unit tests

  it('returns an error if an invalid attribute is supplied', async () => {
    await expect(user.post('/user/allocate?stat=invalid'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: apiError('invalidAttribute', { attr: 'invalid' }),
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

  it('returns an error if the user hasn\'t selected class', async () => {
    await user.update({ 'flags.classSelected': false });
    await expect(user.post('/user/allocate'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('classNotSelected'),
      });
  });

  it('allocates attribute points', async () => {
    await user.update({ 'stats.points': 1 });
    const res = await user.post('/user/allocate?stat=con');
    await user.sync();
    expect(user.stats.con).to.equal(1);
    expect(user.stats.points).to.equal(0);
    expect(res.con).to.equal(1);
  });
});
