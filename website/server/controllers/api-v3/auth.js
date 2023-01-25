import validator from 'validator';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
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
import { encrypt } from '../../libs/encryption';
import {
  loginRes,
  hasBackupAuth,
  loginSocial,
  registerLocal,
  socialEmailToLocal,
} from '../../libs/auth';
import { verifyUsername } from '../../libs/user/validation';

const BASE_URL = nconf.get('BASE_URL');
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');

const api = {};

/**
 * @api {post} /api/v3/user/auth/local/register Register
 * @apiDescription Register a new user with email, login name, and password or
 * attach local authentication to a social auth user
 * @apiName UserRegisterLocal
 * @apiGroup User
 *
 * @apiParam (Body) {String} username Login name of the new user.
 *                                    Must be 1-36 characters, containing only a-z, 0-9,
 *                                    hyphens (-), or underscores (_).
 * @apiParam (Body) {String} email Email address of the new user
 * @apiParam (Body) {String} password Password for the new user
 * @apiParam (Body) {String} confirmPassword Password confirmation
 *
 * @apiSuccess {Object} data The user object, if local auth was just
 *                           attached to a social user then only user.auth.local
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
 * @apiSuccess {String} data.apiToken The user's api token
 *                                    that must be used to authenticate requests.
 * @apiSuccess {Boolean} data.newUser Returns true if the user was just created
 *                                    (always false for local login).
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
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    req.sanitizeBody('username').trim();
    req.sanitizeBody('password').trim();

    let login;
    const { username } = req.body;
    const { password } = req.body;

    if (validator.isEmail(String(username))) {
      login = { 'auth.local.email': username.toLowerCase() }; // Emails are stored lowercase
    } else {
      login = { 'auth.local.username': username };
    }

    // load the entire user because we may have to save it to convert the password to bcrypt
    const user = await User.findOne(login).exec();

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

    return loginRes(user, req, res);
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
    await loginSocial(req, res);
  },
};

// Called by apple for web authentication.
api.redirectApple = {
  method: 'POST',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  url: '/user/auth/apple',
  async handler (req, res) {
    if (req.body.id_token) {
      req.body.network = 'apple';
      return loginSocial(req, res);
    }
    let url = `/static/apple-redirect?code=${req.body.code}`;
    if (req.body.user) {
      const parsedBody = JSON.parse(req.body.user);
      if (parsedBody && parsedBody.name) {
        url += `&name=${parsedBody.name.firstName} ${parsedBody.name.lastName}`;
      }
    }
    return res.redirect(303, url);
  },
};

// Called as a callback by Apple. Internal route
// Can be passed `code` and `name` as query parameters
api.loginApple = {
  method: 'GET',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  url: '/user/auth/apple',
  async handler (req, res) {
    req.body.network = 'apple';
    return loginSocial(req, res);
  },
};

/**
 * @api {put} /api/v3/user/auth/update-username Update username
 * @apiDescription Update and verify the user's username
 * @apiName UpdateUsername
 * @apiGroup User
 *
 * @apiParam (Body) {String} username The new username
 * @apiParam (Body) {String} password The user's password if they use local authentication.
 * Omit if they use social auth.
 *
 * @apiSuccess {String} data.username The new username
 * */
api.updateUsername = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-username',
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody({
      username: {
        notEmpty: { errorMessage: res.t('missingUsername') },
      },
    });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const newUsername = req.body.username;

    const issues = verifyUsername(newUsername, res, false);
    if (issues.length > 0) throw new BadRequest(issues.join(' '));

    const { password } = req.body;
    if (password !== undefined) {
      const isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));
    }

    const existingUser = await User.findOne({ 'auth.local.lowerCaseUsername': newUsername.toLowerCase() }, { auth: 1 }).exec();
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

    // reward user for verifying their username
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
 * @api {put} /api/v3/user/auth/update-password Update password
 * @apiDescription Update the password of a local user
 * @apiName UpdatePassword
 * @apiGroup User
 *
 * @apiParam (Body) {String} password The old password
 * @apiParam (Body) {String} newPassword The new password
 * @apiParam (Body) {String} confirmPassword New password confirmation
 *
 * @apiSuccess {Object} data An empty object
 * */
api.updatePassword = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/auth/update-password',
  async handler (req, res) {
    const { user } = res.locals;

    if (!user.auth.local.hashed_password) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody({
      password: {
        notEmpty: { errorMessage: res.t('missingPassword') },
      },
      newPassword: {
        notEmpty: { errorMessage: res.t('missingNewPassword') },
        isLength: {
          options: {
            min: common.constants.MINIMUM_PASSWORD_LENGTH,
            max: common.constants.MAXIMUM_PASSWORD_LENGTH,
          },
          errorMessage: res.t('passwordIssueLength'),
        },
      },
      confirmPassword: {
        notEmpty: { errorMessage: res.t('missingNewPassword') },
      },
    });

    const validationErrors = req.validationErrors();

    if (validationErrors) {
      throw validationErrors;
    }

    const oldPassword = req.body.password;
    const isValidPassword = await passwordUtils.compare(user, oldPassword);
    if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));

    const { newPassword } = req.body;
    if (newPassword !== req.body.confirmPassword) throw new NotAuthorized(res.t('passwordConfirmationMatch'));

    // set new password and make sure it's using bcrypt for hashing
    await passwordUtils.convertToBcrypt(user, newPassword);
    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/user/reset-password Reset password (email a reset link)
 * @apiDescription Send the user an email to let them reset their password
 * @apiName ResetPassword
 * @apiGroup User
 *
 * @apiParam (Body) {String} email The email address of the user
 *
 * @apiSuccess {String} message The localized success message
 * */
