import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('DELETE social registration', () => {
  let user;
  let endpoint = '/user/auth/social/facebook';
  beforeEach(async () => {
    user = await generateUser();
    await user.update({ 'auth.facebook.id': 'some-fb-id' });
    expect(user.auth.local.username).to.not.be.empty;
    expect(user.auth.facebook).to.not.be.empty;
  });
  context('of NOT-SUPPORTED', () => {
    it('is not supported', async () => {
      await expect(user.del('/user/auth/social/SOME-OTHER-NETWORK')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('unsupportedNetwork'),
      });
    });
  });
  context('of facebook', () => {
    it('fails if local registration does not exist for this user', async () => {
      await user.update({ 'auth.local': { ok: true } });
      await expect(user.del(endpoint)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantDetachSocial'),
      });
    });
    it('succeeds', async () => {
      let response = await user.del(endpoint);
      expect(response).to.eql({});
      await user.sync();
      expect(user.auth.facebook).to.be.empty;
    });
  });
});
