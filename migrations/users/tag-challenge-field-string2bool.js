import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = 'tag-challenge-field-string2bool';

const progressCount = 1000;
let count = 0;

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
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
    const users = await User.find(query)
      .sort({ _id: 1 })
      .limit(250)
      .select({ _id: 1 })
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

/*
db.users.update({ "auth.local.username": "satou2"}, { $set: { "tags.7.challenge": "true" }})
db.users.updateOne({
  _id: 'bd95ca4c-8db2-4e8d-8492-b83746b90993'
}, {
  $set: {
      'tags.$[element].challenge': true,
    }
}, {
  arrayFilters: [{ 'element.challenge': 'true' }]
})
*/
async function updateUser (user) {
  count += 1;

  const query = {
    _id: user._id,
  };

  const update = {
    $set: {
      'tags.$[element].challenge': true,
    },
  };

  const opts = {
    arrayFilters: [{ 'element.challenge': 'true' }],
  };

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return User.updateOne(query, update, opts).exec();
}
