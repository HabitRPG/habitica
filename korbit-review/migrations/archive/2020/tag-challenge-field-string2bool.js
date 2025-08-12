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
      .select({ _id: 1, tags: 1 })
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

async function updateUser (user) {
  count += 1;
  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  let requiresUpdate = false;

  if (user && user.tags) {
    user.tags.forEach(tag => {
      if (tag && typeof tag.challenge === 'string') {
        requiresUpdate = true;
        if (tag.challenge === 'true') {
          tag.challenge = true;
        } else if (tag.challenge === 'false') {
          tag.challenge = false;
        } else {
          tag.challenge = null;
        }
      }
    });
  }

  if (requiresUpdate) {
    const set = {
      migration: MIGRATION_NAME,
      tags: user.tags,
    };
    return User.update({ _id: user._id }, { $set: set }).exec();
  }

  return null;
}
