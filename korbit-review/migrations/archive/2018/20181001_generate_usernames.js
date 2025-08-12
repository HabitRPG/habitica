let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Generate usernames for users who lack them
 */

import monk from 'monk';
import nconf from 'nconf';
import { generateUsername } from '../../website/server/libs/auth/utils';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING'); // FOR TEST DATABASE
let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    'auth.local.username': {$exists: false},
    'auth.timestamps.loggedin': {$gt: new Date('2018-04-01')}, // Initial coverage for users active within last 6 months
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [
      'auth',
    ], // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

let progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  let userPromises = users.map(updateUser);
  let lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(() => {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  if (!user.auth.local.username) {
    const newName = generateUsername();
    dbUsers.update(
      {_id: user._id},
      {$set:
        {
          'auth.local.username': newName,
          'auth.local.lowerCaseUsername': newName,
        },
      }
    );
  }
  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
}

function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}

function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}

module.exports = processUsers;
