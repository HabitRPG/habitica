import superagent from 'superagent';

export function requester(user={}) {
  return {
    get: _requestMaker(user, 'get'),
    post: _requestMaker(user, 'post'),
    put: _requestMaker(user, 'put'),
    del: _requestMaker(user, 'del'),
  }
}

function _requestMaker(user, method) {
  return (route, options={}) => {
    return new Promise((resolve, reject) => {
      let request = superagent[method](`http://localhost:3003/api/v2${route}`)
        .accept('application/json');

      if (user._id && user.apiToken) {
        request
          .set('x-api-user', user._id)
          .set('x-api-key', user.apiToken);
      }

      request
        .query(options.query)
        .send(options.send)
        .end((err, response) => {
          if (err) { return reject(err); }

          let res = {
            code: response.statusCode,
            body: response.body,
          }

          resolve(res);
        });
    });
  }
}
