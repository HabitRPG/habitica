import {
  authWithSession,
} from '../../middlewares/api-v3/auth';

let api = {};

// Internal authentication routes

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
