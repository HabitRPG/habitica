/* eslint-disable no-use-before-define */

import superagent from 'superagent';
import nconf from 'nconf';
import { isEmpty, cloneDeep } from 'lodash';

const API_TEST_SERVER_PORT = nconf.get('PORT');
let apiVersion;

// Sets up an object that can make all REST requests
// If a user is passed in, the uuid and api token of
// the user are used to make the requests
export function requester (user = {}, additionalSets = {}) { // eslint-disable-line import/prefer-default-export, max-len
  // cloning because it could be modified later to set cookie
  additionalSets = cloneDeep(additionalSets); // eslint-disable-line no-param-reassign

  return {
    get: _requestMaker(user, 'get', additionalSets),
    post: _requestMaker(user, 'post', additionalSets),
    put: _requestMaker(user, 'put', additionalSets),
    del: _requestMaker(user, 'del', additionalSets),
  };
}

requester.setApiVersion = version => {
  apiVersion = version;
};

function _requestMaker (user, method, additionalSets = {}) {
  if (!apiVersion) throw new Error('apiVersion not set');

  return (route, send, query) => new Promise((resolve, reject) => {
    let url = `http://localhost:${API_TEST_SERVER_PORT}`;

    // do not prefix with api/apiVersion requests to top level routes
    // like dataexport, payments and emails
    if (
      route.indexOf('/email') === 0
      || route.indexOf('/export') === 0
      || route.indexOf('/paypal') === 0
      || route.indexOf('/amazon') === 0
      || route.indexOf('/stripe') === 0
      || route.indexOf('/analytics') === 0
    ) {
      url += `${route}`;
    } else {
      url += `/api/${apiVersion}${route}`;
    }

    const request = superagent[method](url)
      .accept('application/json');

    if (user && user._id && user.apiToken) {
      request
        .set('x-api-user', user._id)
        .set('x-api-key', user.apiToken)
        .set('x-client', 'habitica-web');
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

          const parsedError = _parseError(err);

          return reject(parsedError);
        }

        return resolve(_parseRes(response));
      });
  });
}

function _parseRes (res) {
  const contentType = res.headers['content-type'] || '';
  const contentDisposition = res.headers['content-disposition'] || '';

  if (contentType.indexOf('json') === -1) { // not a json response
    return res.text;
  }

  if (contentDisposition.indexOf('attachment') !== -1) {
    return res.body;
  }

  if (apiVersion === 'v2') {
    return res.body;
  } if (apiVersion === 'v3' || apiVersion === 'v4') {
    if (res.body.message) {
      return {
        data: res.body.data,
        message: res.body.message,
      };
    }
    return res.body.data;
  }

  return null;
}

function _parseError (err) {
  let parsedError;

  if (apiVersion === 'v2') {
    parsedError = {
      code: err.status,
      text: err.response.body.err,
    };
  } else if (apiVersion === 'v3' || apiVersion === 'v4') {
    parsedError = {
      code: err.status,
      error: err.response.body.error,
      message: err.response.body.message,
    };
  }

  return parsedError;
}
