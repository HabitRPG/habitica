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
    // - convert to bcrypt
    // - tests
    // - set new one or set a automatically generated password?
    let isCodeValid = true;

    let userId;

    // wrapping the code in a try to be able to handle the error here
    try {
      let decryptedPasswordResetCode = JSON.parse(decrypt(req.query.code || 'invalid')); // also catches missing code
      userId = decryptedPasswordResetCode.userId;
      let expiresAt = decryptedPasswordResetCode.expiresAt;

      if (moment(expiresAt).isAfter(moment())) throw new Error();
    } catch (err) {
      isCodeValid = false;
    }

    let user = await User.findById(userId).exec();
    // check if user is found and if it's an email & password account
    if (!user || !user.auth || !user.auth.local || !user.auth.local.email) isCodeValid = false;

    return res.status(isCodeValid ? 200 : 401).render('static/reset-password-set-new-one.jade', {
      env: res.locals.habitrpg,
      isCodeValid,
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
