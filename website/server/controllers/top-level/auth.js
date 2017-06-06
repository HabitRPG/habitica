import locals from '../../middlewares/locals';
import { validatePasswordResetCodeAndFindUser, convertToBcrypt} from '../../libs/password';

let api = {};

// Internal authentication routes

function renderPasswordResetPage (options = {}) {
  // res is express' res, error any error and success if the password was successfully changed
  let {res, hasError, success = false, message} = options;

  return res.status(hasError ? 401 : 200).render('auth/reset-password-set-new-one.jade', {
    env: res.locals.habitrpg,
    success,
    hasError,
    message, // can be error or success message
  });
}

// Set a new password after having requested a password reset (GET route to input password)
api.resetPasswordSetNewOne  = {
  method: 'GET',
  url: '/static/user/auth/local/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    return renderPasswordResetPage({
      res,
      hasError: !isValidCode,
      message: !isValidCode ? res.t('invalidPasswordResetCode') : null,
    });
  },
};

// Set a new password after having requested a password reset (POST route to save password)
api.resetPasswordSetNewOneSubmit  = {
  method: 'POST',
  url: '/static/user/auth/local/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    if (!isValidCode) return renderPasswordResetPage({
      res,
      hasError: true,
      message: res.t('invalidPasswordResetCode'),
    });

    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (!newPassword) {
      return renderPasswordResetPage({
        res,
        hasError: true,
        message: res.t('missingNewPassword'),
      });
    }

    if (newPassword !== confirmPassword) {
      return renderPasswordResetPage({
        res,
        hasError: true,
        message: res.t('passwordConfirmationMatch'),
      });
    }

    // set new password and make sure it's using bcrypt for hashing
    await convertToBcrypt(user, String(newPassword));
    user.auth.local.passwordResetCode = undefined; // Reset saved password reset code
    await user.save();

    return renderPasswordResetPage({
      res,
      hasError: false,
      success: true,
      message: res.t('passwordChangeSuccess'),
    });
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
