/* eslint-disable no-console */
const MIGRATION_NAME = '20190716_groups_fix';

import monk from 'monk';
import nconf from 'nconf';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');
let backupUsers = monk(CONNECTION_STRING).get('users', { castIds: false });
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set = { migration: MIGRATION_NAME };
  let addToSet;

  backupUsers.findOne(
    { _id: user._id },
    { fields: { party: 1, guilds: 1 }}
  ).then((backupUser) => {
    if (!user.party._id) {
      set.party = backupUser.party;
    }
    addToSet = { guilds: { $each: backupUser.guilds }};
  });

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set, $addToSet: addToSet }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2019-07-17')},
  };

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
