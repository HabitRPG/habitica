require('babel-core/register');
var path, superagentDefaults;

superagentDefaults = require("superagent-defaults");

global.request = superagentDefaults();

global.mongoose = require("mongoose");
var Bluebird = require('bluebird');
mongoose.Promise = Bluebird;

global.moment = require("moment");

global.async = require("async");

global._ = require("lodash");

global.shared = require("../../common");

global.User = require("../../website/server/models/user").model;

global.chai = require("chai");

chai.use(require("sinon-chai"));

global.expect = chai.expect;

path = require("path");

global.conf = require("nconf");

conf.argv().env().file({
  file: path.join(__dirname, "../config.json")
}).defaults();

conf.set("PORT", "1337");

process.env.NODE_DB_URI = "mongodb://localhost/habitrpg_test_api_legacy";

global.baseURL = "http://localhost:" + conf.get("PORT") + "/api/v2";

global.user = void 0;

global.expectCode = function(res, code) {
  if (code === 200) {
    expect(res.body.err).to.not.exist;
  }
  return expect(res.statusCode).to.equal(code);
};

global.registerNewUser = function(cb, main) {
  var password, randomID, username;
  if (main == null) {
    main = true;
  }
  randomID = shared.uuid();
  if (main) {
    username = password = randomID;
  }
  return request.post(baseURL + "/register").set("Accept", "application/json").set("X-API-User", null).set("X-API-Key", null).send({
    username: randomID,
    password: randomID,
    confirmPassword: randomID,
    email: randomID + "@gmail.com"
  }).end(function(err, res) {
    var _id, apiToken;
    if (!main) {
      return cb(null, res.body);
    }
    _id = res.body._id;
    apiToken = res.body.apiToken;
    return User.findOne({
      _id: _id,
      apiToken: apiToken
    }, function(err, _user) {
      expect(err).to.not.be.ok;
      global.user = _user;
      request.set("Accept", "application/json").set("X-API-User", _id).set("X-API-Key", apiToken);
      return cb(null, res.body);
    });
  });
};

global.registerManyUsers = function(number, callback) {
  return async.times(number, function(n, next) {
    return registerNewUser(function(err, user) {
      return next(err, user);
    }, false);
  }, function(err, users) {
    return callback(err, users);
  });
};
