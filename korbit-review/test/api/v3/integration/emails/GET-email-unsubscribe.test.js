import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { encrypt } from '../../../../../website/server/libs/encryption';

describe('GET /email/unsubscribe', () => {
  let user;
  const testEmail = 'test@habitica.com';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('return error when code is not provided', async () => {
    await expect(user.get('/email/unsubscribe')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('return error when user is not found', async () => {
    const code = encrypt(JSON.stringify({
      _id: generateUUID(),
    }));

    await expect(user.get(`/email/unsubscribe?code=${code}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userNotFound'),
    });
  });

  it('unsubscribes a user from email notifications', async () => {
    const code = encrypt(JSON.stringify({
      _id: user._id,
      email: user.email,
    }));

    await user.get(`/email/unsubscribe?code=${code}`);

    const unsubscribedUser = await user.get('/user');

    expect(unsubscribedUser.preferences.emailNotifications.unsubscribeFromAll).to.be.true;
  });

  it('unsubscribes an email from notifications', async () => {
    const code = encrypt(JSON.stringify({
      email: testEmail,
    }));

    const unsubscribedMessage = await user.get(`/email/unsubscribe?code=${code}`);

    expect(unsubscribedMessage).to.equal('<h1>Unsubscribed successfully!</h1> You won\'t receive any other email from Habitica.');
  });

  it('returns okay when email is already unsubscribed', async () => {
    const code = encrypt(JSON.stringify({
      email: testEmail,
    }));

    const unsubscribedMessage = await user.get(`/email/unsubscribe?code=${code}`);

    expect(unsubscribedMessage).to.equal('<h1>Unsubscribed successfully!</h1> You won\'t receive any other email from Habitica.');
  });
});
