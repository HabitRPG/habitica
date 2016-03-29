var _ = require('lodash');
var validator = require('validator');
var passport = require('passport');
var shared = require('../../../../common');
var async = require('async');
var utils = require('../../libs/utils');
var nconf = require('nconf');
var request = require('request');
var FirebaseTokenGenerator = require('firebase-token-generator');
var User = require('../../models/user').model;
var EmailUnsubscription = require('../../models/emailUnsubscription').model;
var analytics = utils.analytics;
var i18n = require('./../../libs/i18n');

var isProd = nconf.get('NODE_ENV') === 'production';

var api = module.exports;

var NO_TOKEN_OR_UID = { err: shared.i18n.t('messageAuthMustIncludeTokens') };
var NO_USER_FOUND = {err: shared.i18n.t('messageAuthNoUserFound') };
var NO_SESSION_FOUND = { err: shared.i18n.t('messageAuthMustBeLoggedIn') };
var accountSuspended = function(uuid){
  return {
    err: 'Account has been suspended, please contact leslie@habitica.com with your UUID ('+uuid+') for assistance.',
    code: 'ACCOUNT_SUSPENDED'
  };
}

api.auth = function(req, res, next) {
  var uid = req.headers['x-api-user'];
  var token = req.headers['x-api-key'];
  if (!(uid && token)) return res.status(401).json(NO_TOKEN_OR_UID);
  User.findOne({_id: uid, apiToken: token}, function(err, user) {
    if (err) return next(err);
    if (_.isEmpty(user)) return res.status(401).json(NO_USER_FOUND);
    if (user.auth.blocked) return res.status(401).json(accountSuspended(user._id));

    res.locals.wasModified = req.query._v ? +user._v !== +req.query._v : true;
    res.locals.user = user;
    req.session.userId = user._id;
    return next();
  });
};

api.authWithSession = function(req, res, next) { //[todo] there is probably a more elegant way of doing this...
  if (!(req.session && req.session.userId))
    return res.status(401).json(NO_SESSION_FOUND);
  User.findOne({_id: req.session.userId}, function(err, user) {
    if (err) return next(err);
    if (_.isEmpty(user)) return res.status(401).json(NO_USER_FOUND);
    res.locals.user = user;
    next();
  });
};

api.authWithUrl = function(req, res, next) {
  User.findOne({_id:req.query._id, apiToken:req.query.apiToken}, function(err,user){
    if (err) return next(err);
    if (_.isEmpty(user)) return res.status(401).json(NO_USER_FOUND);
    res.locals.user = user;
    next();
  });
}

api.registerUser = function(req, res, next) {
  var email = req.body.email && req.body.email.toLowerCase();
  var username = req.body.username;
  // Get the lowercase version of username to check that we do not have duplicates
  // So we can search for it in the database and then reject the choosen username if 1 or more results are found
  var lowerCaseUsername = username && username.toLowerCase();

  async.auto({
    validate: function(cb) {
      if (!(username && req.body.password && email))
        return cb({code:401, err: shared.i18n.t('messageAuthCredentialsRequired')});
      if (req.body.password !== req.body.confirmPassword)
        return cb({code:401, err: shared.i18n.t('messageAuthPasswordMustMatch')});
      if (!validator.isEmail(email))
        return cb({code:401, err: ":email invalid"});
      cb();
    },
    findReg: function(cb) {
      // Search for duplicates using lowercase version of username
      User.findOne({$or:[{'auth.local.email': email}, {'auth.local.lowerCaseUsername': lowerCaseUsername}]}, {'auth.local':1}, cb);
    },
    findFacebook: function(cb){
      User.findOne({_id: req.headers['x-api-user'], apiToken: req.headers['x-api-key']}, {auth:1}, cb);
    },
    register: ['validate', 'findReg', 'findFacebook', function(cb, data) {
      if (data.findReg) {
        if (email === data.findReg.auth.local.email) return cb({code:401, err:"Email already taken"});
        // Check that the lowercase username isn't already used
        if (lowerCaseUsername === data.findReg.auth.local.lowerCaseUsername) return cb({code:401, err: shared.i18n.t('messageAuthUsernameTaken')});
      }
      var salt = utils.makeSalt();
      var newUser = {
        auth: {
          local: {
            username: username,
            lowerCaseUsername: lowerCaseUsername, // Store the lowercase version of the username
            email: email, // Store email as lowercase
            salt: salt,
            hashed_password: utils.encryptPassword(req.body.password, salt)
          },
          timestamps: {created: +new Date(), loggedIn: +new Date()}
        }
      };
      // existing user, allow them to add local authentication
      if (data.findFacebook) {
        data.findFacebook.auth.local = newUser.auth.local;
        data.findFacebook.registeredThrough = newUser.registeredThrough;
        data.findFacebook.save(cb);
      // new user, register them
      } else {
        newUser.preferences = newUser.preferences || {};
        newUser.preferences.language = req.language; // User language detected from browser, not saved
        var user = new User(newUser);

        user.registeredThrough = req.headers['x-client'];
        var analyticsData = {
          category: 'acquisition',
          type: 'local',
          gaLabel: 'local',
          uuid: user._id,
        };
        analytics.track('register', analyticsData)

        user.save(function(err, savedUser){
          // Clean previous email preferences
          // TODO when emails added to EmailUnsubcription they should use lowercase version
          EmailUnsubscription.remove({email: savedUser.auth.local.email}, function(){
            utils.txnEmail(savedUser, 'welcome');
          });
          cb.apply(cb, arguments);
        });
      }
    }]
  }, function(err, data) {
    if (err) return err.code ? res.status(err.code).json(err) : next(err);
    res.status(200).json(data.register[0]);
  });
};

