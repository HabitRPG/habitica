var _ = require('lodash');
var validator = require('validator');
var passport = require('passport');
var shared = require('../../../common');
var async = require('async');
var utils = require('../utils');
var nconf = require('nconf');
var request = require('request');
var User = require('../models/user').model;
var EmailUnsubscription = require('../models/emailUnsubscription').model;
var analytics = utils.analytics;
var i18n = require('./../i18n');

var isProd = nconf.get('NODE_ENV') === 'production';

var api = module.exports;

var NO_TOKEN_OR_UID = { err: "You must include a token and uid (user id) in your request"};
var NO_USER_FOUND = {err: "No user found."};
var NO_SESSION_FOUND = { err: "You must be logged in." };
var accountSuspended = function(uuid){
  return {
    err: 'Account has been suspended, please contact leslie@habitica.com with your UUID ('+uuid+') for assistance.',
    code: 'ACCOUNT_SUSPENDED'
  };
}
// Allow case-insensitive regex searching for Mongo queries. See http://stackoverflow.com/a/3561711/362790
var RegexEscape = function(s){
  return new RegExp('^' + s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
}

api.auth = function(req, res, next) {
  var uid = req.headers['x-api-user'];
  var token = req.headers['x-api-key'];
  if (!(uid && token)) return res.json(401, NO_TOKEN_OR_UID);
  User.findOne({_id: uid,apiToken: token}, function(err, user) {
    if (err) return next(err);
    if (_.isEmpty(user)) return res.json(401, NO_USER_FOUND);
    if (user.auth.blocked) return res.json(401, accountSuspended(user._id));

    res.locals.wasModified = req.query._v ? +user._v !== +req.query._v : true;
    res.locals.user = user;
    req.session.userId = user._id;
    return next();
  });
};

api.authWithSession = function(req, res, next) { //[todo] there is probably a more elegant way of doing this...
  if (!(req.session && req.session.userId))
    return res.json(401, NO_SESSION_FOUND);
  User.findOne({_id: req.session.userId}, function(err, user) {
    if (err) return next(err);
    if (_.isEmpty(user)) return res.json(401, NO_USER_FOUND);
    res.locals.user = user;
    next();
  });
};

api.authWithUrl = function(req, res, next) {
  User.findOne({_id:req.query._id, apiToken:req.query.apiToken}, function(err,user){
    if (err) return next(err);
    if (_.isEmpty(user)) return res.json(401, NO_USER_FOUND);
    res.locals.user = user;
    next();
  });
}

api.registerUser = function(req, res, next) {
  var regEmail = RegexEscape(req.body.email),
    regUname = RegexEscape(req.body.username);
  async.auto({
    validate: function(cb) {
      if (!(req.body.username && req.body.password && req.body.email))
        return cb({code:401, err: ":username, :email, :password, :confirmPassword required"});
      if (req.body.password !== req.body.confirmPassword)
        return cb({code:401, err: ":password and :confirmPassword don't match"});
      if (!validator.isEmail(req.body.email))
        return cb({code:401, err: ":email invalid"});
      cb();
    },
    findReg: function(cb) {
      User.findOne({$or:[{'auth.local.email': regEmail}, {'auth.local.username': regUname}]}, {'auth.local':1}, cb);
    },
    findFacebook: function(cb){
      User.findOne({_id: req.headers['x-api-user'], apiToken: req.headers['x-api-key']}, {auth:1}, cb);
    },
    register: ['validate', 'findReg', 'findFacebook', function(cb, data) {
      if (data.findReg) {
        if (regEmail.test(data.findReg.auth.local.email)) return cb({code:401, err:"Email already taken"});
        if (regUname.test(data.findReg.auth.local.username)) return cb({code:401, err:"Username already taken"});
      }
      var salt = utils.makeSalt();
      var newUser = {
        auth: {
          local: {
            username: req.body.username,
            email: req.body.email,
            salt: salt,
            hashed_password: utils.encryptPassword(req.body.password, salt)
          },
          timestamps: {created: +new Date(), loggedIn: +new Date()}
        }
      };
      // existing user, allow them to add local authentication
      if (data.findFacebook) {
        data.findFacebook.auth.local = newUser.auth.local;
        data.findFacebook.save(cb);
      // new user, register them
      } else {
        newUser.preferences = newUser.preferences || {};
        newUser.preferences.language = req.language; // User language detected from browser, not saved
        var user = new User(newUser);

        var analyticsData = {
          category: 'acquisition',
          type: 'local',
          gaLabel: 'local'
        };
        analytics.track('register', analyticsData)

        user.save(function(err, savedUser){
          // Clean previous email preferences
          EmailUnsubscription.remove({email: savedUser.auth.local.email}, function(){
            utils.txnEmail(savedUser, 'welcome');
          });
          cb.apply(cb, arguments);
        });
      }
    }]
  }, function(err, data) {
    if (err) return err.code ? res.json(err.code, err) : next(err);
    res.json(200, data.register[0]);
  });
};

/*
 Register new user with uname / password
 */


api.loginLocal = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  if (!(username && password)) return res.json(401, {err:'Missing :username or :password in request body, please provide both'});
  var login = validator.isEmail(username) ? {'auth.local.email':username} : {'auth.local.username':username};
  User.findOne(login, {auth:1}, function(err, user){
    if (err) return next(err);
    if (!user) return res.json(401, {err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\"."});
    if (user.auth.blocked) return res.json(401, accountSuspended(user._id));
    // We needed the whole user object first so we can get his salt to encrypt password comparison
    User.findOne(
      {$and: [login, {'auth.local.hashed_password': utils.encryptPassword(password, user.auth.local.salt)}]}
    , {_id:1, apiToken:1}
    , function(err, user){
      if (err) return next(err);
      if (!user) return res.json(401,{err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\"."});
      res.json({id: user._id,token: user.apiToken});
      password = null;
    });
  });
};

