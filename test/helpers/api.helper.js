import {isEmpty} from 'lodash';
import {v4 as generateRandomUserName} from 'uuid';
import superagent from 'superagent';

const API_TEST_SERVER_PORT = 3003;

export function requester(user={}) {
  return {
    get: _requestMaker(user, 'get'),
    post: _requestMaker(user, 'post'),
    put: _requestMaker(user, 'put'),
    del: _requestMaker(user, 'del'),
  }
}

export function generateUser(update={}) {
  let username = generateRandomUserName();
  let password = 'password'
  let email = username + '@example.com';

  let request = _requestMaker({}, 'post');

  return new Promise((resolve, reject) => {
    request('/register', {
      username: username,
      email: email,
      password: password,
      confirmPassword: password,
    }).then((user) => {
      resolve(user);
    });
  });
};

function _requestMaker(user, method) {
  return (route, send, query) => {
    return new Promise((resolve, reject) => {
      let request = superagent[method](`http://localhost:${API_TEST_SERVER_PORT}/api/v2${route}`)
        .accept('application/json');

      if (user._id && user.apiToken) {
        request
          .set('x-api-user', user._id)
          .set('x-api-key', user.apiToken);
      }

      request
        .query(query)
        .send(send)
        .end((err, response) => {
          if (err) { return reject(err); }

          resolve(response.body);
        });
    });
  }
}
