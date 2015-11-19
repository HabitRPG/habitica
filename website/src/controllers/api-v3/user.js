import validator from 'validator';
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import passwordUtils from '../../libs/api-v3/password';
import User from '../../models/user';
import EmailUnsubscription from '../../models/emailUnsubscription';
import Q from 'q';
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
 * @apiSuccess {Object} user The user profile
 *
 * @apiUse NotAuthorized
 */
api.registerLocal = {
  method: 'POST',
  url: '/user/register/local',
  handler (req, res, next) {
    req.checkBody({
      username: {
        notEmpty: true,
        errorMessage: res.t('missingEmail'),
      },
      email: {
        notEmpty: true,
        isEmail: true,
        errorMessage: res.t('invalidEmail'),
      },
      password: {
        notEmpty: true,
        errorMessage: res.t('missingPassword'),
      },
      passwordConfirmation: {
        notEmpty: true,
        equals: {
          options: [req.body.password],
        },
        errorMessage: res.t('passwordConfirmationMatch'),
      },
    });

    let validationErrors = req.validationErrors();

    if (validationErrors) return next(validationErrors);

    req.sanitizeBody('username').trim();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('password').trim();
    req.sanitizeBody('passwordConfirmation').trim();

    let email = req.body.email.toLowerCase();
    let username = req.body.username;
    // Get the lowercase version of username to check that we do not have duplicates
    // So we can search for it in the database and then reject the choosen username if 1 or more results are found
    let lowerCaseUsername = username.toLowerCase();

    Q.all([
      // Search for duplicates using lowercase version of username
      User.findOne({$or: [
        {'auth.local.email': email},
        {'auth.local.lowerCaseUsername': lowerCaseUsername},
      ]}, {'auth.local': 1})
      .exec(),

      // If the request is made by an authenticated Facebook user, find it
      // TODO move to a separate route
      // TODO automatically merge?
      /* User.findOne({
        _id: req.headers['x-api-user'],
        apiToken: req.headers['x-api-key']
      }, {auth:1})
      .exec();  */
    ])
    .then((results) => {
      if (results[0]) {
        if (email === results[0].auth.local.email) return next(new NotAuthorized(res.t('emailTaken')));
        // Check that the lowercase username isn't already used
        if (lowerCaseUsername === results[0].auth.local.lowerCaseUsername) return next(new NotAuthorized(res.t('usernameTaken')));
      }

      let salt = passwordUtils.makeSalt();
      let newUser = new User({
        auth: {
          local: {
            username,
            lowerCaseUsername, // Store the lowercase version of the username
            email, // Store email as lowercase
            salt,
            hashed_password: passwordUtils.encrypt(req.body.password, salt), // eslint-disable-line camelcase
          },
        },
        preferences: {
          language: req.language,
        },
      });

      newUser.registeredThrough = req.headers['x-client']; // TODO is this saved somewhere?

      res.analytics.track('register', {
        category: 'acquisition',
        type: 'local',
        gaLabel: 'local',
        uuid: newUser._id,
      });

      return newUser.save();
    })
    .then((savedUser) => {
      res.status(201).json(savedUser);

      // Clean previous email preferences
      EmailUnsubscription
      .remove({email: savedUser.auth.local.email})
      .then(() => {
        sendTxnEmail(savedUser, 'welcome');
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
 *
 * @apiUse NotAuthorized
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
    .findOne(login, {auth: 1, apiToken: 1})
    .exec()
    .then((user) => {
      // TODO abstract isnce it's also used in auth middlewares if (user.auth.blocked) return res.json(401, accountSuspended(user._id));
      // TODO place back long error message return res.json(401, {err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\"."});
      let isValidPassword = user && user.auth.local.hashed_password !== passwordUtils.encrypt(req.body.password, user.auth.local.salt);

      if (!isValidPassword) return next(new NotAuthorized(res.t('invalidLoginCredentials')));

      res
        .status(200)
        .json({id: user._id, apiToken: user.apiToken});
    })
    .catch(next);
  },
};

export default api;
