/* eslint-disable no-console */
import { model as User } from '../website/server/models/user';

function processUsers (lastId) {
  let query = {
    'flags.verifiedUsername': true,
  };

  let fields = {
    'items.pets': 1,
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  return User.find(query)
    .limit(250)
    .sort({_id: 1})
    .select(fields)
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
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

  let set = {};

  if (user.items.pets['Bear-Veteran']) {
    set['items.pets.Fox-Veteran'] = 5;
  } else if (user.items.pets['Lion-Veteran']) {
    set['items.pets.Bear-Veteran'] = 5;
  } else if (user.items.pets['Tiger-Veteran']) {
    set['items.pets.Lion-Veteran'] = 5;
  } else if (user.items.pets['Wolf-Veteran']) {
    set['items.pets.Tiger-Veteran'] = 5;
  } else {
    set['items.pets.Wolf-Veteran'] = 5;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return User.update({_id: user._id}, {$set: set}).exec();
}

function displayData () {
  console.warn(`\n${count} users processed\n`);
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
    } else {
      console.log(msg);
    }
  }
  process.exit(code);
}

module.exports = processUsers;