/*
 POST /user/auth/social
 */
api.loginSocial = function(req, res, next) {
  var access_token = req.body.authResponse.access_token,
    network = req.body.network;
  if (network!=='facebook')
    return res.json(401, {err:"Only Facebook supported currently."});
  async.auto({
    profile: function (cb) {
      passport._strategies[network].userProfile(access_token, cb);
    },
    user: ['profile', function (cb, results) {
      var q = {};
      q['auth.' + network + '.id'] = results.profile.id;
      User.findOne(q, {_id: 1, apiToken: 1, auth: 1}, cb);
    }],
    register: ['profile', 'user', function (cb, results) {
      if (results.user) return cb(null, results.user);
      // Create new user
      var prof = results.profile;
      var user = {
        preferences: {
          language: req.language // User language detected from browser, not saved
        },
        auth: {
          timestamps: {created: +new Date(), loggedIn: +new Date()}
        }
      };
      user.auth[network] = prof;
      user = new User(user);
      user.save(function(err, savedUser){
        // Clean previous email preferences
        if(savedUser.auth.facebook.emails && savedUser.auth.facebook.emails[0] && savedUser.auth.facebook.emails[0].value){
          EmailUnsubscription.remove({email: savedUser.auth.facebook.emails[0].value}, function(){
            utils.txnEmail(savedUser, 'welcome');
          });
        }
        cb.apply(cb, arguments);
      });

      var analyticsData = {
        category: 'acquisition',
        type: network,
        gaLabel: network
      };
      analytics.track('register', analyticsData)
    }]
  }, function(err, results){
    if (err) return res.json(401, {err: err.toString ? err.toString() : err});
    var acct = results.register[0] ? results.register[0] : results.register;
    if (acct.auth.blocked) return res.json(401, accountSuspended(acct._id));
    return res.json(200, {id:acct._id, token:acct.apiToken});
  })
};

/**
 * DELETE /user/auth/social
 */
api.deleteSocial = function(req,res,next){
  if (!res.locals.user.auth.local.username)
    return res.json(401, {err:"Account lacks another authentication method, can't detach Facebook"});
  //FIXME for some reason, the following gives https://gist.github.com/lefnire/f93eb306069b9089d123
  //res.locals.user.auth.facebook = null;
  //res.locals.user.auth.save(function(err, saved){
  User.update({_id:res.locals.user._id}, {$unset:{'auth.facebook':1}}, function(err){
    if (err) return next(err);
    res.send(200);
  })
}

