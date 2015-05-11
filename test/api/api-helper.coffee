##############################
# Global modules
##############################
superagentDefaults = require("superagent-defaults")
global.request = superagentDefaults()

global.mongoose = require("mongoose")
global.moment = require("moment")
global.async = require("async")
global._ = require("lodash")
global.shared = require("../../common")
global.User = require("../../website/src/models/user").model

global.chai = require("chai")
global.expect = require("chai").expect

##############################
# Nconf config
##############################
path = require("path")
global.conf = require("nconf")
conf.argv().env().file(file: path.join(__dirname, "../config.json")).defaults()
conf.set "PORT", "1337"

##############################
# Node ENV and global variables
##############################
process.env.NODE_DB_URI = "mongodb://localhost/habitrpg_test"
global.baseURL = "http://localhost:" + conf.get("PORT") + "/api/v2"
global.user = undefined

##############################
# Helper Methods
##############################
global.expectCode = (res, code) ->
  expect(res.body.err).to.not.exist if code is 200
  expect(res.statusCode).to.equal code

global.registerNewUser = (cb, main) ->
  main = true unless main?
  randomID = shared.uuid()
  username = password = randomID  if main
  request
    .post(baseURL + "/register")
    .set("Accept", "application/json")
    .set("X-API-User", null)
    .set("X-API-Key", null)
    .send
      username: randomID
      password: randomID
      confirmPassword: randomID
      email: randomID + "@gmail.com"
    .end (res) ->
      return cb(null, res.body)  unless main
      _id = res.body._id
      apiToken = res.body.apiToken
      User.findOne
        _id: _id
        apiToken: apiToken
      , (err, _user) ->
        expect(err).to.not.be.ok
        global.user = _user
        request
          .set("Accept", "application/json")
          .set("X-API-User", _id)
          .set("X-API-Key", apiToken)
        cb null, res.body

global.registerManyUsers = (number, callback) ->
  async.times number, (n, next) ->
    registerNewUser (err, user) ->
      next(err, user)
    , false
  , (err, users) ->
    callback(err, users)
