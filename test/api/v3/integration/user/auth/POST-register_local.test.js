import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

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
