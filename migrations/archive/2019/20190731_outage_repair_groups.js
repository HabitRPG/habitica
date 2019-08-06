/* eslint-disable no-console */
const MIGRATION_NAME = '20190731_outage_repair_groups';
import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';
import forEach from 'lodash/forEach';

const progressCount = 1000;
let count = 0;

async function updateGroup (group) {
  count++;

  const set = {};

  if (group.type === 'guild') {
    set.memberCount = await User.countDocuments({guilds: group._id});
  } else {
    set.memberCount = await User.countDocuments({party._id: group._id});
  }

  if (group.quest && group.quest.key && group.quest.members) {
    forEach(group.quest.members, async (status, memberId) => {
      if (status === null) {
        await User.update({_id: memberId, {$set: {
          'party.quest.key': group.quest.key,
          'party.quest.RSVPNeeded': true,
        }}});
      } else if (status === true) {
        await User.update({_id: memberId, {$set: {
          'party.quest.key': group.quest.key,
          'party.quest.RSVPNeeded': false,
        }}});
      } else {
        await User.update({_id: memberId, {$set: {
          'party.quest.RSVPNeeded': false,
        }}});
      }
    });
  }

  if (group.leader) {
    const leaderTrouble = await User.find({_id: group.leader, $or:[{'party._id': group._id}, {guilds: group._id}]});

    if (leaderTrouble === null) console.log(`Group leadership problem: user ${group.leader} not in group ${group._id}`);
  }

  if (count % progressCount === 0) console.warn(`${count} ${group._id}`);

  return await Group.update({_id: group._id}, {$set: set}).exec();
}

module.exports = async function processGroups () {
  let query = {};

  const fields = {
    _id: 1,
    type: 1,
    quest: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const groups = await Group // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .lean()
      .exec();

    if (groups.length === 0) {
      console.warn('All appropriate groups found and modified.');
      console.warn(`\n${count} groups processed\n`);
      break;
    } else {
      query._id = {
        $gt: groups[groups.length - 1]._id,
      };
    }

    await Promise.all(groups.map(updateGroup)); // eslint-disable-line no-await-in-loop
  }
};
