import {
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration/v2';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

describe('POST /register', () => {
  context('username and email are free', () => {
    it('registers a new user', async () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user._id).to.exist;
        expect(user.apiToken).to.exist;
        expect(user.auth.local.username).to.eql(username);
      });
    });

    it('requires password and confirmPassword to match', async () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';
      let confirmPassword = 'not password';

      return expect(api.post('/register', {
        username,
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthPasswordMustMatch'),
      });
    });

    it('requires a username', async () => {
      let api = requester();
      let email = `${generateRandomUserName()}@example.com`;
      let password = 'password';
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });

    it('requires an email', async () => {
      let api = requester();
      let username = generateRandomUserName();
      let password = 'password';
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        username,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });

    it('requires a password', async () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        username,
        email,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });
  });

  context('login is already taken', () => {
    let username, email;
    beforeEach(async () => {
      username = generateRandomUserName();
      email = `${username}@example.com`;
      return generateUser({
        'auth.local.username': username,
        'auth.local.lowerCaseUsername': username,
        'auth.local.email': email,
      });
    });

    it('rejects if username is already taken', async () => {
      let api = requester();
      let uniqueEmail = `${generateRandomUserName()}@exampe.com`;
      let password = 'password';

      return expect(api.post('/register', {
        username,
        email: uniqueEmail,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthUsernameTaken'),
      });
    });

    it('rejects if email is already taken', async () => {
      let api = requester();
      let uniqueUsername = generateRandomUserName();
      let password = 'password';

      return expect(api.post('/register', {
        username: uniqueUsername,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthEmailTaken'),
      });
    });
  });

  context('successful login via api', () => {
    let api, username, email, password;

    beforeEach(async () => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all site tour values to -2 (already seen)', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.flags.tour).to.not.be.empty;

        each(user.flags.tour, (value) => {
          expect(value).to.eql(-2);
        });
      });
    });

    it('populates user with default todos, not no other task types', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.todos).to.not.be.empty;
        expect(user.dailys).to.be.empty;
        expect(user.habits).to.be.empty;
        expect(user.rewards).to.be.empty;
      });
    });

    it('populates user with default tags', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.tags).to.not.be.empty;
      });
    });
  });

  context('successful login with habitica-web header', () => {
    let api, username, email, password;

    beforeEach(async () => {
      api = requester({}, {'x-client': 'habitica-web'});
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all common tutorial flags to true', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.flags.tour).to.not.be.empty;

        each(user.flags.tutorial.common, (value) => {
          expect(value).to.eql(true);
        });
      });
    });

    it('populates user with default todos, habits, and rewards', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.todos).to.not.be.empty;
        expect(user.dailys).to.be.empty;
        expect(user.habits).to.not.be.empty;
        expect(user.rewards).to.not.be.empty;
      });
    });

    it('populates user with default tags', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.tags).to.not.be.empty;
      });
    });
  });

  context('successful login with habitica-android header', () => {
    let api, username, email, password;

    beforeEach(async () => {
      api = requester({}, {'x-client': 'habitica-android'});
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all common tutorial flags to true', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.flags.tour).to.not.be.empty;

        each(user.flags.tutorial.common, (value) => {
          expect(value).to.eql(true);
        });
      });
    });

    it('populates user with default todos, habits, and rewards', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.todos).to.not.be.empty;
        expect(user.dailys).to.be.empty;
        expect(user.habits).to.not.be.empty;
        expect(user.rewards).to.not.be.empty;
      });
    });

    it('populates user with default tags', async () => {
      return api.post('/register', {
        username,
        email,
        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.tags).to.not.be.empty;
      });
    });
  });
});
