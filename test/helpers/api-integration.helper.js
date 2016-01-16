/* eslint-disable no-use-before-define */

import {
  each,
  times,
} from 'lodash';
import { MongoClient as mongo } from 'mongodb';
import { v4 as generateUUID } from 'uuid';
import i18n from '../../common/script/src/i18n';
i18n.translations = require('../../website/src/libs/i18n.js').translations;

import { ApiUser, ApiGroup } from './api-integration/api-classes';


// Import requester function, set it up for v2, export it
import { requester } from './api-integration/requester'
requester.setApiVersion('v2');
export { requester };


// Use this to verify error messages returned by the server
// That way, if the translated string changes, the test
// will not break. NOTE: it checks against errors with string as well.
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

  let user = await requester().post('/register', {
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
export async function generateGroup (leader, update = {}) {
  let group = await leader.post('/groups');
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
export function createAndPopulateGroup (settings = {}) {
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
        let invitePromise = leader.post(`/groups/${group._id}/invite`, {
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
