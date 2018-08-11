const migrationName = '20180811_inboxOutsideUser.js';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Move inbox messages from the user model to their own collection
 */

const monk = require('monk');
const nconf = require('nconf');

const Inbox = require('../website/server/models/message').inboxModel;
const connectionString = nconf.get('MIGRATION_CONNECT_STRING'); // FOR TEST DATABASE
const dbInboxes = monk(connectionString).get('inboxes', { castIds: false });
const dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  let query = {
    // migration: {$ne: migrationName},
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 100,
    fields: ['_id', 'inbox'],
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
    console.warn('All appropriate users and their tasks found and modified.');
    displayData();
    return;
  }

  let usersPromises = users.map(updateUser);
  let lastUser = users[users.length - 1];

  return Promise.all(usersPromises)
    .then(() => {
      return processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } being processed`);

  const oldInboxMessages = user.inbox.messages || {};
  const oldInboxMessagesIds = Object.keys(oldInboxMessages);

  const newInboxMessages = oldInboxMessagesIds.map(msgId => {
    const msg = oldInboxMessages[msgId];
    if (!msg || !msg.id) {
      console.log('missing message or message _id', msg);
      throw new Error('error!');
    }

    const newMsg = new Inbox(msg);
    newMsg.ownerId = user._id;
    return newMsg.toJSON();
  });

  return dbInboxes.insert(newInboxMessages)
    .then(() => {
      return dbUsers.update({_id: user._id}, {
        $set: {
          migration: migrationName,
          'inbox.messages': {},
        },
      });
    })
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
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
