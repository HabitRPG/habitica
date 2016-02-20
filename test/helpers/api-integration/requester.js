/* eslint-disable no-use-before-define */

import superagent from 'superagent';
import nconf from 'nconf';

const API_TEST_SERVER_PORT = nconf.get('PORT');
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

// save the last cookie so that it's resent with every request
// should be safe since every time a user is generated this will be overwritten
let cookie;

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

      // if we previously saved a cookie, send it along the request
      if (cookie) {
        request.set('Cookie', cookie);
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

            let parsedError = _parseError(err);

            reject(parsedError);
          }

          // if any cookies was sent, save it for the next request
          if (response.headers['set-cookie']) {
            cookie = response.headers['set-cookie'].map(cookieString => {
              return cookieString.split(';')[0];
            }).join('; ');
          }

          let contentType = response.headers['content-type'] || '';
          resolve(contentType.indexOf('json') !== -1 ? response.body : response.text);
        });
    });
  };
}

function _parseError (err) {
  let parsedError;

  if (apiVersion === 'v2') {
    parsedError = {
      code: err.status,
      text: err.response.body.err,
    };
  } else if (apiVersion === 'v3') {
    parsedError = {
      code: err.status,
      error: err.response.body.error,
      message: err.response.body.message,
    };
  }

  return parsedError;
}
