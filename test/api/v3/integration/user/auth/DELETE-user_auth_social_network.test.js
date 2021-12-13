import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('DELETE social registration', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('NOT-SUPPORTED', () => {
    it('is not supported', async () => {
      await expect(user.del('/user/auth/social/SOME-OTHER-NETWORK')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('unsupportedNetwork'),
      });
    });
  });

  context('Google', () => {
    it('fails if user does not have an alternative registration method', async () => {
      await user.update({
        'auth.google.id': 'some-google-id',
        'auth.local': { ok: true },
      });
      await expect(user.del('/user/auth/social/google')).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantDetachSocial'),
      });
    });

    it('succeeds if user has a local registration', async () => {
      await user.update({
        'auth.google.id': 'some-google-id',
      });

      const response = await user.del('/user/auth/social/google');
      expect(response).to.eql({});
      await user.sync();
      expect(user.auth.google).to.be.undefined;
    });
  });

  context('Apple', () => {
    it('fails if user does not have an alternative registration method', async () => {
      await user.update({
        'auth.apple.id': 'some-apple-id',
        'auth.local': { ok: true },
      });
      await expect(user.del('/user/auth/social/apple')).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantDetachSocial'),
      });
    });

    it('succeeds if user has a local registration', async () => {
      await user.update({
        'auth.apple.id': 'some-apple-id',
      });

      const response = await user.del('/user/auth/social/apple');
      expect(response).to.eql({});
      await user.sync();
      expect(user.auth.apple).to.be.undefined;
    });
  });
});
