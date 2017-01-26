import locals from '../../middlewares/locals';
import { decrypt } from '../../libs/encryption';
import moment from 'moment';
import { model as User } from '../../models/user';

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
    // - validate user being local
    // - convert to bcrypt
    // - tests
    // - set new one or set a automatically generated password?

    req.checkQuery('code', res.t('passwordResetCodeRequired')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let userId;
    // wrapping the code in a try to be able to handle the error here
    try {
      let decryptedPasswordResetCode = JSON.parse(decrypt(req.query.code));
      userId = decryptedPasswordResetCode.userId;
      let expiresAt = decryptedPasswordResetCode.expiresAt;

      if (moment(expiresAt).isAfter(moment())) throw new Error('EXPIRED_PASSWORD_RESET_CODE');
    } catch (err) {
      if (err.message === 'EXPIRED_PASSWORD_RESET_CODE') return; // TODO render expiration page
      // TODO render generic error page
    }

    let user = await User.findById(userId).exec();

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
