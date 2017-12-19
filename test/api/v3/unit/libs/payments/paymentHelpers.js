import { model as User } from '../../../../../../website/server/models/user';

export async function createNonLeaderGroupMember (group) {
  let nonLeader = new User();
  nonLeader.guilds.push(group._id);
  return await nonLeader.save();
}
