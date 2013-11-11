_ = require 'lodash'
algos = require 'habitrpg-shared/script/algos'
items = require('habitrpg-shared/script/items').items
helpers = require('habitrpg-shared/script/helpers')

#TODO put this in habitrpg-shared
###
  We can't always use refLists, but we often still need to get a positional path by id: eg, users.1234.tasks.5678.value
  For arrays (which use indexes, not id-paths), here's a helper function so we can run indexedPath('users',:user.id,'tasks',:task.id,'value)
###
indexedPath = ->
  _.reduce arguments, (m,v) =>
    return v if !m #first iteration
    return "#{m}.#{v}" if _.isString v #string paths
    return "#{m}." + _.findIndex(@model.get(m),v)
  , ''

taskInChallenge = (task) ->
  return undefined unless task?.challenge
  @model.at indexedPath.call(@, "groups.#{task.group.id}.challenges", {id:task.challenge}, "#{task.type}s", {id:task.id})

###
  algos.score wrapper for habitrpg-helpers to work in Derby. We need to do model.set() instead of simply setting the
  object properties, and it's very difficult to diff the two objects and find dot-separated paths to set. So we to first
  clone our user object (if we don't do that, it screws with model.on() listeners, ping Tyler for an explaination),
  perform the updates while tracking paths, then all the values at those paths
###
module.exports.score = (model, taskId, direction, allowUndo=false) ->
  drop = undefined
  delta = batchTxn model, (uObj, paths) ->
    tObj = uObj.tasks[taskId]

    # Stuff for undo
    if allowUndo
      tObjBefore = _.cloneDeep tObj
      tObjBefore.completed = !tObjBefore.completed if tObjBefore.type in ['daily', 'todo']
      previousUndo = model.get('_undo')
      clearTimeout(previousUndo.timeoutId) if previousUndo?.timeoutId
      timeoutId = setTimeout (-> model.del('_undo')), 20000
      model.set '_undo', {stats:_.cloneDeep(uObj.stats), task:tObjBefore, timeoutId: timeoutId}

    delta = algos.score(uObj, tObj, direction, {paths})
    model.set('_streakBonus', uObj._tmp.streakBonus) if uObj._tmp?.streakBonus
    drop = uObj._tmp?.drop

    # Update challenge statistics
    # FIXME put this in it's own batchTxn, make batchTxn model.at() ref aware (not just _user)
    # FIXME use reflists for users & challenges
    if (chalTask = taskInChallenge.call({model}, tObj)) and chalTask?.get()
      model._dontPersist = false
      chalTask.incr "value", delta
      chal = model.at indexedPath.call({model}, "groups.#{tObj.group.id}.challenges", {id:tObj.challenge})
      chalUser = -> indexedPath.call({model}, chal.path(), 'users', {id:uObj.id})
      cu = model.at chalUser()
      unless cu?.get()
        chal.push "users", {id: uObj.id, name: helpers.username(uObj.auth, uObj.profile?.name)}
        cu = model.at chalUser()
      else
        cu.set 'name', helpers.username(uObj.auth, uObj.profile?.name) # update their name incase it changed
      cu.set "#{tObj.type}s.#{tObj.id}",
        value: tObj.value
        history: tObj.history
      model._dontPersist = true
  , done:->
    if drop and $?
      model.set '_drop', drop
      $('#item-dropped-modal').modal 'show'

  delta

###
  Cleanup task-corruption (null tasks, rogue/invisible tasks, etc)
  Obviously none of this should be happening, but we'll stop-gap until we can find & fix
  Gotta love refLists! see https://github.com/lefnire/habitrpg/issues/803 & https://github.com/lefnire/habitrpg/issues/6343
###
module.exports.fixCorruptUser = (model) ->
  user = model.at('_user')
  tasks = user.get('tasks')

  ## Remove corrupted tasks
  _.each tasks, (task, key) ->
    unless task?.id? and task?.type?
      user.del("tasks.#{key}")
      delete tasks[key]
    true
  resetDom = false
  batchTxn model, (uObj, paths, batch) ->
    ## fix https://github.com/lefnire/habitrpg/issues/1086
    uniqPets = _.uniq(uObj.items.pets)
    batch.set('items.pets', uniqPets) if !_.isEqual(uniqPets, uObj.items.pets)

    if uObj.invitations?.guilds
      uniqInvites = _.uniq(uObj.invitations.guilds)
      batch.set('invitations.guilds', uniqInvites) if !_.isEqual(uniqInvites, uObj.invitations.guilds)

    ## Task List Cleanup
    ['habit','daily','todo','reward'].forEach (type) ->

      # 1. remove duplicates
      # 2. restore missing zombie tasks back into list
      idList = uObj["#{type}Ids"]
      taskIds =  _.pluck( _.where(tasks, {type}), 'id')
      union = _.union idList, taskIds

      # 2. remove empty (grey) tasks
      preened = _.filter union, (id) -> id and _.contains(taskIds, id)

      # There were indeed issues found, set the new list
      if !_.isEqual(idList, preened)
        batch.set("#{type}Ids", preened)
        console.error uObj.id + "'s #{type}s were corrupt."
      true
    resetDom = !_.isEmpty(paths)
  require('./browser').resetDom(model) if resetDom

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
  view.fn "truarr", (num) -> num-1
  view.fn 'count', (arr) -> arr?.length or 0
  view.fn 'int',
    get: (num) -> num
    set: (num) -> [parseInt(num)]
  view.fn 'indexedPath', indexedPath


  #iCal
  view.fn "encodeiCalLink", helpers.encodeiCalLink

  #User
  view.fn "gems", (balance) -> balance * 4

  #Challenges
  view.fn 'taskInChallenge', (task) ->
    taskInChallenge.call(@,task)?.get()
  view.fn 'taskAttrFromChallenge', (task, attr) ->
    taskInChallenge.call(@,task)?.get(attr)
  view.fn 'brokenChallengeLink', (task) ->
    task?.challenge and !(taskInChallenge.call(@,task)?.get())

  view.fn 'challengeMemberScore', (member, tType, tid) ->
    Math.round(member["#{tType}s"]?[tid]?.value)

