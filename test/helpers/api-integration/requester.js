/* eslint-disable no-use-before-define */

import superagent from 'superagent';
import nconf from 'nconf';
import { isEmpty, cloneDeep } from 'lodash';

const API_TEST_SERVER_PORT = nconf.get('PORT');
let apiVersion;

// Sets up an object that can make all REST requests
// If a user is passed in, the uuid and api token of
// the user are used to make the requests
export function requester (user = {}, additionalSets = {}) {
  additionalSets = cloneDeep(additionalSets); // cloning because it could be modified later to set cookie

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

function _requestMaker (user, method, additionalSets = {}) {
  if (!apiVersion) throw new Error('apiVersion not set');

  return (route, send, query) => {
    return new Promise((resolve, reject) => {
      let url = `http://localhost:${API_TEST_SERVER_PORT}`;

      // do not prefix with api/apiVersion requests to top level routes like dataexport, payments and emails
      if (route.indexOf('/email') === 0 || route.indexOf('/export') === 0 || route.indexOf('/paypal') === 0 || route.indexOf('/amazon') === 0 || route.indexOf('/stripe') === 0 || route.indexOf('/qr-code') === 0) {
        url += `${route}`;
      } else {
        url += `/api/${apiVersion}${route}`;
      }

      let request = superagent[method](url)
        .accept('application/json');

      if (user && user._id && user.apiToken) {
        request
          .set('x-api-user', user._id)
          .set('x-api-key', user.apiToken);
      }

      if (!isEmpty(additionalSets)) {
        request.set(additionalSets);
      }

      request
        .query(query)
        .send(send)
        .end((err, response) => {
          if (err) {
            if (!err.response) return reject(err);

            let parsedError = _parseError(err);

            return reject(parsedError);
          }

          resolve(_parseRes(response));
        });
    });
  };
}

function _parseRes (res) {
  let contentType = res.headers['content-type'] || '';
  let contentDisposition = res.headers['content-disposition'] || '';

  if (contentType.indexOf('json') === -1) { // not a json response
    return res.text;
  }

  if (contentDisposition.indexOf('attachment') !== -1) {
    return res.body;
  }

  if (apiVersion === 'v2') {
    return res.body;
  } else if (apiVersion === 'v3') {
    if (res.body.message) {
      return {
        data: res.body.data,
        message: res.body.message,
      };
    } else {
      return res.body.data;
    }
  }
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
