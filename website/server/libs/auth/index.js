import moment from 'moment';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../errors';
import * as passwordUtils from '../password';
import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../email';
import common from '../../../common';
import logger from '../logger';
import { decrypt } from '../encryption';
import { model as Group } from '../../models/group';
import {
  loginSocial,
  socialEmailToLocal,
} from './social';
import { loginRes } from './utils';
import { verifyUsername } from '../user/validation';

const USERNAME_LENGTH_MIN = 1;
const USERNAME_LENGTH_MAX = 20;

// When the user signed up after having been invited to a group,
// invite them automatically to the group
async function _handleGroupInvitation (user, invite) {
  // wrapping the code in a try because we don't want it to prevent the user from signing up
  // that's why errors are not translated
  try {
    const decryptedInvite = JSON.parse(decrypt(invite));
    let { inviter } = decryptedInvite;
    const { sentAt, id: groupId } = decryptedInvite;

    // check that the invite has not expired (after 7 days)
    if (sentAt && moment().subtract(7, 'days').isAfter(sentAt)) {
      const err = new Error('Invite expired.');
      err.privateData = invite;
      throw err;
    }

    const group = await Group.getGroup({
      user, optionalMembership: true, groupId, fields: 'name type',
    });
    if (!group) throw new NotFound('Group not found.');

    if (group.type === 'party') {
      user.invitations.party = { id: group._id, name: group.name, inviter };
      user.invitations.parties.push(user.invitations.party);
    } else {
      user.invitations.guilds.push({ id: group._id, name: group.name, inviter });
    }

    // award the inviter with 'Invited a Friend' achievement
    inviter = await User.findById(inviter);
    if (!inviter.achievements.invitedFriend) {
      inviter.achievements.invitedFriend = true;
      inviter.addNotification('INVITED_FRIEND_ACHIEVEMENT');
      await inviter.save();
    }
  } catch (err) {
    logger.error(err);
  }
}

function hasLocalAuth (user) {
  return user.auth.local.email && user.auth.local.hashed_password;
}

function hasBackupAuth (user, networkToRemove) {
  if (hasLocalAuth(user)) {
    return true;
  }

  const hasAlternateNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS
    .find(network => network.key !== networkToRemove && user.auth[network.key].id);

  return hasAlternateNetwork;
}

async function registerLocal (req, res, { isV3 = false }) {
  const existingUser = res.locals.user; // If adding local auth to social user

  req.checkBody({
    username: {
      notEmpty: true,
      errorMessage: res.t('missingUsername'),
      // TODO use the constants in the error message above
      isLength: { options: { min: USERNAME_LENGTH_MIN, max: USERNAME_LENGTH_MAX }, errorMessage: res.t('usernameIssueLength') },
      matches: { options: /^[-_a-zA-Z0-9]+$/, errorMessage: res.t('usernameIssueInvalidCharacters') },
    },
    email: {
      notEmpty: true,
      errorMessage: res.t('missingEmail'),
      isEmail: { errorMessage: res.t('notAnEmail') },
    },
    password: {
      notEmpty: true,

      errorMessage: res.t('missingPassword'),
      equals: { options: [req.body.confirmPassword], errorMessage: res.t('passwordConfirmationMatch') },
      isLength: {
        options: {
          min: common.constants.MINIMUM_PASSWORD_LENGTH,
          max: common.constants.MAXIMUM_PASSWORD_LENGTH,
        },
        errorMessage: res.t('passwordIssueLength'),
      },
    },
  });

  const validationErrors = req.validationErrors();
  if (validationErrors) throw validationErrors;

  const issues = verifyUsername(req.body.username, res);
  if (issues.length > 0) throw new BadRequest(issues.join(' '));

  let { email, username } = req.body;
  const { password } = req.body;

  // Get the lowercase version of username to check that we do not have duplicates
  // So we can search for it in the database and then reject the chosen
  // username if 1 or more results are found
  email = email.toLowerCase();
  username = username.trim();
  const lowerCaseUsername = username.toLowerCase();

  // Search for duplicates using lowercase version of username
  const user = await User.findOne({
    $or: [
      { 'auth.local.email': email },
      { 'auth.local.lowerCaseUsername': lowerCaseUsername },
    ],
  }, { 'auth.local': 1 }).exec();

  if (user) {
    if (existingUser) {
      if (email === user.auth.local.email && existingUser._id !== user._id) throw new NotAuthorized(res.t('emailTaken'));
      if (lowerCaseUsername === user.auth.local.lowerCaseUsername && existingUser._id !== user._id) throw new NotAuthorized(res.t('usernameTaken'));
    } else if (lowerCaseUsername === user.auth.local.lowerCaseUsername) {
      throw new NotAuthorized(res.t('usernameTaken'));
    } else {
      throw new NotAuthorized(res.t('emailTaken'));
    }
  }

  const hashed_password = await passwordUtils.bcryptHash(password); // eslint-disable-line camelcase
  let newUser = {
    auth: {
      local: {
        username,
        lowerCaseUsername,
        email,
        hashed_password, // eslint-disable-line camelcase,
        passwordHashMethod: 'bcrypt',
      },
    },
    preferences: {
      language: req.language,
    },
    flags: {
      verifiedUsername: true,
    },
  };

  if (existingUser) {
    const networks = common.constants.SUPPORTED_SOCIAL_NETWORKS;
    // need to insert FB here to allow users who only have FB auth to connect local auth.
    networks.push({ key: 'facebook', name: 'Facebook' });
    const hasSocialAuth = networks.find(network => {
      if (existingUser.auth.hasOwnProperty(network.key)) { // eslint-disable-line no-prototype-builtins, max-len
        return existingUser.auth[network.key].id;
      }
      return false;
    });
    if (!hasSocialAuth && existingUser.auth.local.hashed_password) throw new NotAuthorized(res.t('onlySocialAttachLocal'));
    existingUser.auth.local = newUser.auth.local;
    newUser = existingUser;
  } else {
    newUser = new User(newUser);
    newUser.registeredThrough = req.headers['x-client']; // Not saved, used to create the correct tasks based on the device used
  }

  // we check for partyInvite for backward compatibility
  if (req.query.groupInvite || req.query.partyInvite) {
    await _handleGroupInvitation(newUser, req.query.groupInvite || req.query.partyInvite);
  }

  const savedUser = await newUser.save();

  let userToJSON;
  if (isV3) {
    userToJSON = await savedUser.toJSONWithInbox();
  } else {
    userToJSON = savedUser.toJSON();
  }

  if (existingUser) {
    res.respond(200, userToJSON.auth.local); // We convert to toJSON to hide private fields
  } else {
    const userJSON = userToJSON;
    userJSON.newUser = true;
    res.respond(201, userJSON);
  }

  // Clean previous email preferences and send welcome email
  EmailUnsubscription
    .remove({ email: savedUser.auth.local.email })
    .then(() => {
      if (existingUser) return;
      if (newUser.registeredThrough === 'habitica-web') {
        sendTxnEmail(savedUser, 'welcome-v2b');
      } else {
        sendTxnEmail(savedUser, 'welcome');
      }
    })
    .catch(err => logger.error(err));

  if (!existingUser) {
    res.analytics.track('register', {
      category: 'acquisition',
      type: 'local',
      gaLabel: 'local',
      uuid: savedUser._id,
      headers: req.headers,
      user: savedUser,
    });
  }

  return null;
}

export {
  loginRes,
  hasBackupAuth,
  hasLocalAuth,
  loginSocial,
  registerLocal,
  socialEmailToLocal,
};
