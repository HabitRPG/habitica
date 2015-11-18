import i18n from '../../../../common/script/i18n';
// TODO add getUserLanguage as a global middleware?
import getUserLanguage from '../../middlewares/api-v3/getUserLanguage';
import validator from 'validator';
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import passwordUtils from '../../libs/api-v3/password';
import User from '../../models/user';

let api = {};

/**
 * @api {get} /user/login/local Login a user with email / username and password
 * @apiVersion 3.0.0
 * @apiName UserLoginLocal
 * @apiGroup User
 *
 * @apiParam {String} username Username or email of the User.
 * @apiParam {String} password The user's password
 *
 * @apiSuccess {String} _id The user's unique identifier
 * @apiSuccess {String} apiToken The user's api token that must be used to authenticate requests.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *       "apiToken": "1234567890"
 *     }
 *
 * @apiUse NotAuthorized
 */
api.loginLocal = {
  method: 'GET',
  url: '/user/login/local',
  middlewares: [getUserLanguage],
  handler (req, res, next) {
    req.checkBody({
      username: {
        notEmpty: true,
        errorMessage: i18n.t('missingUsernameEmail'),
      },
      password: {
        notEmpty: true,
        errorMessage: i18n.t('missingPassword'),
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

      if (!isValidPassword) return next(new NotAuthorized(i18n.t('invalidLoginCredentials')));

      res
        .status(200)
        .json({id: user._id, apiToken: user.apiToken});
    })
    .catch(next);
  },
};

export default api;
