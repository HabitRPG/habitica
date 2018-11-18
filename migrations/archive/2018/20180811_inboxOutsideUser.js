const migrationName = '20180811_inboxOutsideUser.js';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Move inbox messages from the user model to their own collection
 */

const monk = require('monk');
const nconf = require('nconf');
const uuid = require('uuid').v4;

const Inbox = require('../website/server/models/message').inboxModel;
const connectionString = nconf.get('MIGRATION_CONNECT_STRING'); // FOR TEST DATABASE
const dbInboxes = monk(connectionString).get('inboxes', { castIds: false });
const dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  let query = {
    migration: {$ne: migrationName},
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 1000,
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
let msgCount = 0;

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
  if (msgCount % progressCount === 0) console.warn(`${msgCount  } messages processed`);
  if (user._id === authorUuid) console.warn(`${authorName  } being processed`);

  const oldInboxMessages = user.inbox.messages || {};
  const oldInboxMessagesIds = Object.keys(oldInboxMessages);

  msgCount += oldInboxMessagesIds.length;

  const newInboxMessages = oldInboxMessagesIds.map(msgId => {
    const msg = oldInboxMessages[msgId];
    if (!msg || (!msg.id && !msg._id)) { // eslint-disable-line no-extra-parens
      console.log('missing message or message _id and id', msg);
      throw new Error('error!');
    }

    if (msg.id && !msg._id) msg._id = msg.id;
    if (msg._id && !msg.id) msg.id = msg._id;

    const newMsg = new Inbox(msg);
    newMsg.ownerId = user._id;
    return newMsg.toJSON();
  });

  const promises = newInboxMessages.map(newMsg => {
    return (async function fn () {
      const existing = await dbInboxes.find({_id: newMsg._id});

      if (existing.length > 0) {
        if (
          existing[0].ownerId === newMsg.ownerId &&
          existing[0].text === newMsg.text &&
          existing[0].uuid === newMsg.uuid &&
          existing[0].sent === newMsg.sent
        ) {
          return null;
        }

        newMsg.id = newMsg._id = uuid();
      }

      return newMsg;
    })();
  });

  return Promise.all(promises)
    .then((filteredNewMsg) => {
      filteredNewMsg = filteredNewMsg.filter(m => Boolean(m && m.id && m._id && m.id == m._id));
      return dbInboxes.insert(filteredNewMsg);
    }).then(() => {
      return dbUsers.update({_id: user._id}, {
        $set: {
          migration: migrationName,
          'inbox.messages': {},
        },
      });
    }).catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  console.warn(`\n${  msgCount  } messages processed\n`);
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
