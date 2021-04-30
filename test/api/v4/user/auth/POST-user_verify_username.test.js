import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v4';

const ENDPOINT = '/user/auth/verify-username';

describe('POST /user/auth/verify-username', async () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully verifies username', async () => {
    const newUsername = 'new-username';
    const response = await user.post(ENDPOINT, {
      username: newUsername,
    });
    expect(response).to.eql({ isUsable: true });
  });

  it('successfully verifies username with allowed characters', async () => {
    const newUsername = 'new-username_123';
    const response = await user.post(ENDPOINT, {
      username: newUsername,
    });
    expect(response).to.eql({ isUsable: true });
  });

  context('errors', async () => {
    it('errors if username is not provided', async () => {
      await expect(user.post(ENDPOINT, {
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('errors if username is a slur', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueLength'), t('usernameIssueSlur')] });
    });

    it('errors if username contains a slur', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE_otherword',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueLength'), t('usernameIssueSlur')] });
      await expect(user.post(ENDPOINT, {
        username: 'something_TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueLength'), t('usernameIssueSlur')] });
    });

    it('errors if username is not allowed', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'support',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueForbidden')] });
    });

    it('errors if username is not allowed regardless of casing', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'SUppORT',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueForbidden')] });
    });

    it('errors if username has incorrect length', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'thisisaverylongusernameover20characters',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueLength')] });
    });

    it('errors if username contains invalid characters', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'Eichhörnchen',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueInvalidCharacters')] });
      await expect(user.post(ENDPOINT, {
        username: 'test.name',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueInvalidCharacters')] });
      await expect(user.post(ENDPOINT, {
        username: '🤬',
      })).to.eventually.eql({ isUsable: false, issues: [t('usernameIssueInvalidCharacters')] });
    });
  });
});
