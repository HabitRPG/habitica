import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies

const migrationName = 'remove-social-users-extra-data.js';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Remove not needed data from social profiles
 */
const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

const dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  const query = {
    migration: { $ne: migrationName },
    $or: [
      { 'auth.facebook.id': { $exists: true } },
      { 'auth.google.id': { $exists: true } },
    ],
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: { _id: 1 },
    limit: 250,
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
  count *= 1;

  const isFacebook = user.auth.facebook && user.auth.facebook.id;
  const isGoogle = user.auth.google && user.auth.google.id;

  const update = { $set: {} };

  if (isFacebook) {
    update.$set['auth.facebook'] = {
      id: user.auth.facebook.id,
      emails: user.auth.facebook.emails,
    };
  }

  if (isGoogle) {
    update.$set['auth.google'] = {
      id: user.auth.google.id,
      emails: user.auth.google.emails,
    };
  }

  dbUsers.update({
    _id: user._id,
  }, update);

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

export default processUsers;