api.resetPassword = function(req, res, next){
  var email = req.body.email,
    salt = utils.makeSalt(),
    newPassword =  utils.makeSalt(), // use a salt as the new password too (they'll change it later)
    hashed_password = utils.encryptPassword(newPassword, salt);

  User.findOne({'auth.local.email': RegexEscape(email)}, function(err, user){
    if (err) return next(err);
    if (!user) return res.send(401, {err:"Sorry, we can't find a user registered with email " + email + "\n- Make sure your email address is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login."});
    user.auth.local.salt = salt;
    user.auth.local.hashed_password = hashed_password;
    utils.sendEmail({
      from: "Habitica <admin@habitica.com>",
      to: email,
      subject: "Password Reset for Habitica",
      text: "Password for " + user.auth.local.username + " has been reset to " + newPassword + " Important! Both username and password are case-sensitive -- you must enter both exactly as shown here. We recommend copying and pasting both instead of typing them. Log in at https://habitica.com/. After you've logged in, head to https://habitica.com/#/options/settings/settings and change your password.",
      html: "Password for <strong>" + user.auth.local.username + "</strong> has been reset to <strong>" + newPassword + "</strong><br /><br />Important! Both username and password are case-sensitive -- you must enter both exactly as shown here. We recommend copying and pasting both instead of typing them.<br /><br />Log in at https://habitica.com/. After you've logged in, head to https://habitica.com/#/options/settings/settings and change your password."
    });
    // TODO: change all four instances of habitica.com above to use BASE_URL when it has been updated. Previous version: https://github.com/HabitRPG/habitrpg/blob/2069936603aca7f8139a6c98e063136248262bdf/website/src/controllers/auth.js#L249
    user.save(function(err){
      if(err) return next(err);
      res.send('New password sent to '+ email);
      email = salt = newPassword = hashed_password = null;
    });
  });
};

var invalidPassword = function(user, password){
  var hashed_password = utils.encryptPassword(password, user.auth.local.salt);
  if (hashed_password !== user.auth.local.hashed_password)
    return {code:401, err:"Incorrect password"};
  return false;
}

api.changeUsername = function(req, res, next) {
  async.waterfall([
    function(cb){
      User.findOne({'auth.local.username': RegexEscape(req.body.username)}, {auth:1}, cb);
    },
    function(found, cb){
      if (found) return cb({code:401, err: "Username already taken"});
      if (invalidPassword(res.locals.user, req.body.password)) return cb(invalidPassword(res.locals.user, req.body.password));
      res.locals.user.auth.local.username = req.body.username;
      res.locals.user.save(cb);
    }
  ], function(err){
    if (err) return err.code ? res.json(err.code, err) : next(err);
    res.send(200);
  })
}

api.changeEmail = function(req, res, next){
  async.waterfall([
    function(cb){
      User.findOne({'auth.local.email': RegexEscape(req.body.email)}, {auth:1}, cb);
    },
    function(found, cb){
      if(found) return cb({code:401, err: "Email already taken"});
      if (invalidPassword(res.locals.user, req.body.password)) return cb(invalidPassword(res.locals.user, req.body.password));
      res.locals.user.auth.local.email = req.body.email;
      res.locals.user.save(cb);
    }
  ], function(err){
    if (err) return err.code ? res.json(err.code,err) : next(err);
    res.send(200);
  })
}

api.changePassword = function(req, res, next) {
  var user = res.locals.user,
    oldPassword = req.body.oldPassword,
    newPassword = req.body.newPassword,
    confirmNewPassword = req.body.confirmNewPassword;

  if (newPassword != confirmNewPassword)
    return res.json(401, {err: "Password & Confirm don't match"});

  var salt = user.auth.local.salt,
    hashed_old_password = utils.encryptPassword(oldPassword, salt),
    hashed_new_password = utils.encryptPassword(newPassword, salt);

  if (hashed_old_password !== user.auth.local.hashed_password)
    return res.json(401, {err:"Old password doesn't match"});

  user.auth.local.hashed_password = hashed_new_password;
  user.save(function(err, saved){
    if (err) next(err);
    res.send(200);
  })
}

/*
 Registers a new user. Only accepting username/password registrations, no Facebook
 */

api.setupPassport = function(router) {

  router.get('/logout', i18n.getUserLanguage, function(req, res) {
    req.logout();
    delete req.session.userId;
    res.redirect('/');
  })

};