/*
 Register new user with uname / password
 */


api.loginLocal = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  if (!(username && password)) return res.status(401).json({err:'Missing :username or :password in request body, please provide both'});
  var login = validator.isEmail(username) ?
    {'auth.local.email':username.toLowerCase()} : // Emails are all lowercase
    {'auth.local.username':username}; // Use the username as the user typed it

  User.findOne(login, {auth:1}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).json({err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\" on the habitica.com website's login form."});
    if (user.auth.blocked) return res.status(401).json(accountSuspended(user._id));
    // We needed the whole user object first so we can get his salt to encrypt password comparison
    User.findOne(
      {$and: [login, {'auth.local.hashed_password': utils.encryptPassword(password, user.auth.local.salt)}]}
    , {_id:1, apiToken:1}
    , function(err, user){
      if (err) return next(err);
      if (!user) return res.status(401).json({err:"Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\" on the habitica.com website's login form."});
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
    return res.status(401).json({err:"Only Facebook supported currently."});
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
      user.registeredThrough = req.headers['x-client'];

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
        gaLabel: network,
        uuid: user._id,
      };
      analytics.track('register', analyticsData)
    }]
  }, function(err, results){
    if (err) return res.status(401).json({err: err.toString ? err.toString() : err});
    var acct = results.register[0] ? results.register[0] : results.register;
    if (acct.auth.blocked) return res.status(401).json(accountSuspended(acct._id));
    return res.status(200).json({id:acct._id, token:acct.apiToken});
  })
};

/**
 * DELETE /user/auth/social
 */
api.deleteSocial = function(req,res,next){
  if (!res.locals.user.auth.local.username)
    return res.status(401).json({err:"Account lacks another authentication method, can't detach Facebook"});
  //FIXME for some reason, the following gives https://gist.github.com/lefnire/f93eb306069b9089d123
  //res.locals.user.auth.facebook = null;
  //res.locals.user.auth.save(function(err, saved){
  User.update({_id:res.locals.user._id}, {$unset:{'auth.facebook':1}}, function(err){
    if (err) return next(err);
    res.sendStatus(200);
  })
}

