import validator from 'validator';
import moment from 'moment';
import passport from 'passport';
import nconf from 'nconf';
import {
  authWithHeaders,
  authWithSession,
 } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import {
  NotAuthorized,
  BadRequest,
  NotFound,
} from '../../libs/api-v3/errors';
import Q from 'q';
import * as passwordUtils from '../../libs/api-v3/password';
import { model as User } from '../../models/user';
import { model as Group } from '../../models/group';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../../libs/api-v3/email';
import { decrypt } from '../../libs/api-v3/encryption';
import FirebaseTokenGenerator from 'firebase-token-generator';
import { send as sendEmail } from '../../libs/api-v3/email';

let api = {};

// When the user signed up after having been invited to a group, invite them automatically to the group
async function _handleGroupInvitation (user, invite) {
  // wrapping the code in a try because we don't want it to prevent the user from signing up
  // that's why errors are not translated
  try {
    let {sentAt, id: groupId, inviter} = JSON.parse(decrypt(invite));

    // check that the invite has not expired (after 7 days)
    if (sentAt && moment().subtract(7, 'days').isAfter(sentAt)) {
      let err = new Error('Invite expired');
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
    // TODO log errors
  }
}

/**
 * @api {post} /user/auth/local/register Register a new user with email, username and password or attach local auth to a social user
 * @apiVersion 3.0.0
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam {String} username Username of the new user
 * @apiParam {String} email Email address of the new user
 * @apiParam {String} password Password for the new user account
 * @apiParam {String} confirmPassword Password confirmation
 *
 * @apiSuccess {Object} user The user object, if we just attached local auth to a social user then only user.auth.local
 */
api.registerLocal = {
  method: 'POST',
  middlewares: [authWithHeaders(true)],
  url: '/user/auth/local/register',
  async handler (req, res) {
    let fbUser = res.locals.user; // If adding local auth to social user

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

    if (fbUser) {
      if (!fbUser.auth.facebook.id) throw new NotAuthorized(res.t('onlySocialAttachLocal'));
      fbUser.auth.local = newUser.auth.local;
      newUser = fbUser;
    } else {
      newUser = new User(newUser);
      newUser.registeredThrough = req.headers['x-client']; // TODO is this saved somewhere?
    }

    // we check for partyInvite for backward compatibility
    if (req.query.groupInvite || req.query.partyInvite) {
      await _handleGroupInvitation(newUser, req.query.groupInvite || req.query.partyInvite);
    }

    let savedUser = await newUser.save();

    if (savedUser.auth.facebook.id) {
      res.respond(200, savedUser.toJSON().auth.local); // We convert to toJSON to hide private fields
    } else {
      res.respond(201, savedUser);
    }

    // Clean previous email preferences and send welcome email
    EmailUnsubscription
      .remove({email: savedUser.auth.local.email})
      .then(() => sendTxnEmail(savedUser, 'welcome'));

    if (!savedUser.auth.facebook.id) {
      res.analytics.track('register', {
        category: 'acquisition',
        type: 'local',
        gaLabel: 'local',
        uuid: savedUser._id,
      });
    }
  },
};

function _loginRes (user, req, res) {
  if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {userId: user._id}));
  res.respond(200, {id: user._id, apiToken: user.apiToken});
}

/**
 * @api {post} /user/auth/local/login Login an user with email / username and password
 * @apiVersion 3.0.0
 * @apiName UserLoginLocal
 * @apiGroup User
 *
 * @apiParam {String} username Username or email of the user
 * @apiParam {String} password The user's password
 *
 * @apiSuccess {String} _id The user's unique identifier
 * @apiSuccess {String} apiToken The user's api token that must be used to authenticate requests.
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
    _loginRes(user, ...arguments);
  },
};

function _passportFbProfile (accessToken) {
  let deferred = Q.defer();

  passport._strategies.facebook.userProfile(accessToken, (err, profile) => {
    if (err) {
      deferred.rejec();
    } else {
      deferred.resolve(profile);
    }
  });

  return deferred.promise;
}

// Called as a callback by Facebook (or other social providers)
api.loginSocial = {
  method: 'POST',
  url: '/user/auth/social', // this isn't the most appropriate url but must be the same as v2
  middlewares: [cron],
  async handler (req, res) {
    let accessToken = req.body.authResponse.access_token;
    let network = req.body.network;

    if (network !== 'facebook') throw new NotAuthorized(res.t('onlyFbSupported'));

    let profile = await _passportFbProfile(accessToken);

    let user = await User.findOne({
      [`auth.${network}.id`]: profile.id,
    }, {_id: 1, apiToken: 1, auth: 1}).exec();

    // User already signed up
    if (user) {
      _loginRes(user, ...arguments);
    } else { // Create new user
      user = new User({
        auth: {
          [network]: profile,
        },
        preferences: {
          language: req.language,
        },
      });
      user.registeredThrough = req.headers['x-client'];

      let savedUser = await user.save();

      _loginRes(user, ...arguments);

      // Clean previous email preferences
      if (savedUser.auth[network].emails && savedUser.auth.facebook.emails[0] && savedUser.auth[network].emails[0].value) {
        EmailUnsubscription
        .remove({email: savedUser.auth[network].emails[0].value.toLowerCase()})
        .exec()
        .then(() => sendTxnEmail(savedUser, 'welcome')); // eslint-disable-line max-nested-callbacks
      }

      res.analytics.track('register', {
        category: 'acquisition',
        type: network,
        gaLabel: network,
        uuid: savedUser._id,
      });
    }
  },
};

/**
 * @api {put} /user/auth/update-username
 * @apiVersion 3.0.0
 * @apiName updateUsername
 * @apiGroup User
 * @apiParam {string} password The password
 * @apiParam {string} username New username
 * @apiSuccess {Object} The new username
 **/
