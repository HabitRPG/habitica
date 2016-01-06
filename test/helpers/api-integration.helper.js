/* eslint-disable no-use-before-define */

import {
  assign,
  each,
  isEmpty,
  set,
  times,
} from 'lodash';
import { MongoClient as mongo } from 'mongodb';
import { v4 as generateUUID } from 'uuid';
import superagent from 'superagent';
import i18n from '../../common/script/src/i18n';
i18n.translations = require('../../website/src/libs/i18n.js').translations;

const API_TEST_SERVER_PORT = 3003;
const API_V = process.env.API_VERSION || 'v2'; // eslint-disable-line no-process-env
const ROUTES = {
  v2: {
    register: '/register',
  },
  v3: {
    register: '/user/auth/local/register',
  },
};

class ApiUser {
  constructor (options) {
    assign(this, options);

    this.get = _requestMaker(this, 'get');
    this.post = _requestMaker(this, 'post');
    this.put = _requestMaker(this, 'put');
    this.del = _requestMaker(this, 'del');
  }

  update (options) {
    return new Promise((resolve) => {
      _updateDocument('users', this, options, resolve);
    });
  }
}

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

// Use this to verify error messages returned by the server
// That way, if the translated string changes, the test
// will not break. NOTE: it checks agains errors with string as well.
export function translate (key, variables) {
  const STRING_ERROR_MSG = 'Error processing the string. Please see Help > Report a Bug.';
  const STRING_DOES_NOT_EXIST_MSG = /^String '.*' not found.$/;

  let translatedString = i18n.t(key, variables);

  expect(translatedString).to.not.be.empty;
  expect(translatedString).to.not.eql(STRING_ERROR_MSG);
  expect(translatedString).to.not.match(STRING_DOES_NOT_EXIST_MSG);

  return translatedString;
}

// Useful for checking things that have been deleted,
// but you no longer have access to,
// like private parties or users
export function checkExistence (collectionName, id) {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://localhost/habitrpg_test', (connectionError, db) => {
      if (connectionError) return reject(connectionError);
      let collection = db.collection(collectionName);

      collection.find({_id: id}, {_id: 1}).limit(1).toArray((findError, docs) => {
        if (findError) return reject(findError);

        let exists = docs.length > 0;

        db.close();
        resolve(exists);
      });
    });
  });
}

// Creates a new user and returns it
// If you need the user to have specific requirements,
// such as a balance > 0, just pass in the adjustment
// to the update object. If you want to adjust a nested
// paramter, such as the number of wolf eggs the user has,
// , you can do so by passing in the full path as a string:
// { 'items.eggs.Wolf': 10 }
export function generateUser (update = {}) {
  let username = generateUUID();
  let password = 'password';
  let email = `${username}@example.com`;

  let request = _requestMaker({}, 'post');

  return new Promise((resolve, reject) => {
    request(ROUTES[API_V].register, {
      username,
      email,
      password,
      confirmPassword: password,
    }).then((user) => {
      _updateDocument('users', user, update, () => {
        let apiUser = new ApiUser(user);

        resolve(apiUser);
      });
    }).catch(reject);
  });
}

// Generates a new group. Requires a user object, which
// will will become the groups leader. Takes an update
// argument which will update group
export function generateGroup (leader, update = {}) {
  let request = _requestMaker(leader, 'post');

  return new Promise((resolve, reject) => {
    request('/groups').then((group) => {
      _updateDocument('groups', group, update, () => {
        resolve(group);
      }).catch(reject);
    });
  });
}

// This is generate group + the ability to create
// real users to populate it. The settings object
// takes in:
// members: Number - the number of group members to create. Defaults to 0.
// inivtes: Number - the number of users to create and invite to the group. Defaults to 0.
// groupDetails: Object - how to initialize the group
// leaderDetails: Object - defaults for the leader, defaults with a gem balance so the user
// can create the group
//
// Returns an object with
// members: an array of user objects that correspond to the members of the group
// invitees: an array of user objects that correspond to the invitees of the group
// leader: the leader user object
// group: the group object
export function createAndPopulateGroup (settings = {}) {
  let request;
  let leader;
  let members;
  let invitees;
  let group;

  let numberOfMembers = settings.members || 0;
  let numberOfInvites = settings.invites || 0;
  let groupDetails = settings.groupDetails;
  let leaderDetails = settings.leaderDetails || { balance: 10 };

  let leaderPromise = generateUser(leaderDetails);

  let memberPromises = Promise.all(
    times(numberOfMembers, () => {
      return generateUser();
    })
  );

  let invitePromises = Promise.all(
    times(numberOfInvites, () => {
      return generateUser();
    })
  );

  return new Promise((resolve, reject) => {
    return leaderPromise.then((user) => {
      leader = user;
      request = _requestMaker(leader, 'post');
      return memberPromises;
    }).then((users) => {
      members = users;
      groupDetails.members = groupDetails.members || [leader._id];

      each(members, (member) => {
        groupDetails.members.push(member._id);
      });

      return generateGroup(leader, groupDetails);
    }).then((createdGroup) => {
      group = createdGroup;
      return invitePromises;
    }).then((users) => {
      invitees = users;

      let invitationPromises = [];

      each(invitees, (invitee) => {
        let invitePromise = request(`/groups/${group._id}/invite`, {
          uuids: [invitee._id],
        });

        invitationPromises.push(invitePromise);
      });

      return Promise.all(invitationPromises);
    }).then(() => {
      resolve({
        leader,
        group,
        members,
        invitees,
      });
    }).catch(reject);
  });
}

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export function resetHabiticaDB () {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://localhost/habitrpg_test', (err, db) => {
      if (err) return reject(err);

      db.dropDatabase((dbErr) => {
        if (dbErr) return reject(dbErr);
        let groups = db.collection('groups');

        groups.insertOne({
          _id: 'habitrpg',
          chat: [],
          leader: '9',
          name: 'HabitRPG',
          type: 'guild',
          privacy: 'public',
          members: [],
        }, (insertErr) => {
          if (insertErr) return reject(insertErr);

          db.close();
          resolve();
        });
      });
    });
  });
}

function _requestMaker (user, method, additionalSets) {
  return (route, send, query) => {
    return new Promise((resolve, reject) => {
      let request = superagent[method](`http://localhost:${API_TEST_SERVER_PORT}/api/${API_V}${route}`)
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

            if (API_V === 'v3') {
              return reject({
                code: err.status,
                error: err.response.body.error,
                message: err.response.body.message,
              });
            } else if (API_V === 'v2') {
              return reject({
                code: err.status,
                text: err.response.body.err,
              });
            }

            return reject(err);
          }

          resolve(response.body);
        });
    });
  };
}

function _updateDocument (collectionName, doc, update, cb) {
  if (isEmpty(update)) {
    return cb();
  }

  mongo.connect('mongodb://localhost/habitrpg_test', (connectErr, db) => {
    if (connectErr) throw new Error(`Error connecting to database when updating ${collectionName} collection: ${connectErr}`);

    let collection = db.collection(collectionName);

    collection.updateOne({ _id: doc._id }, { $set: update }, (updateErr) => {
      if (updateErr) throw new Error(`Error updating ${collectionName}: ${updateErr}`);
      _updateLocalDocument(doc, update);
      db.close();
      cb();
    });
  });
}

function _updateLocalDocument (doc, update) {
  each(update, (value, param) => {
    set(doc, param, value);
  });
}