api.resetPassword = function(req, res, next){
  var email = req.body.email && req.body.email.toLowerCase(), // Emails are all lowercase
    salt = utils.makeSalt(),
    newPassword =  utils.makeSalt(), // use a salt as the new password too (they'll change it later)
    hashed_password = utils.encryptPassword(newPassword, salt);

  if(!email) return res.status(400).json({err: "Email not provided"});

  User.findOne({'auth.local.email': email}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).json({err:"Sorry, we can't find a user registered with email " + email + "\n- Make sure your email address is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login."});
    user.auth.local.salt = salt;
    user.auth.local.hashed_password = hashed_password;
    utils.sendEmail({
      from: "Habitica <admin@habitica.com>",
      to: email,
      subject: "Password Reset for Habitica",
      text: "Password for " + user.auth.local.username + " has been reset to " + newPassword + " Important! Both username and password are case-sensitive -- you must enter both exactly as shown here. We recommend copying and pasting both instead of typing them. Log in at " + nconf.get('BASE_URL') + ". After you've logged in, head to " + nconf.get('BASE_URL') + "/#/options/settings/settings and change your password.",
      html: "Password for <strong>" + user.auth.local.username + "</strong> has been reset to <strong>" + newPassword + "</strong><br /><br />Important! Both username and password are case-sensitive -- you must enter both exactly as shown here. We recommend copying and pasting both instead of typing them.<br /><br />Log in at " + nconf.get('BASE_URL') + ". After you've logged in, head to " + nconf.get('BASE_URL') + "/#/options/settings/settings and change your password."
    });
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
  var user = res.locals.user;
  var username = req.body.username;
  var lowerCaseUsername = username && username.toLowerCase(); // we search for the lowercased version to intercept duplicates

  if(!username) return res.status(400).json({err: "Username not provided"});
  async.waterfall([
    function(cb){
      User.findOne({'auth.local.lowerCaseUsername': lowerCaseUsername}, {auth:1}, cb);
    },
    function(found, cb){
      if (found) return cb({code:401, err: "Username already taken"});
      if (invalidPassword(user, req.body.password)) return cb(invalidPassword(user, req.body.password));
      user.auth.local.username = username;
      user.auth.local.lowerCaseUsername = lowerCaseUsername;

      user.save(cb);
    }
  ], function(err){
    if (err) return err.code ? res.status(err.code).json(err) : next(err);
    res.sendStatus(200);
  })
}

api.changeEmail = function(req, res, next){
  var email = req.body.email && req.body.email.toLowerCase(); // emails are all lowercase
  if(!email) return res.status(400).json({err: "Email not provided"});

  async.waterfall([
    function(cb){
      User.findOne({'auth.local.email': email}, {auth:1}, cb);
    },
    function(found, cb){
      if(found) return cb({code:401, err: shared.i18n.t('messageAuthEmailTaken')});
      if (invalidPassword(res.locals.user, req.body.password)) return cb(invalidPassword(res.locals.user, req.body.password));
      res.locals.user.auth.local.email = email;
      res.locals.user.save(cb);
    }
  ], function(err){
    if (err) return err.code ? res.status(err.code).json(err) : next(err);
    res.sendStatus(200);
  })
}

api.changePassword = function(req, res, next) {
  var user = res.locals.user,
    oldPassword = req.body.oldPassword,
    newPassword = req.body.newPassword,
    confirmNewPassword = req.body.confirmNewPassword;

  if (newPassword != confirmNewPassword)
    return res.status(401).json({err: "Password & Confirm don't match"});

  var salt = user.auth.local.salt,
    hashed_old_password = utils.encryptPassword(oldPassword, salt),
    hashed_new_password = utils.encryptPassword(newPassword, salt);

  if (hashed_old_password !== user.auth.local.hashed_password)
    return res.status(401).json({err:"Old password doesn't match"});

  user.auth.local.hashed_password = hashed_new_password;
  user.save(function(err, saved){
    if (err) next(err);
    res.sendStatus(200);
  })
};

var firebaseTokenGeneratorInstance = new FirebaseTokenGenerator(nconf.get('FIREBASE:SECRET'));
api.getFirebaseToken = function(req, res, next) {
  var user = res.locals.user;
  // Expires 24 hours after now (60*60*24*1000) (in milliseconds)
  var expires = new Date();
  expires.setTime(expires.getTime() + 86400000);

  var token = firebaseTokenGeneratorInstance
    .createToken({
      uid: user._id,
      isHabiticaUser: true
    }, {
      expires: expires
    });

  res.status(200).json({
    token: token,
    expires: expires
  });
};

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
