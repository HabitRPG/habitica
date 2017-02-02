import locals from '../../middlewares/locals';
import { decrypt } from '../../libs/encryption';
import moment from 'moment';
import { model as User } from '../../models/user';
import * as passwordUtils from '../../libs/password';

let api = {};

// Internal authentication routes

// TODO
// - convert to bcrypt
// - tests

// returns the user if a valid password reset code is supplied, otherwise false
async function validatePasswordResetCodeAndFindUser (code) {
  let isCodeValid = true;

  let userId;

  // wrapping the code in a try to be able to handle the error here
  try {
    let decryptedPasswordResetCode = JSON.parse(decrypt(code || 'invalid')); // also catches missing code
    userId = decryptedPasswordResetCode.userId;
    let expiresAt = decryptedPasswordResetCode.expiresAt;

    if (moment(expiresAt).isAfter(moment())) throw new Error();
  } catch (err) {
    isCodeValid = false;
  }

  let user = await User.findById(userId).exec();
  // check if user is found and if it's an email & password account
  if (!user || !user.auth || !user.auth.local || !user.auth.local.email) isCodeValid = false;

  return isCodeValid ? user : false;
}

function renderPasswordResetPage (res, hasError, message) {
  return res.status(hasError ? 200 : 401).render('static/reset-password-set-new-one.jade', {
    env: res.locals.habitrpg,
    hasError,
    message, // can be error or success message
  });
}

// Set a new password after having requested a password reset (GET route to input password)
api.resetPasswordSetNewOne  = {
  method: 'GET',
  url: '/static/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    if (!isValidCode) {
      return renderPasswordResetPage(res, !isValidCode, res.t('invalidPasswordResetCode'));
    } else {
      return renderPasswordResetPage(res, false);
    }
  },
};

// Set a new password after having requested a password reset (POST route to save password)
api.resetPasswordSetNewOneSubmit  = {
  method: 'POST',
  url: '/static/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    if (!isValidCode) return renderPasswordResetPage(res, true, res.t('invalidPasswordResetCode'));

    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (!newPassword || confirmPassword) {
      return renderPasswordResetPage(res, true, res.t('missingNewPassword'));
    }

    if (newPassword !== confirmPassword) {
      return renderPasswordResetPage(res, true, res.t('passwordConfirmationMatch'));
    }

    // set new password and make sure it's using bcrypt for hashing
    await passwordUtils.convertToBcrypt(user, newPassword);
    await user.save();

    return renderPasswordResetPage(res, false, res.t('passwordChangeSuccess'));
  },
};

// Logout the user from the website.
api.logout = {
  method: 'GET',
  url: '/logout',
  async handler (req, res) {
    if (req.logout) req.logout(); // passportjs method
    req.session = null;
    res.redirect('/');
  },
};

module.exports = api;
