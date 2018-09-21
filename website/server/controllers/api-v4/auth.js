import {
  authWithHeaders,
} from '../../middlewares/auth';
import * as authLib from '../../libs/auth';
import {
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';
import * as passwordUtils from '../../libs/password';
import { model as User } from '../../models/user';
import {getMatchesByWordArray} from '../../libs/stringUtils';
import bannedSlurs from '../../libs/bannedSlurs';
import forbiddenUsernames from '../../libs/forbiddenUsernames';

const api = {};

function usernameContainsSlur (username) {
  let wordRegexs = bannedSlurs.map((word) => new RegExp(`.*${word}.*`, 'i'));
  for (let i = 0; i < wordRegexs.length; i += 1) {
    let regEx = wordRegexs[i];
    let match = username.match(regEx);
    if (match !== null && match[0] !== null) {
      return true;
    }
  }
  return false;
}

function usernameIsForbidden (username) {
  let forbidddenWordsMatched = getMatchesByWordArray(username, forbiddenUsernames);
  return forbidddenWordsMatched.length > 0;
}

function usernameContainsInvalidCharacters (username) {
  let match = username.match(new RegExp('[^a-z0-9_-]', 'i'));
  return match !== null && match[0] !== null;
}

async function verifyUsername (username, res) {
  let issues = [];
  if (username.length < 1 || username.length > 20) issues.push(res.t('usernameIssueLength'));
  if (usernameContainsInvalidCharacters(username)) issues.push(res.t('usernameIssueInvalidCharacters'));
  if (usernameContainsSlur(username)) issues.push(res.t('usernameIssueSlur'));
  if (usernameIsForbidden(username)) issues.push(res.t('usernameIssueForbidden'));

  return issues;
}

/**
 * @api {put} /api/v4/user/auth/update-username Update username
 * @apiDescription Update the username of a local user
 * @apiName UpdateUsername
 * @apiGroup User
 *
 * @apiParam (Body) {String} username The new username

 * @apiSuccess {String} data.username The new username
 **/
api.updateUsername = {
  method: 'PUT',
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
  url: '/user/auth/update-username',
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody({
      username: {
        notEmpty: {errorMessage: res.t('missingUsername')},
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let newUsername = req.body.username;

    let issues = await verifyUsername(newUsername, res);
    if (issues.length > 0) throw new BadRequest(res.t('invalidReqParams'));

    let password = req.body.password;
    if (password !== undefined) {
      let isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));
    }

    let count = await User.count({ 'auth.local.lowerCaseUsername': newUsername.toLowerCase() });
    if (count > 0) throw new BadRequest(res.t('usernameTaken'));

    // if password is using old sha1 encryption, change it
    if (user.auth.local.passwordHashMethod === 'sha1' && password !== undefined) {
      await passwordUtils.convertToBcrypt(user, password); // user is saved a few lines below
    }

    // save username
    user.auth.local.lowerCaseUsername = newUsername.toLowerCase();
    user.auth.local.username = newUsername;
    user.flags.verifiedUsername = true;
    await user.save();

    res.respond(200, { username: req.body.username });
  },
};

api.verifyUsername = {
  method: 'POST',
  url: '/user/auth/verify-username',
  async handler (req, res) {
    req.checkBody({
      username: {
        notEmpty: {errorMessage: res.t('missingUsername')},
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let issues = await verifyUsername(req.body.username, res);

    let count = await User.count({ 'auth.local.lowerCaseUsername': req.body.username.toLowerCase() });
    if (count > 0)  issues.push(res.t('usernameTaken'));

    if (issues.length > 0) {
      res.respond(200, { isUsable: false, issues });
    } else {
      res.respond(200, { isUsable: true });
    }
  },
};

/*
* NOTE most user routes are still in the v3 controller
* here there are only routes that had to be split from the v3 version because of
* some breaking change (for example because their returned the entire user object).
*/

/* NOTE this route has also an API v3 version */

/**
 * @api {post} /api/v4/user/auth/local/register Register
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
    await authLib.registerLocal(req, res, { isV3: false });
  },
};

module.exports = api;
