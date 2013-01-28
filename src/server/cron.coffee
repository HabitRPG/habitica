moment = require('moment')
mongo = require("mongoskin")
_ = require('underscore')

module.exports.deleteStaleAccounts = () ->

  unRegistered = { "auth.local": {$exists: false} , "auth.facebook": {$exists: false} }
  registered = registered = { $or: [
    { 'auth.local': { $exists: true } },
    { 'auth.facebook': { $exists: true} }
  ]};

  collection = mongo.db(process.env.NODE_DB_URI, {safe:true}).collection("users")

  collection.count registered, (err, result) -> console.log("#{result} registered users [before]")
  collection.count unRegistered, (err, result) -> console.log("#{result} un-registered users [before]")

  isValidDate = (d) ->
    return false  if Object::toString.call(d) isnt "[object Date]"
    not isNaN(d.getTime())

  today = +new Date
  collection.findEach unRegistered, (err, user) ->
    throw err if err
    return unless user?
    lastCron = new Date(user.lastCron)
    return unless isValidDate(lastCron) # still gotta figure out what to do with users with "undefined" lastCron
    diff = Math.abs(moment(today).sod().diff(moment(lastCron).sod(), "days"))
    if diff > 15
      collection.remove {_id: user._id}, (err, res) -> throw err if err

  collection.count registered, (err, result) -> console.log("#{result} registered users [after]")
  collection.count unRegistered, (err, result) -> console.log("#{result} un-registered users [after]")