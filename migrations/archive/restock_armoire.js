/* eslint-disable import/no-commonjs */
const migrationName = 'restock_armoire.js';
const authorName = 'Sabe'; // in case script author needs to know when their ...
const authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Remove flag stating that the Enchanted Armoire is empty, for when new equipment is added
 */

const monk = require('monk'); // eslint-disable-line import/no-extraneous-dependencies

const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  const query = {
    'flags.armoireEmpty': true,
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: { _id: 1 },
    limit: 250,
    // specify fields we are interested in to limit retrieved data
    // (empty if we're not reading data):
    fields: [],
  })
    .then(updateUsers)
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

const progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return null;
  }

  const userPromises = users.map(updateUser);
  const lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(() => {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count += 1;

  const set = { migration: migrationName, 'flags.armoireEmpty': false };

  dbUsers.update({ _id: user._id }, { $set: set });

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName} processed`);
}

function displayData () {
  console.warn(`\n${count} users processed\n`);
  return exiting(0);
}

function exiting (code, msg) {
  // 0 = success
  code = code || 0; // eslint-disable-line no-param-reassign
  if (code && !msg) {
    msg = 'ERROR!'; // eslint-disable-line no-param-reassign
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
  process.exit(code);
}

module.exports = processUsers;
