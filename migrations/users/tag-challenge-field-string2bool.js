import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies

const migrationName = 'tag-challenge-field-string2bool.js';

const connectionString = 'mongodb://localhost:27017/habitica-dev?auto_reconnect=true'; // FOR TEST DATABASE

const dbUsers = monk(connectionString).get('users', { castIds: false });

const progressCount = 1000;
let count = 0;

export default async function processUsers () {
  const query = {
    migration: { $ne: migrationName },
    tags: {
      $elemMatch: {
        challenge: {
          $exists: true,
          $type: 'string',
        },
      },
    },
  };

  while (true) { // eslint-disable-line no-constant-condition
    // eslint-disable-next-line no-await-in-loop
    const users = await dbUsers.find(query, {
      sort: { _id: 1 },
      limit: 250,
    });

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

async function updateUser (user) {
  count += 1;

  const query = {
    _id: user._id,
  };
  let update = {
    $set: {
      'tags.$[element].challenge': true,
    },
  };
  let opts = {
    multi: true,
    arrayFilters: [{ 'element.challenge': 'true' }],
  };

  await dbUsers.update(query, update, opts);

  update = {
    $set: {
      'tags.$[element].challenge': false,
    },
  };
  opts = {
    multi: true,
    arrayFilters: [{ 'element.challenge': 'false' }],
  };

  dbUsers.update(query, update, opts);

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
}
