import validator from 'validator';
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import passwordUtils from '../../libs/api-v3/password';
import User from '../../models/user';

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
 * @apiSuccess {Object} user The user public fields
 *
 *
 * @apiUse NotAuthorized
 */
api.registerLocal = {
  method: 'POST',
  url: '/user/register/local',
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
        errorMessage: req.t('missingUsernameEmail'),
      },
      password: {
        notEmpty: true,
        errorMessage: req.t('missingPassword'),
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

      if (!isValidPassword) return next(new NotAuthorized(req.t('invalidLoginCredentials')));

      res
        .status(200)
        .json({id: user._id, apiToken: user.apiToken});
    })
    .catch(next);
  },
};

export default api;
