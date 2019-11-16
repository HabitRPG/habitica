import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';

// @TODO: this should probably be a GroupManager library method
async function createGroup (name, privacy, type, leaderId) {
  const user = await User.findOne({ _id: leaderId });

  const group = new Group({
    name,
    privacy,
    type,
  });

  group.leader = user._id;
  user.guilds.push(group._id);

  return Promise.all([group.save(), user.save()]);
}

export default async function groupCreator () {
  const name = process.argv[2];
  const privacy = process.argv[3];
  const type = process.argv[4];
  const leaderId = process.argv[5];

  await createGroup(name, privacy, type, leaderId);
}
