import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { model as User } from '../../../../../website/src/models/user';

describe('PUT /user/auth/update-email', () => {
  let user;
  let fbUser;
  let endpoint = '/user/auth/update-email';
  let newEmail = 'some-new-email_2@example.net';
  let thePassword = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  describe('local user', async () => {
    beforeEach(async () => {
      user = await generateUser();
    });

    it('does not change email if one is not provided', async () => {
      await expect(user.put(endpoint)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('does not change email if password is not provided', async () => {
      await expect(user.put(endpoint, {
        newEmail,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('does not change email if wrong password is provided', async () => {
      await expect(user.put(endpoint, {
        newEmail,
        password: 'wrong password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    it('changes email if new email and existing password are provided', async () => {
      let response = await user.put(endpoint, {
        newEmail,
        password: thePassword,
      });
      expect(response).to.eql({ email: 'some-new-email_2@example.net' });
      let id = user._id;
      user = await User.findOne({ _id: id });
      expect(user.auth.local.email).to.eql(newEmail);
    });
  });

  describe('facebook user', async () => {
    beforeEach(async () => {
      fbUser = await generateUser();
      await fbUser.update({ 'auth.local': { ok: true } });
    });

    it('does not change email if user.auth.local.email does not exist for this user', async () => {
      await expect(fbUser.put(endpoint, {
        newEmail,
        password: thePassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('userHasNoLocalRegistration'),
      });
    });
  });
});
