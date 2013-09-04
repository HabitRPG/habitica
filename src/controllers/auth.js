var passport = require('passport');
var _ = require('lodash');
var async = require('async');
var derbyAuthUtil = require('derby-auth/utils');
var User = require('../models/user').model;

var api = module.exports;

var NO_TOKEN_OR_UID = { err: "You must include a token and uid (user id) in your request"};
var NO_USER_FOUND = {err: "No user found."};

/*
 beforeEach auth interceptor
 */

api.auth = function(req, res, next) {
  var token, uid;
  uid = req.headers['x-api-user'];
  token = req.headers['x-api-key'];
  if (!(uid && token)) {
    return res.json(401, NO_TOKEN_OR_UID);
  }
  return User.findOne({
    _id: uid,
    apiToken: token
  }, function(err, user) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    if (_.isEmpty(user)) {
      return res.json(401, NO_USER_FOUND);
    }
    res.locals.wasModified = +user._v !== +req.query._v;
    res.locals.user = user;
    req.session.userId = user._id;
    return next();
  });
};


api.registerUser = function(req, res, next) {
  var confirmPassword, e, email, password, username, _ref;
  _ref = req.body, email = _ref.email, username = _ref.username, password = _ref.password, confirmPassword = _ref.confirmPassword;
  if (!(username && password && email)) {
    return res.json(401, {
      err: ":username, :email, :password, :confirmPassword required"
    });
  }
  if (password !== confirmPassword) {
    return res.json(401, {
      err: ":password and :confirmPassword don't match"
    });
  }
  try {
    validator.check(email).isEmail();
  } catch (_error) {
    e = _error;
    return res.json(401, {
      err: e.message
    });
  }
  return async.waterfall([
    function(cb) {
      return User.findOne({
        'auth.local.email': email
      }, cb);
    }, function(found, cb) {
      if (found) {
        return cb("Email already taken");
      }
      return User.findOne({
        'auth.local.username': username
      }, cb);
    }, function(found, cb) {
      var newUser, salt, user;
      if (found) {
        return cb("Username already taken");
      }
      newUser = helpers.newUser(true);
      salt = derbyAuthUtil.makeSalt();
      newUser.auth = {
        local: {
          username: username,
          email: email,
          salt: salt
        }
      };
      newUser.auth.local.hashed_password = derbyAuthUtil.encryptPassword(password, salt);
      user = new User(newUser);
      return user.save(cb);
    }
  ], function(err, saved) {
    if (err) {
      return res.json(401, {
        err: err
      });
    }
    return res.json(200, saved);
  });
};

/*
 Register new user with uname / password
 */


api.loginLocal = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  async.waterfall([
    function(cb) {
      if (!(username && password)) return cb('No username or password');
      User.findOne({'auth.local.username': username}, cb);
    }, function(user, cb) {
      if (!user) return cb('Username not found');
      // We needed the whole user object first so we can get his salt to encrypt password comparison
      User.findOne({
        'auth.local.username': username,
        'auth.local.hashed_password': derbyAuthUtil.encryptPassword(password, user.auth.local.salt)
      }, cb);
    }
  ], function(err, user) {
    if (!user) err = 'Incorrect password';
    if (err) return res.json(401, {err: err});
    res.json(200, {
      id: user._id,
      token: user.apiToken
    });
  });
};

/*
 POST /user/auth/facebook
 */


api.loginFacebook = function(req, res, next) {
  var email, facebook_id, name, _ref;
  _ref = req.body, facebook_id = _ref.facebook_id, email = _ref.email, name = _ref.name;
  if (!facebook_id) {
    return res.json(401, {
      err: 'No facebook id provided'
    });
  }
  return User.findOne({
    'auth.local.facebook.id': facebook_id
  }, function(err, user) {
    if (err) {
      return res.json(401, {
        err: err
      });
    }
    if (user) {
      return res.json(200, {
        id: user.id,
        token: user.apiToken
      });
    } else {
      /* FIXME: create a new user instead*/

      return res.json(403, {
        err: "Please register with Facebook on https://habitrpg.com, then come back here and log in."
      });
    }
  });
};

/*
 Registers a new user. Only accepting username/password registrations, no Facebook
 */

api.setupPassport = function(router) {

  router.get('/logout', function(req, res) {
    req.logout();
    delete req.session.userId;
    res.redirect('/');
  })

  // GET /auth/facebook
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Facebook authentication will involve
  //   redirecting the user to facebook.com.  After authorization, Facebook will
  //   redirect the user back to this application at /auth/facebook/callback
  router.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res){
      // The request will be redirected to Facebook for authentication, so this
      // function will not be called.
    });

  // GET /auth/facebook/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      //res.redirect('/');

      User.findOne({'auth.facebook.id':req.user.id}, function(err, user){
        if (err || !user) {
          if (!err) err = "New Facebook registrations aren't yet supported, only existing Facebook users. Help us code this!";
          return res.redirect('/#/facebook-callback?err=' + err);
        }
        res.redirect('/#/facebook-callback?_id='+user._id+'&apiToken='+user.apiToken);
      })

    });

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
//  function ensureAuthenticated(req, res, next) {
//    if (req.isAuthenticated()) { return next(); }
//    res.redirect('/login')
//  }
};