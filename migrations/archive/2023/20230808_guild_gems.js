/* eslint-disable no-console */
import { model as User } from '../../../website/server/models/user';
import { model as Group } from '../../../website/server/models/group';

const MIGRATION_NAME = '20230808_guild_gems';

const guildsPerRun = 500;
const progressCount = 1000;
const guildsQuery = {
  migration: { $ne: MIGRATION_NAME }, // skip already migrated entries
  'type': 'guild',
};

let count = 0;
async function updateGroup (guild) {
  count++;

  const set = {
    migration: MIGRATION_NAME,
  };

  if (guild.balance > 0 && !guild.hasActiveGroupPlan()) {
    const leader = await User
      .findOne({ _id: guild.leader })
      .select({ _id: true })
      .exec();

    if (!leader) {
      return console.warn(`Leader not found for Guild ${guild._id}`);
    }

    await leader.updateOne({ $inc: { balance: guild.balance }}).exec();
    set.balance = 0;
  }

  if (count % progressCount === 0) {
    console.warn(`${count} ${guild._id}`);
  }

  return guild.updateOne({ $set: set }).exec();
}

export default async function processGroups () {
  const guildFields = {
    _id: 1,
    balance: 1,
    leader: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const foundGroups = await Group // eslint-disable-line no-await-in-loop
      .find(guildsQuery)
      .limit(guildsPerRun)
      .sort({ _id: 1 })
      .select(guildFields)
      .exec();

    if (foundGroups.length === 0) {
      console.warn('All appropriate Guilds found and modified.');
      console.warn(`\n${count} Guilds processed\n`);
      break;
    }

    await Promise.all(foundGroups.map(guild => updateGroup(guild))); // eslint-disable-line no-await-in-loop
  }
};
