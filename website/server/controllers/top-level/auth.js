import locals from '../../middlewares/locals';
import { validatePasswordResetCodeAndFindUser, convertToBcrypt} from '../../libs/password';

let api = {};

// Internal authentication routes

// TODO
// - tests

function renderPasswordResetPage (res, hasError, message) {
  return res.status(hasError ? 200 : 401).render('auth/reset-password-set-new-one.jade', {
    env: res.locals.habitrpg,
    hasError,
    message, // can be error or success message
  });
}

// Set a new password after having requested a password reset (GET route to input password)
api.resetPasswordSetNewOne  = {
  method: 'GET',
  url: '/auth/reset-password-set-new-one',
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
  url: '/auth/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    if (!isValidCode) return renderPasswordResetPage(res, true, res.t('invalidPasswordResetCode'));

    let newPassword = String(req.body.newPassword);
    let confirmPassword = String(req.body.confirmPassword);

    if (!newPassword) {
      return renderPasswordResetPage(res, true, res.t('missingNewPassword'));
    }

    if (newPassword !== confirmPassword) {
      return renderPasswordResetPage(res, true, res.t('passwordConfirmationMatch'));
    }

    // set new password and make sure it's using bcrypt for hashing
    await convertToBcrypt(user, newPassword);
    user.auth.local.passwordResetCode = undefined; // Reset saved password reset code
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
