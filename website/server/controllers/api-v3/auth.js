import validator from 'validator';
import moment from 'moment';
import passport from 'passport';
import nconf from 'nconf';
import {
  authWithHeaders,
} from '../../middlewares/auth';
import {
  NotAuthorized,
  BadRequest,
  NotFound,
} from '../../libs/errors';
import * as passwordUtils from '../../libs/password';
import logger from '../../libs/logger';
import { model as User } from '../../models/user';
import { model as Group } from '../../models/group';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../../libs/email';
import { decrypt } from '../../libs/encryption';
import { send as sendEmail } from '../../libs/email';
import pusher from '../../libs/pusher';
import common from '../../../common';

let api = {};

// When the user signed up after having been invited to a group, invite them automatically to the group
async function _handleGroupInvitation (user, invite) {
  // wrapping the code in a try because we don't want it to prevent the user from signing up
  // that's why errors are not translated
  try {
    let {sentAt, id: groupId, inviter} = JSON.parse(decrypt(invite));

    // check that the invite has not expired (after 7 days)
    if (sentAt && moment().subtract(7, 'days').isAfter(sentAt)) {
      let err = new Error('Invite expired.');
      err.privateData = invite;
      throw err;
    }

    let group = await Group.getGroup({user, optionalMembership: true, groupId, fields: 'name type'});
    if (!group) throw new NotFound('Group not found.');

    if (group.type === 'party') {
      user.invitations.party = {id: group._id, name: group.name, inviter};
    } else {
      user.invitations.guilds.push({id: group._id, name: group.name, inviter});
    }
  } catch (err) {
    logger.error(err);
  }
}

function hasBackupAuth (user, networkToRemove) {
  if (user.auth.local.username) {
    return true;
  }

  let hasAlternateNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find((network) => {
    return network.key !== networkToRemove && user.auth[network.key].id;
  });

  return hasAlternateNetwork;
}

/**
 * @api {post} /api/v3/user/auth/local/register Register
 * @apiDescription Register a new user with email, username and password or attach local auth to a social user
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam {String} username Body parameter - Username of the new user
 * @apiParam {String} email Body parameter - Email address of the new user
 * @apiParam {String} password Body parameter - Password for the new user
 * @apiParam {String} confirmPassword Body parameter - Password confirmation
 *
 * @apiSuccess {Object} data The user object, if local auth was just attached to a social user then only user.auth.local
 */
api.registerLocal = {
  method: 'POST',
  middlewares: [authWithHeaders(true)],
  url: '/user/auth/local/register',
  async handler (req, res) {
    let existingUser = res.locals.user; // If adding local auth to social user

    req.checkBody({
      email: {
        notEmpty: {errorMessage: res.t('missingEmail')},
        isEmail: {errorMessage: res.t('notAnEmail')},
      },
      username: {notEmpty: {errorMessage: res.t('missingUsername')}},
      password: {
        notEmpty: {errorMessage: res.t('missingPassword')},
        equals: {options: [req.body.confirmPassword], errorMessage: res.t('passwordConfirmationMatch')},
      },
    });
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let { email, username, password } = req.body;

    // Get the lowercase version of username to check that we do not have duplicates
    // So we can search for it in the database and then reject the choosen username if 1 or more results are found
    email = email.toLowerCase();
    let lowerCaseUsername = username.toLowerCase();

    // Search for duplicates using lowercase version of username
    let user = await User.findOne({$or: [
      {'auth.local.email': email},
      {'auth.local.lowerCaseUsername': lowerCaseUsername},
    ]}, {'auth.local': 1}).exec();

    if (user) {
      if (email === user.auth.local.email) throw new NotAuthorized(res.t('emailTaken'));
      // Check that the lowercase username isn't already used
      if (lowerCaseUsername === user.auth.local.lowerCaseUsername) throw new NotAuthorized(res.t('usernameTaken'));
    }

    let salt = passwordUtils.makeSalt();
    let hashed_password = passwordUtils.encrypt(password, salt); // eslint-disable-line camelcase
    let newUser = {
      auth: {
        local: {
          username,
          lowerCaseUsername,
          email,
          salt,
          hashed_password, // eslint-disable-line camelcase
        },
      },
      preferences: {
        language: req.language,
      },
    };

    if (existingUser) {
      let hasSocialAuth = common.constants.SUPPORTED_SOCIAL_NETWORKS.find(network => {
        if (existingUser.auth.hasOwnProperty(network.key)) {
          return existingUser.auth[network.key].id;
        }
      });
      if (!hasSocialAuth) throw new NotAuthorized(res.t('onlySocialAttachLocal'));
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

    let savedUser = await newUser.save();

    if (existingUser) {
      res.respond(200, savedUser.toJSON().auth.local); // We convert to toJSON to hide private fields
    } else {
      res.respond(201, savedUser);
    }

    // Clean previous email preferences and send welcome email
    EmailUnsubscription
      .remove({email: savedUser.auth.local.email})
      .then(() => {
        if (!existingUser) sendTxnEmail(savedUser, 'welcome');
      });

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
  },
};

function _loginRes (user, req, res) {
  if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {userId: user._id}));
  return res.respond(200, {id: user._id, apiToken: user.apiToken, newUser: user.newUser || false});
}