api.updateUsername = {
  method: 'PUT',
  middlewares: [authWithHeaders(), cron],
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
 * @api {put} /user/auth/update-password
 * @apiVersion 3.0.0
 * @apiName updatePassword
 * @apiGroup User
 * @apiParam {string} password The old password
 * @apiParam {string} newPassword The new password
 * @apiParam {string} confirmPassword Password confirmation
 * @apiSuccess {Object} The success message
 **/
api.updatePassword = {
  method: 'PUT',
  middlewares: [authWithHeaders(), cron],
  url: '/user/auth/update-password',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.hashed_password) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingNewPassword')},
      },
      newPassword: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
    });

    if (req.body.newPassword !== req.body.confirmPassword) throw new NotAuthorized(res.t('passwordConfirmationMatch'));

    user.auth.local.hashed_password = passwordUtils.encrypt(req.body.newPassword, user.auth.local.salt); // eslint-disable-line camelcase
    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {post} /user/reset-password
 * @apiVersion 3.0.0
 * @apiName resetPassword
 * @apiGroup User
 * @apiParam {string} email email
 * @apiSuccess {Object} The success message
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

    let user = await User.findOne({ 'auth.local.email': email }, { 'auth.local': 1 });

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
    res.respond(200, { message: res.t('passwordReset') });
  },
};

/**
 * @api {put} /user/auth/update-email
 * @apiVersion 3.0.0
 * @apiName UpdateEmail
 * @apiGroup User
 *
 * @apiParam {string} newEmail The new email address.
 * @apiParam {string} password The user password.
 *
 * @apiSuccess {Object} An object containing the new email address
 */
api.updateEmail = {
  method: 'PUT',
  middlewares: [authWithHeaders(), cron],
  url: '/user/auth/update-email',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.email) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    req.checkBody('password', res.t('missingPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let candidatePassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (candidatePassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    user.auth.local.email = req.body.newEmail;
    await user.save();

    return res.respond(200, { email: user.auth.local.email });
  },
};

const firebaseTokenGenerator = new FirebaseTokenGenerator(nconf.get('FIREBASE:SECRET'));

// Internal route TODO expose?
api.getFirebaseToken = {
  method: 'POST',
  url: '/user/auth/firebase',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    // Expires 24 hours from now (60*60*24*1000) (in milliseconds)
    let expires = new Date();
    expires.setTime(expires.getTime() + 86400000);

    let token = firebaseTokenGenerator.createToken({
      uid: user._id,
      isHabiticaUser: true,
    }, { expires });

    res.respond(200, {token, expires});
  },
};

/**
 * @api {delete} /user/auth/social/:network Delete a social authentication method (only facebook supported)
 * @apiVersion 3.0.0
 * @apiName UserDeleteSocial
 * @apiGroup User
 *
 * @apiSuccess {Object} response Empty object
 */
api.deleteSocial = {
  method: 'DELETE',
  url: '/user/auth/social/:network',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let network = req.params.network;

    if (network !== 'facebook') throw new NotAuthorized(res.t('onlyFbSupported'));
    if (!user.auth.local.username) throw new NotAuthorized(res.t('cantDetachFb'));

    await User.update({_id: user._id}, {$unset: {'auth.facebook': 1}}).exec();

    res.respond(200, {});
  },
};

// Internal route
api.logout = {
  method: 'GET',
  url: '/user/auth/logout', // TODO this is under /api/v3 route, should be accessible through habitica.com/logout
  middlewares: [authWithSession, cron],
  async handler (req, res) {
    req.logout(); // passportjs method
    req.session = null;
    res.redirect('/');
  },
};

module.exports = api;
