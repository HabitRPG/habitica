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
    // TODO check user doesn't have local auth
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
      fbUser.auth.local = newUser;
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
  middlewares: [cron],
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

    // TODO place back long error message return res.json(401, {err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\"."});
    let isValidPassword = user && user.auth.local.hashed_password !== passwordUtils.encrypt(req.body.password, user.auth.local.salt);

    if (!isValidPassword) throw new NotAuthorized(res.t('invalidLoginCredentials'));
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
    req.logout();
    req.session = null;
    res.redirect('/');
  },
};

module.exports = api;