api.resetPassword = {
  method: 'POST',
  middlewares: [],
  url: '/user/reset-password',
  async handler (req, res) {
    req.checkBody({
      email: {
        notEmpty: { errorMessage: res.t('missingEmail') },
      },
    });
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const email = req.body.email.toLowerCase();
    let user = await User.findOne(
      { 'auth.local.email': email }, // Prefer to reset password for local auth
      { auth: 1 },
    ).exec();
    if (!user) { // If no local auth with that email...
      const potentialUsers = await User.find({
        $or: [
          { 'auth.local.username': email.replace(/^@/, '') },
          { 'auth.apple.emails.value': email },
          { 'auth.google.emails.value': email },
          { 'auth.facebook.emails.value': email },
        ],
      },
      { auth: 1 }).exec();
      // ...prefer oldest social account or username with matching email
      [user] = sortBy(potentialUsers, candidate => candidate.auth.timestamps.created);
    }

    if (user) {
      // create an encrypted link to be used to reset the password
      const passwordResetCode = encrypt(JSON.stringify({
        userId: user._id,
        expiresAt: moment().add({ hours: 24 }),
      }));
      const link = `${BASE_URL}/static/user/auth/local/reset-password-set-new-one?code=${passwordResetCode}`;

      user.auth.local.passwordResetCode = passwordResetCode;

      sendTxnEmail(user, 'reset-password', [
        { name: 'PASSWORD_RESET_LINK', content: link },
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
    const { user } = res.locals;

    if (!user.auth.local.email) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    if (user.auth.local.hashed_password) {
      req.checkBody('password', res.t('missingPassword')).notEmpty();
    }
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const emailAlreadyInUse = await User.findOne({
      'auth.local.email': req.body.newEmail.toLowerCase(),
    }).select({ _id: 1 }).lean().exec();

    if (emailAlreadyInUse) throw new NotAuthorized(res.t('cannotFulfillReq', { techAssistanceEmail: TECH_ASSISTANCE_EMAIL }));

    if (user.auth.local.hashed_password) {
      const { password } = req.body;
      const isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));

      // if password is using old sha1 encryption, change it
      if (user.auth.local.passwordHashMethod === 'sha1') {
        await passwordUtils.convertToBcrypt(user, password);
      }
    }

    user.auth.local.email = req.body.newEmail.toLowerCase();
    await user.save();

    return res.respond(200, { email: user.auth.local.email });
  },
};

/**
 * @api {post} /api/v3/user/auth/reset-password-set-new-one Reset password (set a new one)
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
    const user = await passwordUtils.validatePasswordResetCodeAndFindUser(req.body.code);
    const isValidCode = Boolean(user);

    if (!isValidCode) throw new NotAuthorized(res.t('invalidPasswordResetCode'));

    req.checkBody({
      newPassword: {
        notEmpty: { errorMessage: res.t('missingNewPassword') },
        isLength: {
          options: { min: common.constants.MINIMUM_PASSWORD_LENGTH },
          errorMessage: res.t('minPasswordLength'),
        },
      },
      confirmPassword: {
        notEmpty: { errorMessage: res.t('missingNewPassword') },
      },
    });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      throw new BadRequest(res.t('passwordConfirmationMatch'));
    }

    // set new password and make sure it's using bcrypt for hashing
    await passwordUtils.convertToBcrypt(user, String(newPassword));
    user.auth.local.passwordResetCode = undefined; // Reset saved password reset code
    if (!user.auth.local.email) user.auth.local.email = await socialEmailToLocal(user);
    await user.save();

    return res.respond(200, {}, res.t('passwordChangeSuccess'));
  },
};

/**
 * @api {delete} /api/v3/user/auth/social/:network Delete social authentication method
 * @apiDescription Remove a social authentication method from a user profile.
 * The user must have another authentication method enabled.
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
    const { user } = res.locals;
    const { network } = req.params;
    const isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS
      .find(supportedNetwork => supportedNetwork.key === network);
    if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));
    if (!hasBackupAuth(user, network)) throw new NotAuthorized(res.t('cantDetachSocial'));
    const unset = {
      [`auth.${network}`]: 1,
    };
    await User.update({ _id: user._id }, { $unset: unset }).exec();

    res.respond(200, {});
  },
};

export default api;
