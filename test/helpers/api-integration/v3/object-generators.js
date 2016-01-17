import {
  times,
} from 'lodash';
import Q from 'q';
import { v4 as generateUUID } from 'uuid';
import { ApiUser, ApiGroup } from '../api-classes';
import { requester } from '../requester';

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

  let members = await Q.all(
    times(numberOfMembers, async () => {
      let user = await generateUser();

      if (group.type === 'party') {
        await user.update({ 'party._id': group._id});
      } else {
        await user.update({ guilds: [group._id] });
      }

      return user;
    })
  );

  group.update({ memberCount: numberOfMembers + 1});

  let invitees = await Q.all(
    times(numberOfInvites, () => {
      return generateUser();
    })
  );

  let invitationPromises = invitees.map((invitee) => {
    return groupLeader.post(`/groups/${group._id}/invite`, {
      uuids: [invitee._id],
    });
  });

  await Q.all(invitationPromises);

  return {
    groupLeader,
    group,
    members,
    invitees,
  };
}
