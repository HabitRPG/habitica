import {
  checkExistence,
  generateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import {
  sha1MakeSalt,
  sha1Encrypt as sha1EncryptPassword,
} from '../../../../../website/server/libs/password';
import * as email from '../../../../../website/server/libs/email';
import sendJob from '../../../../../website/server/libs/worker';

const DELETE_CONFIRMATION = 'DELETE';

describe('DELETE /user', () => {
  let user;
  const password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js

  context('user with local auth', async () => {
    beforeEach(async () => {
      user = await generateUser({ balance: 10 });
    });

    it('returns an error if password is wrong', async () => {
      await expect(user.del('/user', {
        password: 'wrong-password',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('wrongPassword'),
      });
    });

    it('returns an error if password is not supplied', async () => {
      await expect(user.del('/user', {
        password: '',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('missingPassword'),
      });
    });

    it('sends deletion job to worker', async () => {
      const workerStub = sandbox.stub(sendJob, 'sendJob');
      await user.del('/user', {
        password,
      });
      expect(workerStub).to.be.calledOnce;
      workerStub.restore();
    });

    it('returns an error if excessive feedback is supplied', async () => {
      const feedbackText = 'spam feedback ';
      let feedback = feedbackText;
      while (feedback.length < 10000) {
        feedback += feedbackText;
      }

      await expect(user.del('/user', {
        password,
        feedback,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Account deletion feedback is limited to 10,000 characters. For lengthy feedback, email admin@habitica.com.',
      });
    });

    it('returns an error if user has active subscription', async () => {
      const userWithSubscription = await generateUser({ 'purchased.plan.customerId': 'fake-customer-id' });

      await expect(userWithSubscription.del('/user', {
        password,
      })).to.be.rejected.and.to.eventually.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cannotDeleteActiveAccount'),
      });
    });

    it('sends feedback to the admin email', async () => {
      sandbox.spy(email, 'sendTxn');

      const feedback = 'Reasons for Deletion';
      await user.del('/user', {
        password,
        feedback,
      });

      expect(email.sendTxn).to.be.calledOnce;

      sandbox.restore();
    });

    it('does not send email if no feedback is supplied', async () => {
      sandbox.spy(email, 'sendTxn');

      await user.del('/user', {
        password,
      });

      expect(email.sendTxn).to.not.be.called;

      sandbox.restore();
    });

    it('deletes the user with a legacy sha1 password', async () => {
      const textPassword = 'mySecretPassword';
      const salt = sha1MakeSalt();
      const sha1HashedPassword = sha1EncryptPassword(textPassword, salt);
      const workerStub = sandbox.stub(sendJob, 'sendJob');

      await user.updateOne({
        'auth.local.hashed_password': sha1HashedPassword,
        'auth.local.passwordHashMethod': 'sha1',
        'auth.local.salt': salt,
      });

      await user.sync();

      expect(user.auth.local.passwordHashMethod).to.equal('sha1');
      expect(user.auth.local.salt).to.equal(salt);
      expect(user.auth.local.hashed_password).to.equal(sha1HashedPassword);

      // delete the user
      await user.del('/user', {
        password: textPassword,
      });
      expect(workerStub).to.be.calledOnce;
      workerStub.restore();
    });

    context('last member of a party', () => {
      let party;

      beforeEach(async () => {
        party = await generateGroup(user, {
          type: 'party',
          privacy: 'private',
        });
      });

      it('deletes party when user is the only member', async () => {
        await user.del('/user', {
          password,
        });
        await expect(checkExistence('party', party._id)).to.eventually.eql(false);
      });
    });
  });

  context('user with Google auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          google: {
            id: 'google-id',
          },
        },
      });
    });

    it('deletes a Google user', async () => {
      const workerStub = sandbox.stub(sendJob, 'sendJob');
      await user.del('/user', {
        password: DELETE_CONFIRMATION,
      });
      expect(workerStub).to.be.calledOnce;
      workerStub.restore();
    });
  });

  context('user with Apple auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          apple: {
            id: 'apple-id',
          },
        },
      });
    });

    it('deletes an Apple user', async () => {
      const workerStub = sandbox.stub(sendJob, 'sendJob');
      await user.del('/user', {
        password: DELETE_CONFIRMATION,
      });
      expect(workerStub).to.be.calledOnce;
      workerStub.restore();
    });
  });
});
