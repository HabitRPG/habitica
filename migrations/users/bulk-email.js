/* eslint-disable no-console */
import moment from 'moment';
import nconf from 'nconf';
import { sendTxn } from '../../website/server/libs/email';
import { model as User } from '../../website/server/models/user';

const BASE_URL = nconf.get('BASE_URL');
const EMAIL_SLUG = 'mandrill-email-slug'; // Set email template to send
const MIGRATION_NAME = 'bulk-email';

const progressCount = 250;
let count = 0;

async function updateUser (user) {
  count += 1;

  if (count % progressCount === 0) {
    console.warn(`${count} ${user._id}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  await sendTxn(
    user,
    EMAIL_SLUG,
    [{ name: 'BASE_URL', content: BASE_URL }], // Add variables from template
  );

  return User.update({ _id: user._id }, { $set: { migration: MIGRATION_NAME } }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: moment().subtract(2, 'weeks').toDate() }, // customize or remove to target different populations
  };

  const fields = {
    _id: 1,
    auth: 1,
    preferences: 1,
    profile: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
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
}
