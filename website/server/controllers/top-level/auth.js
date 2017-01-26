import locals from '../../middlewares/locals';

let api = {};

// Internal authentication routes

// Set a new password after having requested a password reset
api.resetPasswordSetNewOne  = {
  method: 'GET',
  url: '/static/reset-password-set-new-one',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    // TODO
    // - validate code (and expiration)
    // - validate user being local
    // - convert to bcrypt
    // - tests
    // - set new one or set a automatically generated password?
    return res.render('static/reset-password-set-new-one.jade', {
      env: res.locals.habitrpg,
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