/**
 * @api {post} /api/v3/user/auth/local/login Login
 * @apiDescription Login a user with email / username and password
 * @apiName UserLoginLocal
 * @apiGroup User
 *
 * @apiParam {String} username Body parameter - Username or email of the user
 * @apiParam {String} password Body parameter - The user's password
 *
 * @apiSuccess {String} data._id The user's unique identifier
 * @apiSuccess {String} data.apiToken The user's api token that must be used to authenticate requests.
 * @apiSuccess {Boolean} data.newUser Returns true if the user was just created (always false for local login).
 */
api.loginLocal = {
  method: 'POST',
  url: '/user/auth/local/login',
  middlewares: [],
  async handler (req, res) {
    req.checkBody({
      username: {
        notEmpty: true,
        errorMessage: res.t('missingUsernameEmail'),
      },
      password: {
        notEmpty: true,
        errorMessage: res.t('missingPassword'),
      },
    });
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    req.sanitizeBody('username').trim();
    req.sanitizeBody('password').trim();

    let login;
    let username = req.body.username;

    if (validator.isEmail(username)) {
      login = {'auth.local.email': username.toLowerCase()}; // Emails are stored lowercase
    } else {
      login = {'auth.local.username': username};
    }

    let user = await User.findOne(login, {auth: 1, apiToken: 1}).exec();
    let isValidPassword = user && user.auth.local.hashed_password === passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (!isValidPassword) throw new NotAuthorized(res.t('invalidLoginCredentialsLong'));

    res.analytics.track('login', {
      category: 'behaviour',
      type: 'local',
      gaLabel: 'local',
      uuid: user._id,
      headers: req.headers,
    });

    return _loginRes(user, ...arguments);
  },
};

function _passportProfile (network, accessToken) {
  return new Promise((resolve, reject) => {
    passport._strategies[network].userProfile(accessToken, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        resolve(profile);
      }
    });
  });
}

// Called as a callback by Facebook (or other social providers). Internal route
api.loginSocial = {
  method: 'POST',
  middlewares: [authWithHeaders(true)],
  url: '/user/auth/social', // this isn't the most appropriate url but must be the same as v2
  async handler (req, res) {
    let existingUser = res.locals.user;
    let accessToken = req.body.authResponse.access_token;
    let network = req.body.network;

    let isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find(supportedNetwork => {
      return supportedNetwork.key === network;
    });
    if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));

    let profile = await _passportProfile(network, accessToken);

    let user = await User.findOne({
      [`auth.${network}.id`]: profile.id,
    }, {_id: 1, apiToken: 1, auth: 1}).exec();

    // User already signed up
    if (user) {
      _loginRes(user, ...arguments);
    } else { // Create new user
      user = {
        auth: {
          [network]: profile,
        },
        preferences: {
          language: req.language,
        },
      };
      if (existingUser) {
        existingUser.auth[network] = user.auth[network];
        user = existingUser;
      } else {
        user = new User(user);
        user.registeredThrough = req.headers['x-client']; // Not saved, used to create the correct tasks based on the device used
      }

      let savedUser = await user.save();

      if (!existingUser) {
        user.newUser = true;
      }
      _loginRes(user, ...arguments);

      // Clean previous email preferences
      if (savedUser.auth[network].emails && savedUser.auth[network].emails[0] && savedUser.auth[network].emails[0].value) {
        EmailUnsubscription
        .remove({email: savedUser.auth[network].emails[0].value.toLowerCase()})
        .exec()
        .then(() => {
          if (!existingUser) sendTxnEmail(savedUser, 'welcome');
        }); // eslint-disable-line max-nested-callbacks
      }

      if (!existingUser) {
        res.analytics.track('register', {
          category: 'acquisition',
          type: network,
          gaLabel: network,
          uuid: savedUser._id,
          headers: req.headers,
          user: savedUser,
        });
      }

      return null;
    }
  },
};

