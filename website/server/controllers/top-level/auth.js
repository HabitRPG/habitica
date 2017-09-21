import locals from '../../middlewares/locals';
import { validatePasswordResetCodeAndFindUser } from '../../libs/password';

let api = {};

// Internal authentication routes

// Set a new password after having requested a password reset (GET route to input password)
api.resetPasswordSetNewOne  = {
  method: 'GET',
  url: '/static/user/auth/local/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    let user = await validatePasswordResetCodeAndFindUser(req.query.code);
    let isValidCode = Boolean(user);

    const hasError = !isValidCode;
    const message = !isValidCode ? res.t('invalidPasswordResetCode') : null;

    return res.redirect(`/reset-password?hasError=${hasError}&message=${message}`);
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
