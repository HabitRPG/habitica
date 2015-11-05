import {
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

describe('POST /register', () => {

  context('username and email are free', () => {
    it('registers a new user', () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user._id).to.exist;
        expect(user.apiToken).to.exist;
        expect(user.auth.local.username).to.eql(username);
      });
    });

    it('requires password and confirmPassword to match', () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';
      let confirmPassword = 'not password';

      return expect(api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthPasswordMustMatch'),
      });
    });

    it('requires a username', () => {
      let api = requester();
      let email = `${generateRandomUserName()}@example.com`;
      let password = 'password';
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        email:           email,
        password:        password,
        confirmPassword: confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });

    it('requires an email', () => {
      let api = requester();
      let username = generateRandomUserName();
      let password = 'password';
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        username:        username,
        password:        password,
        confirmPassword: confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });

    it('requires a password', () => {
      let api = requester();
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let confirmPassword = 'password';

      return expect(api.post('/register', {
        username:        username,
        email:           email,
        confirmPassword: confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthCredentialsRequired'),
      });
    });
  });

  context('login is already taken', () => {
    let username, email;
    beforeEach(() => {
      username = generateRandomUserName();
      email = `${username}@example.com`;
      return generateUser({
        'auth.local.username': username,
        'auth.local.lowerCaseUsername': username,
        'auth.local.email': email
      });
    });

    it('rejects if username is already taken', () => {
      let api = requester();
      let uniqueEmail = `${generateRandomUserName()}@exampe.com`;
      let password = 'password';

      return expect(api.post('/register', {
        username:        username,
        email:           uniqueEmail,
        password:        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthUsernameTaken'),
      });
    });

    it('rejects if email is already taken', () => {
      let api = requester();
      let uniqueUsername = generateRandomUserName();
      let password = 'password';

      return expect(api.post('/register', {
        username:        uniqueUsername,
        email:           email,
        password:        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageAuthEmailTaken'),
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

    it('sets all site tour values to -2 (already seen)', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.flags.tour).to.not.be.empty;

        each(user.flags.tour, (value, attribute) => {
          expect(value).to.eql(-2);
        });
      });
    });

    it('populates user with default todos, not no other task types', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.todos).to.not.be.empty;
        expect(user.dailys).to.be.empty;
        expect(user.habits).to.be.empty;
        expect(user.rewards).to.be.empty;
      });
    });

    it('populates user with default tags', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.tags).to.not.be.empty;
      });
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

    it('sets all common tutorial flags to true', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.flags.tour).to.not.be.empty;

        each(user.flags.tutorial.common, (value, attribute) => {
          expect(value).to.eql(true);
        });
      });
    });

    it('populates user with default todos, habits, and rewards', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.todos).to.not.be.empty;
        expect(user.dailys).to.be.empty;
        expect(user.habits).to.not.be.empty;
        expect(user.rewards).to.not.be.empty;
      });
    });

    it('populates user with default tags', () => {
      return api.post('/register', {
        username:        username,
        email:           email,
        password:        password,
        confirmPassword: password,
      }).then((user) => {
        expect(user.tags).to.not.be.empty;
      });
    });
  });
});
