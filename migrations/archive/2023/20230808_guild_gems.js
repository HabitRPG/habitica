/* eslint-disable no-console */
import { model as User } from '../../../website/server/models/user';
import { model as Group } from '../../../website/server/models/group';

const guildsPerRun = 500;
const progressCount = 1000;
const guildsQuery = {
  type: 'guild',
};

let count = 0;
async function updateGroup (guild) {
  count++;
  if (count % progressCount === 0) {
    console.warn(`${count} ${guild._id}`);
  }

  if (guild.hasActiveGroupPlan()) {
    return console.warn(`Guild ${guild._id} is active Group Plan`);
  }

  const leader = await User
    .findOne({ _id: guild.leader })
    .select({ _id: true })
    .exec();

  if (!leader) {
    return console.warn(`Leader not found for Guild ${guild._id}`);
  }

  if (guild.balance > 0) {
    await leader.updateBalance(
      guild.balance,
      'create_guild',
      '',
      `Guild Bank refund for ${guild.name} (${guild._id})`,
    );
  }

  return guild.updateOne({ $set: { balance: 0 } }).exec();
}

export default async function processGroups () {
  const guildFields = {
    _id: 1,
    balance: 1,
    leader: 1,
    name: 1,
    purchased: 1,
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
    } else {
      guildsQuery._id = {
        $gt: foundGroups[foundGroups.length - 1],
      };
    }

    await Promise.all(foundGroups.map(guild => updateGroup(guild))); // eslint-disable-line no-await-in-loop
  }
};
