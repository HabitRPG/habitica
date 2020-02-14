/* eslint-disable no-console */
const MIGRATION_NAME = '20190716_groups_fix';

import monk from 'monk';
import nconf from 'nconf';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;
let backupUsers;

async function updateUser (user) {
  count++;

  let set = { migration: MIGRATION_NAME };
  let addToSet;

  const monkPromise = new Promise((resolve, reject) => {
     backupUsers.findOne(
      { _id: user._id },
      { fields: { _id: 1, party: 1, guilds: 1 }},
    ).then(foundUserInBackup => {
      resolve(foundUserInBackup);
    }).catch(e => {
      reject(e);
    })
  });
  let backupUser = await monkPromise;
  if (!backupUser) return;

  if (!user.party._id) {
    set.party = backupUser.party;
  }
  addToSet = { guilds: { $each: backupUser.guilds }};

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return User.update({ _id: user._id }, { $set: set, $addToSet: addToSet }).exec();
}

module.exports = async function processUsers () {
  const query = {
    'auth.timestamps.loggedin': {$gt: new Date('2019-07-15')},
  };

  let backupDb = monk(CONNECTION_STRING);
  const backupDbPromise = new Promise((resolve, reject) => {
    backupDb.then(() => resolve()).catch((e) => reject(e));
  });

  await backupDbPromise;
  console.log('Connected to backup db');
  backupUsers = backupDb.get('users', { castIds: false });

  const fields = {
    _id: 1,
    party: 1,
    guilds: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
