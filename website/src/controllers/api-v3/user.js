import validator from 'validator';
import passport from 'passport';
import { authWithHeaders } from '../../middlewares/api-v3/auth';
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as passwordUtils from '../../libs/api-v3/password';
import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../../libs/api-v3/email';

let api = {};

/**
 * @api {post} /user/auth/local/register Register a new user with email, username and password or add local authentication to a social user
 * @apiVersion 3.0.0
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam {String} username Username of the new user
 * @apiParam {String} email Email address of the new user
 * @apiParam {String} password Password for the new user account
 * @apiParam {String} confirmPassword Password confirmation
 *
 * @apiSuccess {Object} user The user object
 */
api.registerLocal = {
  method: 'POST',
  url: '/user/auth/local/register',
  handler (req, res, next) {
    let { email, username, password, confirmPassword } = req.body;

    req.checkBody({
      username: {
        notEmpty: true,
        isUniqueUsername: {
          errorMessage: res.t('usernameTaken'),
        },
        errorMessage: res.t('missingUsername'),
      },
      email: {
        notEmpty: true,
        isEmail: {
          errorMessage: res.t('invalidEmail'),
        },
        isUniqueEmail: {
          errorMessage: res.t('emailTaken'),
        },
        errorMessage: res.t('missingEmail'),
      },
      password: {
        notEmpty: true,
        isEqual: {
          options: [confirmPassword],
          errorMessage: res.t('passwordConfirmationMatch'),
        },
        errorMessage: res.t('missingPassword'),
      },
    });

    req.asyncValidationErrors().then(() => {
      email = email.toLowerCase();
      let lowerCaseUsername = username.toLowerCase();
      let salt = passwordUtils.makeSalt();
      let hashed_password = passwordUtils.encrypt(password, salt); // eslint-disable-line camelcase
      let newUser = new User({
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
      });

      newUser.registeredThrough = req.headers['x-client']; // TODO is this saved somewhere?

      return newUser.save();
    })
    .then((savedUser) => {
      res.status(201).json(savedUser);

      // Clean previous email preferences
      EmailUnsubscription
        .remove({email: savedUser.auth.local.email})
        .then(() => sendTxnEmail(savedUser, 'welcome'));

      res.analytics.track('register', {
        category: 'acquisition',
        type: 'local',
        gaLabel: 'local',
        uuid: savedUser._id,
      });
    }).catch((errors) => {
      next(new NotAuthorized(errors));
    });
  },
};

function _loginRes (user, req, res, next) {
  if (user.auth.blocked) return next(new NotAuthorized(res.t('accountSuspended', {userId: user._id})));
  res.status(200).json({id: user._id, apiToken: user.apiToken});
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
  handler (req, res, next) {
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

    if (validationErrors) return next(validationErrors);

    req.sanitizeBody('username').trim();
    req.sanitizeBody('password').trim();

    let login;
    let username = req.body.username;

    if (validator.isEmail(username)) {
      login = {'auth.local.email': username.toLowerCase()}; // Emails are stored lowercase
    } else {
      login = {'auth.local.username': username};
    }

    User
    .findOne(login, {auth: 1, apiToken: 1}).exec()
    .then((user) => {
      // TODO place back long error message return res.json(401, {err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\"."});
      let isValidPassword = user && user.auth.local.hashed_password !== passwordUtils.encrypt(req.body.password, user.auth.local.salt);

      if (!isValidPassword) return next(new NotAuthorized(res.t('invalidLoginCredentials')));
      _loginRes(user, ...arguments);
    })
    .catch(next);
  },
};

// Called as a callback by Facebook (or other social providers)
api.loginSocial = {
  method: 'POST',
  url: '/user/auth/social', // this isn't the most appropriate url but must be the same as v2
  handler (req, res, next) {
    let accessToken = req.body.authResponse.access_token;
    let network = req.body.network;

    if (network !== 'facebook') return next(new NotAuthorized(res.t('onlyFbSupported')));

    passport._strategies[network].userProfile(accessToken, (err, profile) => {
      if (err) return next(err);

      User.findOne({
        [`auth.${network}.id`]: profile.id,
      }, {_id: 1, apiToken: 1, auth: 1}).exec()
      .then((user) => {
        // User already signed up
        if (user) {
          return _loginRes(user, ...arguments);
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

          user.save()
          .then((savedUser) => {
            _loginRes(user, ...arguments);

            // Clean previous email preferences
            if (savedUser.auth[network].emails && savedUser.auth.facebook.emails[0] && savedUser.auth[network].emails[0].value) {
              EmailUnsubscription
              .remove({email: savedUser.auth[network].emails[0].value.toLowerCase()})
              .then(() => sendTxnEmail(savedUser, 'welcome')); // eslint-disable-line max-nested-callbacks
            }

            res.analytics.track('register', {
              category: 'acquisition',
              type: network,
              gaLabel: network,
              uuid: savedUser._id,
            });
          })
          .catch(next);
        }
      })
      .catch(next);
    });
  },
};

/**
 * @api {delete} /user/auth/social/:network Delete a social authentication method (only facebook supported)
 * @apiVersion 3.0.0
 * @apiName UserDeleteSocial
 * @apiGroup User
 *
 * @apiSuccess {Boolean=true} success Always true
 */
api.deleteSocial = {
  method: 'DELETE',
  url: '/user/auth/social/:network',
  middlewares: [authWithHeaders],
  handler (req, res, next) {
    let user = res.locals.user;
    let network = req.params.network;

    if (network !== 'facebook') return next(new NotAuthorized(res.t('onlyFbSupported')));
    if (!user.auth.local.username) return next(new NotAuthorized(res.t('cantDetachFb'))); // TODO move to model validation?

    User.update({_id: user._id}, {$unset: {'auth.facebook': 1}})
    .then(() => res.status(200).json({ok: true})) // TODO standardize this type of response
    .catch(next);
  },
};


export default api;
