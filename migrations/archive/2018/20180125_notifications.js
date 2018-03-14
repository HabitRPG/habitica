const UserNotification = require('../website/server/models/userNotification').model;
const content = require('../website/common/script/content/index');

const migrationName = '20180125_migrations-v2';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Migrate to new notifications system
 */

const monk = require('monk');
const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbUsers = monk(connectionString).get('users', { castIds: false });

const progressCount = 1000;
let count = 0;

function updateUser (user) {
  count++;

  const notifications = [];

  // UNALLOCATED_STATS_POINTS skipped because added on each save
  // NEW_STUFF skipped because it's a new type
  // GROUP_TASK_NEEDS_WORK because it's a new type
  // NEW_INBOX_MESSAGE not implemented yet


  // NEW_MYSTERY_ITEMS
  const mysteryItems = user.purchased && user.purchased.plan && user.purchased.plan.mysteryItems;
  if (Array.isArray(mysteryItems) && mysteryItems.length > 0) {
    const newMysteryNotif = new UserNotification({
      type: 'NEW_MYSTERY_ITEMS',
      data: {
        items: mysteryItems,
      },
    }).toJSON();
    notifications.push(newMysteryNotif);
  }

  // CARD_RECEIVED
  Object.keys(content.cardTypes).forEach(cardType => {
    const existingCards = user.items.special[`${cardType}Received`] || [];
    existingCards.forEach(sender => {
      const newNotif = new UserNotification({
        type: 'CARD_RECEIVED',
        data: {
          card: cardType,
          from: {
            // id is missing in old notifications
            name: sender,
          },
        },
      }).toJSON();

      notifications.push(newNotif);
    });
  });

  // NEW_CHAT_MESSAGE
  Object.keys(user.newMessages).forEach(groupId => {
    const existingNotif = user.newMessages[groupId];

    if (existingNotif) {
      const newNotif = new UserNotification({
        type: 'NEW_CHAT_MESSAGE',
        data: {
          group: {
            id: groupId,
            name: existingNotif.name,
          },
        },
      }).toJSON();

      notifications.push(newNotif);
    }
  });

  dbUsers.update({_id: user._id}, {
    $push: {notifications: { $each: notifications } },
    $set: {migration: migrationName},
  });

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
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

function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  const userPromises = users.map(updateUser);
  const lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(() => {
      processUsers(lastUser._id);
    });
}

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  const query = {
    migration: {$ne: migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2010-01-24')},
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
  })
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

module.exports = processUsers;
