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
import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../../libs/email';
import { send as sendEmail } from '../../libs/email';
import pusher from '../../libs/pusher';
import common from '../../../common';
import { validatePasswordResetCodeAndFindUser, convertToBcrypt} from '../../libs/password';
import { encrypt } from '../../libs/encryption';
import * as authLib from '../../libs/auth';

const BASE_URL = nconf.get('BASE_URL');
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL');
const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');

let api = {};

function hasBackupAuth (user, networkToRemove) {
  if (user.auth.local.username) {
    return true;
  }

  let hasAlternateNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find((network) => {
    return network.key !== networkToRemove && user.auth[network.key].id;
  });

  return hasAlternateNetwork;
}

/* NOTE this route has also an API v4 version */

/**
 * @api {post} /api/v3/user/auth/local/register Register
 * @apiDescription Register a new user with email, login name, and password or attach local auth to a social user
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam (Body) {String} username Login name of the new user. Must be 1-36 characters, containing only a-z, 0-9, hyphens (-), or underscores (_).
 * @apiParam (Body) {String} email Email address of the new user
 * @apiParam (Body) {String} password Password for the new user
 * @apiParam (Body) {String} confirmPassword Password confirmation
 *
 * @apiSuccess {Object} data The user object, if local auth was just attached to a social user then only user.auth.local
 */
api.registerLocal = {
  method: 'POST',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  url: '/user/auth/local/register',
  async handler (req, res) {
    await authLib.registerLocal(req, res, { isV3: true });
  },
};

function _loginRes (user, req, res) {
  if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL, userId: user._id}));
  return res.respond(200, {id: user._id, apiToken: user.apiToken, newUser: user.newUser || false});
}

/**
 * @api {post} /api/v3/user/auth/local/login Login
 * @apiDescription Login a user with email / username and password
 * @apiName UserLoginLocal
 * @apiGroup User
 *
 * @apiParam (Body) {String} username Username or email of the user
 * @apiParam (Body) {String} password The user's password
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
    let password = req.body.password;

    if (validator.isEmail(String(username))) {
      login = {'auth.local.email': username.toLowerCase()}; // Emails are stored lowercase
    } else {
      login = {'auth.local.username': username};
    }

    // load the entire user because we may have to save it to convert the password to bcrypt
    let user = await User.findOne(login).exec();

    let isValidPassword;

    if (!user) {
      isValidPassword = false;
    } else {
      isValidPassword = await passwordUtils.compare(user, password);
    }

    if (!isValidPassword) throw new NotAuthorized(res.t('invalidLoginCredentialsLong'));

    // convert the hashed password to bcrypt from sha1
    if (user.auth.local.passwordHashMethod === 'sha1') {
      await passwordUtils.convertToBcrypt(user, password);
      await user.save();
    }

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
  middlewares: [authWithHeaders({
    optional: true,
  })],
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
          [network]: {
            id: profile.id,
            emails: profile.emails,
          },
        },
        profile: {
          name: profile.displayName || profile.name || profile.username,
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
 * @apiParam (Body) {String} socket_id A unique identifier for the specific client connection to Pusher
 * @apiParam (Body) {String} channel_name The name of the channel being subscribed to
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
    if (!validator.isUUID(String(resourceId))) {
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
 * @apiParam (Body) {String} password The current user password
 * @apiParam (Body) {String} username The new username

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
        notEmpty: {errorMessage: res.t('missingUsername')},
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (!user.auth.local.username) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    let password = req.body.password;
    let isValidPassword = await passwordUtils.compare(user, password);
    if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));

    let count = await User.count({ 'auth.local.lowerCaseUsername': req.body.username.toLowerCase() });
    if (count > 0) throw new BadRequest(res.t('usernameTaken'));

    // if password is using old sha1 encryption, change it
    if (user.auth.local.passwordHashMethod === 'sha1') {
      await passwordUtils.convertToBcrypt(user, password); // user is saved a few lines below
    }

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
 * @apiParam (Body) {String} password The old password
 * @apiParam (Body) {String} newPassword The new password
 * @apiParam (Body) {String} confirmPassword New password confirmation
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

    let oldPassword = req.body.password;
    let isValidPassword = await passwordUtils.compare(user, oldPassword);
    if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));

    let newPassword = req.body.newPassword;
    if (newPassword !== req.body.confirmPassword) throw new NotAuthorized(res.t('passwordConfirmationMatch'));

    // set new password and make sure it's using bcrypt for hashing
    await passwordUtils.convertToBcrypt(user, newPassword);
    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/user/reset-password Reset password
 * @apiDescription Send the user an email to let them reset their password
 * @apiName ResetPassword
 * @apiGroup User
 *
 * @apiParam (Body) {String} email The email address of the user
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
    let user = await User.findOne({ 'auth.local.email': email }).exec();

    if (user) {
      // create an encrypted link to be used to reset the password
      const passwordResetCode = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({ hours: 24 }),
      }));
      let link = `${BASE_URL}/static/user/auth/local/reset-password-set-new-one?code=${passwordResetCode}`;

      user.auth.local.passwordResetCode = passwordResetCode;

      sendEmail({
        from: 'Habitica <admin@habitica.com>',
        to: email,
        subject: res.t('passwordResetEmailSubject'),
        text: res.t('passwordResetEmailText', {
          username: user.auth.local.username,
          passwordResetLink: link,
        }),
        html: res.t('passwordResetEmailHtml', {
          username: user.auth.local.username,
          passwordResetLink: link,
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
 * @apiParam (Body) {String} newEmail The new email address.
 * @apiParam (Body) {String} password The user password.
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

    let emailAlreadyInUse = await User.findOne({
      'auth.local.email': req.body.newEmail.toLowerCase(),
    }).select({_id: 1}).lean().exec();

    if (emailAlreadyInUse) throw new NotAuthorized(res.t('cannotFulfillReq', { techAssistanceEmail: TECH_ASSISTANCE_EMAIL }));

    let password = req.body.password;
    let isValidPassword = await passwordUtils.compare(user, password);
    if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));

    // if password is using old sha1 encryption, change it
    if (user.auth.local.passwordHashMethod === 'sha1') {
      await passwordUtils.convertToBcrypt(user, password);
    }

    user.auth.local.email = req.body.newEmail.toLowerCase();
    await user.save();

    return res.respond(200, { email: user.auth.local.email });
  },
};

/**
 * @api {post} /api/v3/user/auth/reset-password-set-new-one Reser Password Set New one
 * @apiDescription Set a new password for a user that reset theirs. Not meant for public usage.
 * @apiName ResetPasswordSetNewOne
 * @apiGroup User
 *
 * @apiParam (Body) {String} newPassword The new password.
 * @apiParam (Body) {String} confirmPassword Password confirmation.
 *
 * @apiSuccess {String} data An empty object
 * @apiSuccess {String} data Success message
 */
api.resetPasswordSetNewOne = {
  method: 'POST',
  url: '/user/auth/reset-password-set-new-one',
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.body.code);
    let isValidCode = Boolean(user);

    if (!isValidCode) throw new NotAuthorized(res.t('invalidPasswordResetCode'));

    req.checkBody('newPassword', res.t('missingNewPassword')).notEmpty();
    req.checkBody('confirmPassword', res.t('missingNewPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      throw new BadRequest(res.t('passwordConfirmationMatch'));
    }

    // set new password and make sure it's using bcrypt for hashing
    await convertToBcrypt(user, String(newPassword));
    user.auth.local.passwordResetCode = undefined; // Reset saved password reset code
    await user.save();

    return res.respond(200, {}, res.t('passwordChangeSuccess'));
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
