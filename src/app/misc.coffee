_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
items = require('habitrpg-shared/script/items').items
helpers = require('habitrpg-shared/script/helpers')

###
  algos.score wrapper for habitrpg-helpers to work in Derby. We need to do model.set() instead of simply setting the
  object properties, and it's very difficult to diff the two objects and find dot-separated paths to set. So we to first
  clone our user object (if we don't do that, it screws with model.on() listeners, ping Tyler for an explaination),
  perform the updates while tracking paths, then all the values at those paths
###
module.exports.score = (model, taskId, direction, allowUndo=false) ->
  #return setTimeout( (-> score(taskId, direction)), 500) if model._txnQueue.length > 0
  user = model.at("_user")

  uObj = hydrate(user.get()) # see https://github.com/codeparty/racer/issues/116
  tObj = uObj.tasks[taskId]

  # Stuff for undo
  if allowUndo
    tObjBefore = _.cloneDeep tObj
    tObjBefore.completed = !tObjBefore.completed if tObjBefore.type in ['daily', 'todo']
    previousUndo = model.get('_undo')
    clearTimeout(previousUndo.timeoutId) if previousUndo?.timeoutId
    timeoutId = setTimeout (-> model.del('_undo')), 20000
    model.set '_undo', {stats:_.cloneDeep(uObj.stats), task:tObjBefore, timeoutId: timeoutId}

  paths = {}
  delta = algos.score(uObj, tObj, direction, {paths})
  _.each paths, (v,k) -> user.set(k,helpers.dotGet(k, uObj)); true
  model.set('_streakBonus', uObj._tmp.streakBonus) if uObj._tmp?.streakBonus
  if uObj._tmp?.drop and $?
    model.set '_drop', uObj._tmp.drop
    $('#item-dropped-modal').modal 'show'
  delta

###
  Make sure model.get() returns all properties, see https://github.com/codeparty/racer/issues/116
###
module.exports.hydrate = hydrate = (spec) ->
  if _.isObject(spec) and !_.isArray(spec)
    hydrated = {}
    keys = _.keys(spec).concat(_.keys(spec.__proto__))
    keys.forEach (k) -> hydrated[k] = hydrate(spec[k])
    hydrated
  else spec

module.exports.viewHelpers = (view) ->

  #misc
  view.fn "percent", (x, y) ->
    x=1 if x==0
    Math.round(x/y*100)
  view.fn 'indexOf', (str1, str2) ->
    return false unless str1 && str2
    str1.indexOf(str2) != -1
  view.fn "round", Math.round
  view.fn "floor", Math.floor
  view.fn "ceil", Math.ceil
  view.fn "lt", (a, b) -> a < b
  view.fn 'gt', (a, b) -> a > b
  view.fn "mod", (a, b) -> parseInt(a) % parseInt(b) == 0
  view.fn "notEqual", (a, b) -> (a != b)
  view.fn "and", -> _.reduce arguments, (cumm, curr) -> cumm && curr
  view.fn "or", -> _.reduce arguments, (cumm, curr) -> cumm || curr
  view.fn "truarr", (num) -> num-1
  view.fn 'count', (arr) -> arr?.length or 0
  view.fn 'int',
    get: (num) -> num
    set: (num) -> [parseInt(num)]

  #iCal
  view.fn "encodeiCalLink", helpers.encodeiCalLink

  #User
  view.fn "gems", (balance) -> return balance/0.25
  view.fn "username", helpers.username
  view.fn "tnl", algos.tnl
  view.fn 'equipped', helpers.equipped
  view.fn "gold", helpers.gold
  view.fn "silver", helpers.silver

  #Stats
  view.fn 'userStr', helpers.userStr
  view.fn 'totalStr', helpers.totalStr
  view.fn 'userDef', helpers.userDef
  view.fn 'totalDef', helpers.totalDef
  view.fn 'itemText', helpers.itemText
  view.fn 'itemStat', helpers.itemStat

  #Pets
  view.fn 'ownsPet', helpers.ownsPet

  #Tasks
  view.fn 'taskClasses', helpers.taskClasses

  #Chat
  view.fn 'friendlyTimestamp',helpers.friendlyTimestamp
  view.fn 'newChatMessages', helpers.newChatMessages
  view.fn 'relativeDate', helpers.relativeDate

  #Tags
  view.fn 'noTags', helpers.noTags
  view.fn 'appliedTags', helpers.appliedTags