/*
 * @apiIgnore Private route
 * @api {post} /api/v3/user/auth/pusher Pusher.com authentication
 * @apiDescription Authentication for Pusher.com private and presence channels
 * @apiName UserAuthPusher
 * @apiGroup User
 *
 * @apiParam {String} socket_id Body parameter
 * @apiParam {String} channel_name Body parameter
 *
 * @apiSuccess {String} auth The authentication token
 */
api.pusherAuth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/auth/pusher',
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('socket_id').notEmpty();
    req.checkBody('channel_name').notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let socketId = req.body.socket_id;
    let channelName = req.body.channel_name;

    // Channel names are in the form of {presence|private}-{group|...}-{resourceId}
    let [channelType, resourceType, ...resourceId] = channelName.split('-');

    if (['presence'].indexOf(channelType) === -1) { // presence is used only for parties, private for guilds
      throw new BadRequest('Invalid Pusher channel type.');
    }

    if (resourceType !== 'group') { // only groups are supported
      throw new BadRequest('Invalid Pusher resource type.');
    }

    resourceId = resourceId.join('-'); // the split at the beginning had split resourceId too
    if (!validator.isUUID(resourceId)) {
      throw new BadRequest('Invalid Pusher resource id, must be a UUID.');
    }

    // Only the user's party is supported for now
    if (user.party._id !== resourceId) {
      throw new NotFound('Resource id must be the user\'s party.');
    }

    let authResult;

    // Max 100 members for presence channel - parties only
    if (channelType === 'presence') {
      let presenceData = {
        user_id: user._id, // eslint-disable-line camelcase
        // Max 1KB
        user_info: {}, // eslint-disable-line camelcase
      };

      authResult = pusher.authenticate(socketId, channelName, presenceData);
    } else {
      authResult = pusher.authenticate(socketId, channelName);
    }

    // Not using res.respond because Pusher requires a different response format
    res.status(200).json(authResult);
  },
};

/**
 * @api {put} /api/v3/user/auth/update-username Update username
 * @apiDescription Update the username of a local user
 * @apiName UpdateUsername
 * @apiGroup User
 *
 * @apiParam {String} password Body parameter - The current user password
 * @apiParam {String} username Body parameter - The new username

 * @apiSuccess {String} data.username The new username
 **/
api.updateUsername = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-username',
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
      username: {
        notEmpty: { errorMessage: res.t('missingUsername') },
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (!user.auth.local.username) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    let count = await User.count({ 'auth.local.lowerCaseUsername': req.body.username.toLowerCase() });
    if (count > 0) throw new BadRequest(res.t('usernameTaken'));

    // save username
    user.auth.local.lowerCaseUsername = req.body.username.toLowerCase();
    user.auth.local.username = req.body.username;
    await user.save();

    res.respond(200, { username: req.body.username });
  },
};

/**
 * @api {put} /api/v3/user/auth/update-password
 * @apiDescription Update the password of a local user
 * @apiName UpdatePassword
 * @apiGroup User
 *
 * @apiParam {String} password Body parameter - The old password
 * @apiParam {String} newPassword Body parameter - The new password
 * @apiParam {String} confirmPassword Body parameter - New password confirmation
 *
 * @apiSuccess {Object} data An empty object
 **/
