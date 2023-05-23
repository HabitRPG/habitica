import _ from 'lodash';

import { encrypt } from '../encryption';
import { sendNotification as sendPushNotification } from '../pushNotifications';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../errors';
import { sendTxn as sendTxnEmail } from '../email';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import {
  model as User,
} from '../../models/user';
import {
  model as Group,
} from '../../models/group';

function sendInvitePushNotification (userToInvite, groupLabel, group, publicGuild, res) {
  if (userToInvite.preferences.pushNotifications[`invited${groupLabel}`] === false) return;

  const identifier = group.type === 'guild' ? 'invitedGuild' : 'invitedParty';

  sendPushNotification(
    userToInvite,
    {
      title: group.name,
      message: res.t(identifier, userToInvite.preferences.language),
      identifier,
      payload: { groupID: group._id, publicGuild },
    },
  );
}

function sendInviteEmail (userToInvite, groupLabel, group, inviter) {
  if (userToInvite.preferences.emailNotifications[`invited${groupLabel}`] === false) return;
  const groupTemplate = group.type === 'guild' ? 'guild' : 'party';

  const emailVars = [
    { name: 'INVITER', content: inviter.profile.name },
  ];

  if (group.type === 'guild') {
    emailVars.push(
      { name: 'GUILD_NAME', content: group.name },
      { name: 'GUILD_URL', content: '/groups/discovery' },
    );
  } else {
    emailVars.push(
      { name: 'PARTY_NAME', content: group.name },
      { name: 'PARTY_URL', content: '/party' },
    );
  }

  sendTxnEmail(userToInvite, `invited-${groupTemplate}`, emailVars);
}

function inviteUserToGuild (userToInvite, group, inviter, publicGuild, res) {
  const uuid = userToInvite._id;

  if (_.includes(userToInvite.guilds, group._id)) {
    throw new NotAuthorized(res.t('userAlreadyInGroup', { userId: uuid, username: userToInvite.profile.name }));
  }

  if (_.find(userToInvite.invitations.guilds, { id: group._id })) {
    throw new NotAuthorized(res.t('userAlreadyInvitedToGroup', { userId: uuid, username: userToInvite.profile.name }));
  }

  const guildInvite = {
    id: group._id,
    name: group.name,
    inviter: inviter._id,
    publicGuild,
  };

  if (group.hasActiveGroupPlan() && !group.hasNotCancelled()) guildInvite.cancelledPlan = true;

  userToInvite.invitations.guilds.push(guildInvite);
}

async function inviteUserToParty (userToInvite, group, inviter, res) {
  const uuid = userToInvite._id;

  // Do not add to invitations.parties array if the user is already invited to that party
  if (_.find(userToInvite.invitations.parties, { id: group._id })) {
    throw new NotAuthorized(res.t('userAlreadyPendingInvitation', { userId: uuid, username: userToInvite.profile.name }));
  }

  if (userToInvite.party._id) {
    const userParty = await Group.getGroup({ user: userToInvite, groupId: 'party', fields: '_id' });

    if (userParty) throw new NotAuthorized(res.t('userAlreadyInAParty', { userId: uuid, username: userToInvite.profile.name }));
  }

  const partyInvite = { id: group._id, name: group.name, inviter: inviter._id };
  if (group.hasActiveGroupPlan() && !group.hasNotCancelled()) partyInvite.cancelledPlan = true;

  userToInvite.invitations.parties.push(partyInvite);
  userToInvite.invitations.party = partyInvite;
}

async function addInvitationToUser (userToInvite, group, inviter, res) {
  const publicGuild = group.type === 'guild' && group.privacy === 'public';

  if (group.type === 'guild') {
    inviteUserToGuild(userToInvite, group, inviter, publicGuild, res);
  } else if (group.type === 'party') {
    await inviteUserToParty(userToInvite, group, inviter, res);
  }

  const groupLabel = group.type === 'guild' ? 'Guild' : 'Party';
  sendInviteEmail(userToInvite, groupLabel, group, inviter);
  sendInvitePushNotification(userToInvite, groupLabel, group, publicGuild, res);

  const userInvited = await userToInvite.save();
  if (group.type === 'guild') {
    return userInvited.invitations.guilds[userToInvite.invitations.guilds.length - 1];
  }

  if (group.type === 'party') {
    return userInvited.invitations.parties[userToInvite.invitations.parties.length - 1];
  }

  throw new Error('Invalid group type');
}

