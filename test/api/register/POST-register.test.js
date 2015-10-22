import {requester} from '../../helpers/api.helper';
import {v4 as generateRandomUserName} from 'uuid';

describe('POST /register', () => {
  let api;

  beforeEach(() => {
    api = requester();
  });

  it('registers a new user', (done) => {
    let username = generateRandomUserName();
    let email = `${username}@example.com`;
    let password = 'password';

    api.post('/register', {
      username:        username,
      email:           email,
      password:        password,
      confirmPassword: password,
    }).then((user) => {
      expect(user._id).to.exist;
      expect(user.auth.local.username).to.eql(username);
      expect(user.auth.local.email).to.eql(`${username}@example.com`);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});
