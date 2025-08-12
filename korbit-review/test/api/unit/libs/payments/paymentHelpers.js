import { model as User } from '../../../../../website/server/models/user';

export async function createNonLeaderGroupMember (group) { // eslint-disable-line import/prefer-default-export, max-len
  const nonLeader = new User();
  nonLeader.guilds.push(group._id);
  return nonLeader.save();
}
