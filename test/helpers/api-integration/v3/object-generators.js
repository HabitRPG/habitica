import {
  times,
} from 'lodash';
import Bluebird from 'bluebird';
import { v4 as generateUUID } from 'uuid';
import { ApiUser, ApiGroup, ApiChallenge } from '../api-classes';
import { requester } from '../requester';
import * as Tasks from '../../../../website/server/models/task';

// Creates a new user and returns it
// If you need the user to have specific requirements,
// such as a balance > 0, just pass in the adjustment
// to the update object. If you want to adjust a nested
// paramter, such as the number of wolf eggs the user has,
// , you can do so by passing in the full path as a string:
// { 'items.eggs.Wolf': 10 }
export async function generateUser (update = {}) {
  let username = generateUUID();
  let password = 'password';
  let email = `${username}@example.com`;

  let user = await requester().post('/user/auth/local/register', {
    username,
    email,
    password,
    confirmPassword: password,
  });

  let apiUser = new ApiUser(user);

  await apiUser.update(update);

  return apiUser;
}

export async function generateHabit (update = {}) {
  let type = 'habit';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateDaily (update = {}) {
  let type = 'daily';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateReward (update = {}) {
  let type = 'reward';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateTodo (update = {}) {
  let type = 'todo';
  let task = new Tasks[type](update);
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

  let group = await leader.post('/groups', details);
  let apiGroup = new ApiGroup(group);

  await apiGroup.update(update);

  return apiGroup;
}

// This is generate group + the ability to create
// real users to populate it. The settings object
// takes in:
// members: Number - the number of group members to create. Defaults to 0.
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
  let numberOfMembers = settings.members || 0;
  let numberOfInvites = settings.invites || 0;
  let groupDetails = settings.groupDetails;
  let leaderDetails = settings.leaderDetails || { balance: 10 };

  let groupLeader = await generateUser(leaderDetails);
  let group = await generateGroup(groupLeader, groupDetails);

  const groupMembershipTypes = {
    party: { 'party._id': group._id},
    guild: { guilds: [group._id] },
  };

  let members = await Bluebird.all(
    times(numberOfMembers, () => {
      return generateUser(groupMembershipTypes[group.type]);
    })
  );

  await group.update({ memberCount: numberOfMembers + 1});

  let invitees = await Bluebird.all(
    times(numberOfInvites, () => {
      return generateUser();
    })
  );

  let invitationPromises = invitees.map((invitee) => {
    return groupLeader.post(`/groups/${group._id}/invite`, {
      uuids: [invitee._id],
    });
  });

  await Bluebird.all(invitationPromises);

  await Bluebird.map(invitees, (invitee) => invitee.sync());

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

  let challenge = await challengeCreator.post('/challenges', details);
  let apiChallenge = new ApiChallenge(challenge);

  await apiChallenge.update(update);

  return apiChallenge;
}
