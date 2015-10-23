import {
  assign,
  each,
  isEmpty,
  times,
} from 'lodash';
import {MongoClient as mongo} from 'mongodb';
import {v4 as generateUUID} from 'uuid';
import superagent from 'superagent';

const API_TEST_SERVER_PORT = 3003;

// Sets up an abject that can make all REST requests
// If a user is passed in, the uuid and api token of
// the user are used to make the requests
export function requester(user={}) {
  return {
    get: _requestMaker(user, 'get'),
    post: _requestMaker(user, 'post'),
    put: _requestMaker(user, 'put'),
    del: _requestMaker(user, 'del'),
  }
};

// Creates a new user and returns it
// If you need the user to have specific requirements,
// such as a balance > 0, just pass in the adjustment
// to the update object. If you want to adjust a nested
// paramter, such as the number of wolf eggs the user has,
// , you can do so by passing in the full path as a string:
// { 'items.eggs.Wolf': 10 }
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
      _updateDocument('users', user, update, () => {
        resolve(user);
      });
    });
  });
};

// Generates a new group. Requires a user object, which
// will will become the groups leader. Takes an update
// argument which will update group
export function generateGroup(leader, update={}) {
  let request = _requestMaker(leader, 'post');

  return new Promise((resolve, reject) => {
    request('/groups').then((group) => {
      _updateDocument('groups', group, update, () => {
        resolve(group);
      });
    });
  });
};

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
export function createAndPopulateGroup(settings={}) {
  let request, leader, members, invitees, group;

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

      let invitePromises = [];

      each(invitees, (invitee) => {
        let invitePromise = request(`/groups/${group._id}/invite`, {
          uuids: [invitee._id]
        });
       invitePromises.push(invitePromise);
      });

      return Promise.all(invitePromises);
    }).then((inviteResults) => {
      resolve({
        leader: leader,
        group: group,
        members: members,
        invitees: invitees,
      });
    }).catch(reject);
  });
};

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export function resetHabiticaDB() {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://localhost/habitrpg_test', (err, db) => {
      if (err) return reject(err);

      db.dropDatabase((err) => {
        if (err) return reject(err);
        let groups = db.collection('groups');
        groups.insertOne({
          _id: 'habitrpg',
          chat: [],
          leader: '9',
          name: 'HabitRPG',
          type: 'guild',
          privacy: 'public',
          members: [],
        }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  });
}

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
            if (!err.response) return reject(err);
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

function _updateDocument(collectionName, doc, update, cb) {
  if (isEmpty(update)) { return cb(); }

  mongo.connect('mongodb://localhost/habitrpg_test', (err, db) => {
    if (err) throw `Error connecting to database when updating ${collectionName} collection: ${err}`;

    let collection = db.collection(collectionName);

    collection.update({ _id: doc._id }, { $set: update }, (err, result) => {
      if (err) throw `Error updating ${collectionName}: ${err}`;
      assign(doc, update);
      cb();
    });
  });
}
