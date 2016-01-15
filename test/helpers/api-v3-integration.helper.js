/* eslint-disable no-use-before-define */

import {
  assign,
  each,
  isEmpty,
  set,
  times,
} from 'lodash';
import Q from 'q';
import { MongoClient as mongo } from 'mongodb';
import { v4 as generateUUID } from 'uuid';
import superagent from 'superagent';
import i18n from '../../common/script/src/i18n';
i18n.translations = require('../../website/src/libs/api-v3/i18n').translations;

const API_TEST_SERVER_PORT = 3003;

class ApiObject {
  constructor (options) {
    assign(this, options);
  }

  update (options) {
    return new Promise((resolve) => {
      _updateDocument(this._docType, this, options, resolve);
    });
  }
}

class ApiUser extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'users';

    this.get = _requestMaker(this, 'get');
    this.post = _requestMaker(this, 'post');
    this.put = _requestMaker(this, 'put');
    this.del = _requestMaker(this, 'del');
  }
}

class ApiGroup extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'groups';
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
export async function generateUser (update = {}) {
  let username = generateUUID();
  let password = 'password';
  let email = `${username}@example.com`;

  let request = _requestMaker({}, 'post');

  let user = await request('/user/auth/local/register', {
    username,
    email,
    password,
    confirmPassword: password,
  });

  let apiUser = new ApiUser(user);

  await apiUser.update(update);

  return apiUser;
}

// Generates a new group. Requires a user object, which
// will will become the groups leader. Takes an update
// argument which will update group
export async function generateGroup (leader, details = {}, update = {}) {
  details.type = details.type || 'party';
  details.privacy = details.privacy || 'private';
  details.name = details.name || 'test group';

  let group = await leader.post('/groups', details);
  let apiGroup = new ApiGroup(group);

  await apiGroup.update(update);

  return apiGroup;
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
export async function createAndPopulateGroup (settings = {}) {
  let numberOfMembers = settings.members || 0;
  let numberOfInvites = settings.invites || 0;
  let groupDetails = settings.groupDetails;
  let leaderDetails = settings.leaderDetails || { balance: 10 };

  let groupLeader = await generateUser(leaderDetails);
  let group = await generateGroup(groupLeader, groupDetails);

  let members = await Q.all(
    times(numberOfMembers, () => {
      return generateUser();
    })
  );

  let groupTypes = {
    guild: { guilds: [group._id] },
    party: { 'party._id': group._id },
  };

  let memberPromises = members.map((member) => {
    return member.update(groupTypes[group.type]);
  });

  await Q.all(memberPromises);

  let invitees = await Q.all(
    times(numberOfInvites, () => {
      return generateUser();
    })
  );

  let invitationPromises = invitees.map((invitee) => {
    return groupLeader.post(`/groups/${group._id}/invite`, {
      uuids: [invitee._id],
    });
  });

  await Q.all(invitationPromises);

  return {
    groupLeader,
    group,
    members,
    invitees,
  };
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
      let request = superagent[method](`http://localhost:${API_TEST_SERVER_PORT}/api/v3${route}`)
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
              error: err.response.body.error,
              message: err.response.body.message,
            });
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