api.updatePassword = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-password',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.hashed_password) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
      newPassword: {
        notEmpty: {errorMessage: res.t('missingNewPassword')},
      },
      confirmPassword: {
        notEmpty: {errorMessage: res.t('missingNewPassword')},
      },
    });

    let validationErrors = req.validationErrors();

    if (validationErrors) {
      throw validationErrors;
    }

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    if (req.body.newPassword !== req.body.confirmPassword) throw new NotAuthorized(res.t('passwordConfirmationMatch'));

    user.auth.local.hashed_password = passwordUtils.encrypt(req.body.newPassword, user.auth.local.salt); // eslint-disable-line camelcase
    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/user/reset-password Reset password
 * @apiDescription Reset the user password
 * @apiName ResetPassword
 * @apiGroup User
 *
 * @apiParam {String} email Body parameter - The email address of the user
 *
 * @apiSuccess {String} message The localized success message
 **/
api.resetPassword = {
  method: 'POST',
  middlewares: [],
  url: '/user/reset-password',
  async handler (req, res) {
    req.checkBody({
      email: {
        notEmpty: {errorMessage: res.t('missingEmail')},
      },
    });
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let email = req.body.email.toLowerCase();
    let salt = passwordUtils.makeSalt();
    let newPassword =  passwordUtils.makeSalt(); // use a salt as the new password too (they'll change it later)
    let hashedPassword = passwordUtils.encrypt(newPassword, salt);

    let user = await User.findOne({ 'auth.local.email': email });

    if (user) {
      user.auth.local.salt = salt;
      user.auth.local.hashed_password = hashedPassword; // eslint-disable-line camelcase
      sendEmail({
        from: 'Habitica <admin@habitica.com>',
        to: email,
        subject: res.t('passwordResetEmailSubject'),
        text: res.t('passwordResetEmailText', { username: user.auth.local.username,
                                                newPassword,
                                                baseUrl: nconf.get('BASE_URL'),
                                              }),
        html: res.t('passwordResetEmailHtml', { username: user.auth.local.username,
                                                newPassword,
                                                baseUrl: nconf.get('BASE_URL'),
                                              }),
      });

      await user.save();
    }

    res.respond(200, {}, res.t('passwordReset'));
  },
};

/**
 * @api {put} /api/v3/user/auth/update-email Update email
 * @apiDescription Change the user email address
 * @apiName UpdateEmail
 * @apiGroup User
 *
 * @apiParam {String} Body parameter - newEmail The new email address.
 * @apiParam {String} Body parameter - password The user password.
 *
 * @apiSuccess {String} data.email The updated email address
 */
api.updateEmail = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-email',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.email) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    req.checkBody('password', res.t('missingPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let emailAlreadyInUse = await User.findOne({'auth.local.email': req.body.newEmail}).select({_id: 1}).lean().exec();
    if (emailAlreadyInUse) throw new NotAuthorized(res.t('cannotFulfillReq'));

    let candidatePassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (candidatePassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    user.auth.local.email = req.body.newEmail;
    await user.save();

    return res.respond(200, { email: user.auth.local.email });
  },
};

/**
 * @api {delete} /api/v3/user/auth/social/:network Delete social authentication method
 * @apiDescription Remove a social authentication method (only facebook supported) from a user profile. The user must have local authentication enabled
 * @apiName UserDeleteSocial
 * @apiGroup User
 *
 * @apiSuccess {Object} data Empty object
 */
api.deleteSocial = {
  method: 'DELETE',
  url: '/user/auth/social/:network',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let network = req.params.network;
    let isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find(supportedNetwork => {
      return supportedNetwork.key === network;
    });
    if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));
    if (!hasBackupAuth(user, network)) throw new NotAuthorized(res.t('cantDetachSocial'));
    let unset = {
      [`auth.${network}`]: 1,
    };
    await User.update({_id: user._id}, {$unset: unset}).exec();

    res.respond(200, {});
  },
};

module.exports = api;
