/* eslint-disable no-use-before-define */

import superagent from 'superagent';

const API_TEST_SERVER_PORT = 3003;
let apiVersion;

// Sets up an abject that can make all REST requests
// If a user is passed in, the uuid and api token of
// the user are used to make the requests
export function requester (user = {}, additionalSets) {
  return {
    get: _requestMaker(user, 'get', additionalSets),
    post: _requestMaker(user, 'post', additionalSets),
    put: _requestMaker(user, 'put', additionalSets),
    del: _requestMaker(user, 'del', additionalSets),
  };
}

requester.setApiVersion = (version) => {
  apiVersion = version;
};

function _requestMaker (user, method, additionalSets) {
  if (!apiVersion) throw new Error('apiVersion not set');

  return (route, send, query) => {
    return new Promise((resolve, reject) => {
      let request = superagent[method](`http://localhost:${API_TEST_SERVER_PORT}/api/${apiVersion}${route}`)
        .accept('application/json');

      if (user && user._id && user.apiToken) {
        request
          .set('x-api-user', user._id)
          .set('x-api-key', user.apiToken);
      }

      if (additionalSets) {
        request.set(additionalSets);
      }

      request
        .query(query)
        .send(send)
        .end((err, response) => {
          if (err) {
            if (!err.response) return reject(err);

            return reject({
              code: err.status,
              text: err.response.body.err,
            });
          }

          resolve(response.body);
        });
    });
  };
}
