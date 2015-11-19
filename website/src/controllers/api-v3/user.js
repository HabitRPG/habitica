import validator from 'validator';
import passport from 'passport';
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import passwordUtils from '../../libs/api-v3/password';
import User from '../../models/user';
import EmailUnsubscription from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../../libs/api-v3/email';

let api = {};

/**
 * @api {post} /user/register/local Register a new user with email, username and password
 * @apiVersion 3.0.0
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam {String} username Username of the new user
 * @apiParam {String} email Email address of the new user
 * @apiParam {String} password Password for the new user account
 * @apiParam {String} passwordConfirmation Password confirmation
 *
 * @apiSuccess {Object} user The user object
 */
api.registerLocal = {
  method: 'POST',
  url: '/user/register/local',
  handler (req, res, next) {
    let email = req.body.email.toLowerCase();
    let username = req.body.username;
    // Get the lowercase version of username to check that we do not have duplicates
    // So we can search for it in the database and then reject the choosen username if 1 or more results are found
    let lowerCaseUsername = username.toLowerCase();

    // Search for duplicates using lowercase version of username
    User.findOne({$or: [
      {'auth.local.email': email},
      {'auth.local.lowerCaseUsername': lowerCaseUsername},
    ]}, {'auth.local': 1})
    .exec()
    .then((user) => {
      if (user) {
        if (email === user.auth.local.email) return next(new NotAuthorized(res.t('emailTaken')));
        // Check that the lowercase username isn't already used
        if (lowerCaseUsername === user.auth.local.lowerCaseUsername) return next(new NotAuthorized(res.t('usernameTaken')));
      }

      let newUser = new User({
        auth: {
          local: {
            username,
            lowerCaseUsername, // Store the lowercase version of the username
            email, // Store email as lowercase
            salt: passwordUtils.makeSalt(),
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation,
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
    })
    .catch(next);
  },
};

/**
 * @api {post} /user/login/local Login an user with email / username and password
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
  url: '/user/login/local',
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

      if (user.auth.blocked) return next(new NotAuthorized(res.t('accountSuspended', {userId: user._id})));
      if (!isValidPassword) return next(new NotAuthorized(res.t('invalidLoginCredentials')));
      res.status(200).json({id: user._id, apiToken: user.apiToken});
    })
    .catch(next);
  },
};

// Called as a callback by Facebook (or other social providers)
api.loginSocial = {
  method: 'POST',
  url: '/user/aurh/social',
  handler (req, res, next) {
    let accessToken = req.body.authResponse.access_token;
    let network = req.body.network;

    if (network !== 'facebook') return next(new NotAuthorized('Only Facebook supported currently.'));

    passport._strategies[network].userProfile(accessToken, (err, profile) => {
      if (err) return next(err);

      function _respond (user) {
        if (user.auth.blocked) return next(new NotAuthorized(res.t('accountSuspended', {userId: user._id})));
        return res.status(200).json({_id: user._id, apiToken: user.apiToken});
      }

      User.findOne({
        [`auth.${network}.id`]: profile.id,
      }, {_id: 1, apiToken: 1, auth: 1}).exec()
      .then((user) => {
        // User already signed up
        if (user) {
          return _respond(user);
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
            _respond(savedUser);

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

api.attachSocial = {

};

api.deleteSocial = {

};


export default api;
