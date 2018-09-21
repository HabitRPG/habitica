import {
  authWithHeaders,
} from '../../middlewares/auth';
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
  let bannedSlursMatched = getMatchesByWordArray(username, forbiddenUsernames);
  return bannedSlursMatched.length > 0;
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

    if (usernameContainsSlur(newUsername)) throw new BadRequest(res.t('bannedSlurUsedUsername'));
    if (usernameIsForbidden(newUsername)) throw new BadRequest(res.t('forbiddenUsernameUsed'));

    let password = req.body.password;
    if (password !== undefined) {
      let isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));
    }

    let count = await User.count({ 'auth.local.lowerCaseUsername': req.body.username.toLowerCase() });
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
module.exports = api;
