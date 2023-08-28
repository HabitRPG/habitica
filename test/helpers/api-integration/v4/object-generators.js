import {
  times,
} from 'lodash';
import { v4 as generateUUID } from 'uuid';
import { ApiUser, ApiGroup, ApiChallenge } from '../api-classes';
import { requester } from '../requester';
import * as Tasks from '../../../../website/server/models/task';
import payments from '../../../../website/server/libs/payments/payments';
import { model as User } from '../../../../website/server/models/user';

// Creates a new user and returns it
// If you need the user to have specific requirements,
// such as a balance > 0, just pass in the adjustment
// to the update object. If you want to adjust a nested
// parameter, such as the number of wolf eggs the user has,
// , you can do so by passing in the full path as a string:
// { 'items.eggs.Wolf': 10 }
export async function generateUser (update = {}) {
  const username = (Date.now() + generateUUID()).substring(0, 20);
  const password = 'password';
  const email = `${username}@example.com`;

  const user = await requester().post('/user/auth/local/register', {
    username,
    email,
    password,
    confirmPassword: password,
  });

  const apiUser = new ApiUser(user);

  await apiUser.update(update);

  return apiUser;
}

export async function generateHabit (update = {}) {
  const type = 'habit';
  const task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateDaily (update = {}) {
  const type = 'daily';
  const task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateReward (update = {}) {
  const type = 'reward';
  const task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateTodo (update = {}) {
  const type = 'todo';
  const task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

// Generates a new group. Requires a user object, which
// will will become the groups leader. Takes a details argument
// for the initial group creation and an update argument which
// will update the group via the db
export async function generateGroup (leader, details = {}, update = {}) {
  details.type = details.type || 'party';
  details.privacy = details.privacy || 'private';
  details.name = details.name || 'test group';

  const group = await leader.post('/groups', details);
  const apiGroup = new ApiGroup(group);

  await apiGroup.update(update);

  return apiGroup;
}

async function _upgradeToGroupPlan (groupLeader, group) {
  const groupLeaderModel = await User.findById(groupLeader._id).exec();

  // Create subscription
  const paymentData = {
    user: groupLeaderModel,
    groupId: group._id,
    sub: {
      key: 'basic_3mo',
    },
    customerId: 'customer-id',
    paymentMethod: 'Payment Method',
    headers: {
      'x-client': 'habitica-web',
      'user-agent': '',
    },
  };
  await payments.createSubscription(paymentData);
}

// This is generate group + the ability to create
// real users to populate it. The settings object
// takes in:
// members: Number - the number of group members to create.
// Defaults to 0. Does not include group leader.
// inivtes: Number - the number of users to create and invite to the group. Defaults to 0.
// groupDetails: Object - how to initialize the group
// leaderDetails: Object - defaults for the leader, defaults with a gem balance so the user
// can create the group
//
// Returns an object with
// members: an array of user objects that correspond to the members of the group
// invitees: an array of user objects that correspond to the invitees of the group
// leader: the leader user object
// group: the group object
export async function createAndPopulateGroup (settings = {}) {
  const numberOfMembers = settings.members || 0;
  const numberOfInvites = settings.invites || 0;
  const upgradeToGroupPlan = settings.upgradeToGroupPlan || false;
  const { groupDetails } = settings;
  const leaderDetails = settings.leaderDetails || { balance: 10 };
  if (upgradeToGroupPlan) {
    leaderDetails.permissions = { fullAccess: true };
  }

  const groupLeader = await generateUser(leaderDetails);
  const group = await generateGroup(groupLeader, groupDetails);

  const groupMembershipTypes = {
    party: { 'party._id': group._id },
    guild: { guilds: [group._id] },
  };

  const members = await Promise.all(
    times(numberOfMembers, () => generateUser(groupMembershipTypes[group.type])),
  );

  await group.update({ memberCount: numberOfMembers + 1 });

  const invitees = await Promise.all(
    times(numberOfInvites, () => generateUser()),
  );

  const invitationPromises = invitees.map(invitee => groupLeader.post(`/groups/${group._id}/invite`, {
    uuids: [invitee._id],
  }));

  await Promise.all(invitationPromises);

  await Promise.all(invitees.map(invitee => invitee.sync()));

  if (upgradeToGroupPlan) {
    await _upgradeToGroupPlan(groupLeader, group);
  }

  return {
    groupLeader,
    group,
    members,
    invitees,
  };
}

// Generates a new challenge. Requires an ApiUser object and a
// group-like object (can just be {_id: 'your-group-id'}). The group
// will will become the group that owns the challenge. It takes an
// optional details argument for the initial challenge creation and an
// optional update argument which will update the challenge via the db
export async function generateChallenge (challengeCreator, group, details = {}, update = {}) {
  details.group = group._id;
  details.name = details.name || 'a challenge';
  details.shortName = details.shortName || 'aChallenge';
  details.prize = details.prize || 0;
  details.official = details.official || false;

  const challenge = await challengeCreator.post('/challenges', details);
  const apiChallenge = new ApiChallenge(challenge);

  await apiChallenge.update(update);

  return apiChallenge;
}
