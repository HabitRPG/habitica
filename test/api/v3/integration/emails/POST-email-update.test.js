import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
// import { encrypt } from '../../../../../website/src/libs/api-v3/encryption';
import { v4 as generateUUID } from 'uuid';

describe('POST /email/update', () => {
  let user;
  let user_fb;
  let testEmail   = 'test@habitica.com';
  let endpoint    = '/email/update';
  let newEmail    = 'some-new-email@example.net';
  let thePassword = 'the-right-password';

  beforeEach(async () => {
    user = await generateUser();
    user_fb = await generateUser({ "auth.local.email": null });
  });


  it('does not change email if one is not provided', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('does not change email if password is not provided', async () => {
    await expect(user.post(endpoint, {
      newEmail: newEmail
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('does not change email if wrong password is provided', async () => {
    await expect(user.post(endpoint, {
      newEmail: newEmail,
      password: 'wrong password'
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('changes email if new email and existing password are provided', async () => {
    let response = await expect(user.post(endpoint, {
      newEmail: newEmail,
      password: thePassword
    }));
    console.log('+++ response is', response);
    expect(response).to.equal('ok');
  });

  it('returns success if new email is the same as old', async () => {
  });


  it('does not change email if user.auth.local.email does not exist for this user', async () => {
    await expect(user_fb.post(endpoint, {
      newEmail: newEmail,
      password: thePassword
    })).to.eventually.be.rejected.and.eql({
      code: 412,
      error: 'PreconditionFailed',
      message: t('userHasNoLocalRegistration')
    });
  });

});
