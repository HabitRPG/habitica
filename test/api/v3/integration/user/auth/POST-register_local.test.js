import {
  generateUser,
  requester,
  translate as t,
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';
import { encrypt } from '../../../../../../website/server/libs/api-v3/encryption';

describe('POST /user/auth/local/register', () => {
  context('username and email are free', () => {
    let api;

    beforeEach(async () => {
      api = requester();
    });

    it('registers a new user', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.exist;
      expect(user.apiToken).to.exist;
      expect(user.auth.local.username).to.eql(username);
    });

    it('requires password and confirmPassword to match', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';
      let confirmPassword = 'not password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a username', async () => {
      let email = `${generateRandomUserName()}@example.com`;
      let password = 'password';
      let confirmPassword = 'password';

      await expect(api.post('/user/auth/local/register', {
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires an email', async () => {
      let username = generateRandomUserName();
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a valid email', async () => {
      let username = generateRandomUserName();
      let email = 'notanemail@sdf';
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a password', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let confirmPassword = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('attach to facebook user', () => {
    let user;
    let email = 'some@email.net';
    let username = 'some-username';
    let password = 'some-password';
    beforeEach(async () => {
      user = await generateUser();
    });
    it('checks onlySocialAttachLocal', async () => {
      await expect(user.post('/user/auth/local/register', {
        email,
        username,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlySocialAttachLocal'),
      });
    });
    it('succeeds', async () => {
      await user.update({ 'auth.facebook.id': 'some-fb-id', 'auth.local': { ok: true } });
      await user.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });
      await user.sync();
      expect(user.auth.local.username).to.eql(username);
      expect(user.auth.local.email).to.eql(email);
    });
  });

  context('login is already taken', () => {
    let username, email, api;

    beforeEach(async () => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;

      return generateUser({
        'auth.local.username': username,
        'auth.local.lowerCaseUsername': username,
        'auth.local.email': email,
      });
    });

    it('rejects if username is already taken', async () => {
      let uniqueEmail = `${generateRandomUserName()}@exampe.com`;
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email: uniqueEmail,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('usernameTaken'),
      });
    });

    it('rejects if email is already taken', async () => {
      let uniqueUsername = generateRandomUserName();
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username: uniqueUsername,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('emailTaken'),
      });
    });
  });

  context('req.query.groupInvite', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('does not crash the signup process when it\'s invalid', async () => {
      let user = await api.post('/user/auth/local/register?groupInvite=aaaaInvalid', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.be.a('string');
    });

    it('supports invite using req.query.groupInvite', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      let invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now(), // so we can let it expire
      }));

      let user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.invitations.party).to.eql({
        id: group._id,
        name: group.name,
        inviter: groupLeader._id,
      });
    });
  });

  context('successful login via api', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all site tour values to -2 (already seen)', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tour, (value) => {
        expect(value).to.eql(-2);
      });
    });

    it('populates user with default todos, not no other task types', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tasksOrder.todos).to.not.be.empty;
      expect(user.tasksOrder.dailys).to.be.empty;
      expect(user.tasksOrder.habits).to.be.empty;
      expect(user.tasksOrder.rewards).to.be.empty;
    });

    it('populates user with default tags', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });
  });

  context('successful login with habitica-web header', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester({}, {'x-client': 'habitica-web'});
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all common tutorial flags to true', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tutorial.common, (value) => {
        expect(value).to.eql(true);
      });
    });

    it('populates user with default todos, habits, and rewards', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tasksOrder.todos).to.not.be.empty;
      expect(user.tasksOrder.dailys).to.be.empty;
      expect(user.tasksOrder.habits).to.not.be.empty;
      expect(user.tasksOrder.rewards).to.not.be.empty;
    });

    it('populates user with default tags', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });
  });
});
