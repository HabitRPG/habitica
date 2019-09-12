import validator from 'validator';
import moment from 'moment';
import nconf from 'nconf';
import {
  authWithHeaders,
} from '../../middlewares/auth';
import { model as User } from '../../models/user';
import common from '../../../common';
import {
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';
import * as passwordUtils from '../../libs/password';
import { sendTxn as sendTxnEmail } from '../../libs/email';
import { validatePasswordResetCodeAndFindUser, convertToBcrypt} from '../../libs/password';
import { encrypt } from '../../libs/encryption';
import {
  loginRes,
  hasBackupAuth,
  loginSocial,
  registerLocal,
} from '../../libs/auth';
import {verifyUsername} from '../../libs/user/validation';

const BASE_URL = nconf.get('BASE_URL');
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');

let api = {};

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
    await registerLocal(req, res, { isV3: true });
  },
};

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

    // if user is using social login, then user will not have a hashed_password stored
    if (!user || !user.auth.local.hashed_password) throw new NotAuthorized(res.t('invalidLoginCredentialsLong'));

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

    return loginRes(user, ...arguments);
  },
};

// Called as a callback by Facebook (or other social providers). Internal route
api.loginSocial = {
  method: 'POST',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  url: '/user/auth/social',
  async handler (req, res) {
    return await loginSocial(req, res);
  },
};

/**
 * @api {put} /api/v3/user/auth/update-username Update username
 * @apiDescription Update the username of a local user
 * @apiName UpdateUsername
 * @apiGroup User
 *
 * @apiParam (Body) {String} username The new username

 * @apiSuccess {String} data.username The new username
 **/
api.updateUsername = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-username',
  async handler (req, res) {
    const user = res.locals.user;

    req.checkBody({
      username: {
        notEmpty: {errorMessage: res.t('missingUsername')},
      },
    });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newUsername = req.body.username;

    const issues = verifyUsername(newUsername, res);
    if (issues.length > 0) throw new BadRequest(issues.join(' '));

    const password = req.body.password;
    if (password !== undefined) {
      let isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));
    }

    const existingUser = await User.findOne({ 'auth.local.lowerCaseUsername': newUsername.toLowerCase() }, {auth: 1}).exec();
    if (existingUser !== undefined && existingUser !== null && existingUser._id !== user._id) {
      throw new BadRequest(res.t('usernameTaken'));
    }

    // if password is using old sha1 encryption, change it
    if (user.auth.local.passwordHashMethod === 'sha1' && password !== undefined) {
      await passwordUtils.convertToBcrypt(user, password); // user is saved a few lines below
    }

    // save username
    user.auth.local.lowerCaseUsername = newUsername.toLowerCase();
    user.auth.local.username = newUsername;
    if (!user.flags.verifiedUsername) {
      user.flags.verifiedUsername = true;
      if (user.items.pets['Bear-Veteran']) {
        user.items.pets['Fox-Veteran'] = 5;
      } else if (user.items.pets['Lion-Veteran']) {
        user.items.pets['Bear-Veteran'] = 5;
      } else if (user.items.pets['Tiger-Veteran']) {
        user.items.pets['Lion-Veteran'] = 5;
      } else if (user.items.pets['Wolf-Veteran']) {
        user.items.pets['Tiger-Veteran'] = 5;
      } else {
        user.items.pets['Wolf-Veteran'] = 5;
      }

      user.markModified('items.pets');
    }
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

      sendTxnEmail(user, 'reset-password', [
        {name: 'PASSWORD_RESET_LINK', content: link},
      ]);

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
 * @api {post} /api/v3/user/auth/reset-password-set-new-one Reset Password Set New one
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
