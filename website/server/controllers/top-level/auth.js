import { validatePasswordResetCodeAndFindUser } from '../../libs/password';

const api = {};

// Internal authentication routes

// Set a new password after having requested a password reset (GET route to input password)
api.resetPasswordSetNewOne = {
  method: 'GET',
  url: '/static/user/auth/local/reset-password-set-new-one',
  runCron: false,
  async handler (req, res) {
    const { code } = req.query;
    const user = await validatePasswordResetCodeAndFindUser(code);
    const isValidCode = Boolean(user);

    const hasError = !isValidCode;
    const message = !isValidCode ? res.t('invalidPasswordResetCode') : null;

    return res.redirect(`/reset-password?hasError=${hasError}&message=${message}&code=${code}`);
  },
};

// Logout the user from the website.
api.logout = {
  method: 'GET',
  url: '/logout-server',
  async handler (req, res) {
    if (req.logout) req.logout(); // passportjs method
    req.session = null;

    const redirectUrl = req.query.redirectToLogin === 'true' ? '/login' : '/';
    res.redirect(redirectUrl);
  },
};

export default api;