async function inviteByUUID (uuid, group, inviter, req, res) {
  const userToInvite = await User.findById(uuid).exec();

  if (!userToInvite) {
    throw new NotFound(res.t('userWithIDNotFound', { userId: uuid }));
  } else if (inviter._id === userToInvite._id) {
    throw new BadRequest(res.t('cannotInviteSelfToGroup'));
  }

  const objections = inviter.getObjectionsToInteraction('group-invitation', userToInvite);
  if (objections.length > 0) {
    throw new NotAuthorized(res.t(
      objections[0],
      { userId: uuid, username: userToInvite.profile.name },
    ));
  }

  const analyticsObject = {
    hitType: 'event',
    category: 'behavior',
    uuid: inviter._id,
    invitee: uuid,
    groupId: group._id,
    groupType: group.type,
    headers: req.headers,
  };

  if (group.type === 'party') {
    analyticsObject.seekingParty = Boolean(userToInvite.party.seeking);
  }

  res.analytics.track('group invite', analyticsObject);

  return addInvitationToUser(userToInvite, group, inviter, res);
}

async function inviteByEmail (invite, group, inviter, req, res) {
  let userReturnInfo;

  if (!invite.email) throw new BadRequest(res.t('inviteMissingEmail'));

  const userToContact = await User.findOne({
    $or: [
      { 'auth.local.email': invite.email },
      { 'auth.facebook.emails.value': invite.email },
      { 'auth.google.emails.value': invite.email },
      { 'auth.apple.emails.value': invite.email },
    ],
  })
    .select({ _id: true, 'preferences.emailNotifications': true })
    .exec();

  if (userToContact) {
    userReturnInfo = await inviteByUUID(userToContact._id, group, inviter, req, res);
  } else {
    userReturnInfo = invite.email;

    const cancelledPlan = group.hasActiveGroupPlan() && !group.hasNotCancelled();
    const groupQueryString = JSON.stringify({
      id: group._id,
      inviter: inviter._id,
      publicGuild: group.type === 'guild' && group.privacy === 'public',
      sentAt: Date.now(), // so we can let it expire
      cancelledPlan,
    });
    const link = `/static/home?groupInvite=${encrypt(groupQueryString)}`;

    const variables = [
      { name: 'LINK', content: link },
      { name: 'INVITER', content: req.body.inviter || inviter.profile.name },
    ];

    if (group.type === 'guild') {
      variables.push({ name: 'GUILD_NAME', content: group.name });
    }

    // Check for the email address not to be unsubscribed
    const userIsUnsubscribed = await EmailUnsubscription.findOne({ email: invite.email }).exec();
    const groupLabel = group.type === 'guild' ? '-guild' : '';
    if (!userIsUnsubscribed) sendTxnEmail(invite, `invite-friend${groupLabel}`, variables);

    const analyticsObject = {
      hitType: 'event',
      category: 'behavior',
      uuid: inviter._id,
      invitee: 'email',
      groupId: group._id,
      groupType: group.type,
      headers: req.headers,
    };

    res.analytics.track('group invite', analyticsObject);
  }

  return userReturnInfo;
}

async function inviteByUserName (username, group, inviter, req, res) {
  if (username.indexOf('@') === 0) username = username.slice(1, username.length); // eslint-disable-line no-param-reassign
  username = username.toLowerCase(); // eslint-disable-line no-param-reassign
  const userToInvite = await User.findOne({ 'auth.local.lowerCaseUsername': username }).exec();

  if (!userToInvite) {
    throw new NotFound(res.t('userWithUsernameNotFound', { username }));
  }

  if (inviter._id === userToInvite._id) {
    throw new BadRequest(res.t('cannotInviteSelfToGroup'));
  }

  const objections = inviter.getObjectionsToInteraction('group-invitation', userToInvite);
  if (objections.length > 0) {
    throw new NotAuthorized(res.t(
      objections[0],
      { userId: userToInvite._id, username: userToInvite.profile.name },
    ));
  }

  const analyticsObject = {
    hitType: 'event',
    category: 'behavior',
    uuid: inviter._id,
    invitee: userToInvite._id,
    groupId: group._id,
    groupType: group.type,
    headers: req.headers,
  };

  if (group.type === 'party') {
    analyticsObject.seekingParty = Boolean(userToInvite.party.seeking);
  }

  res.analytics.track('group invite', analyticsObject);

  return addInvitationToUser(userToInvite, group, inviter, res);
}

export {
  inviteByUUID,
  inviteByEmail,
  inviteByUserName,
};
