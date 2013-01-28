moment = require('moment')
mongo = require("mongoskin")
_ = require('underscore')

###
  Users are allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
  "staged" account is created - and if the user later registeres, that staged account is considered a "production" account.
  This function removes all staged accounts that have been abandoned - either older than a month, or corrupted in some way (lastCron==undefined)
###
module.exports.deleteStaleAccounts = ->

  un_registered = { "auth.local": {$exists: false} , "auth.facebook": {$exists: false} }
  registered = registered = { $or: [
    { 'auth.local': { $exists: true } },
    { 'auth.facebook': { $exists: true} }
  ]};

  collection = mongo.db(process.env.NODE_DB_URI, {safe:true}).collection("users")

  collection.count registered, (err, result) -> console.log("#{result} registered users [before]")
  collection.count un_registered, (err, result) -> console.log("#{result} un-registered users [before]")

  today = +new Date

  isValidDate = (d) ->
    return false  if Object::toString.call(d) isnt "[object Date]"
    not isNaN(d.getTime())

  removeAccount = (collection, id) -> collection.remove {_id: id}, (err, res) -> throw err if err

  collection.findEach un_registered, (err, user) ->
    throw err if err
    return unless user? #why does this happen sometimes?
    lastCron = new Date(user.lastCron)
    if !isValidDate(lastCron)
      removeAccount(collection, user._id)
      return
    diff = Math.abs(moment(today).sod().diff(moment(lastCron).sod(), "days"))
    if diff > 30
      removeAccount(collection, user._id)
      return