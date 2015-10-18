import {isEmpty} from 'lodash';
import {MongoClient as mongo} from 'mongodb';
import {v4 as generateUUID} from 'uuid';
import superagent from 'superagent';

const API_TEST_SERVER_PORT = 3003;

export function requester(user={}) {
  return {
    get: _requestMaker(user, 'get'),
    post: _requestMaker(user, 'post'),
    put: _requestMaker(user, 'put'),
    del: _requestMaker(user, 'del'),
  }
};

export function generateUser(update={}) {
  let username = generateUUID();
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
      _updateDocument('users', user._id, update, () => {
        resolve(user);
      });
    });
  });
};

export function generateGroup(leader, update={}) {
  let request = _requestMaker(leader, 'post');

  return new Promise((resolve, reject) => {
    request('/groups').then((group) => {
      _updateDocument('groups', group._id, update, () => {
        resolve(group);
      });
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
          if (err) {
            let errorString = JSON.parse(err.response.text).err;
            return reject({
              code: err.response.statusCode,
              text: errorString,
            });
          }

          resolve(response.body);
        });
    });
  }
}

function _updateDocument(collectionName, uuid, update, cb) {
  if (isEmpty(update)) { return cb(); }

  mongo.connect('mongodb://localhost/habitrpg_test', (err, db) => {
    if (err) throw `Error connecting to database when updating ${collectionName} collection: ${err}`;

    let collection = db.collection(collectionName);

    collection.update({ _id: uuid }, { $set: update }, (err, result) => {
      if (err) throw `Error updating ${collectionName}: ${err}`;
      cb();
    });
  });
}
