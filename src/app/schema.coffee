moment = require 'moment'
_ = require 'underscore'
lodash = require 'lodash'
derby = require 'derby'

userSchema =
  # _id
  stats: { gp: 0, exp: 0, lvl: 1, hp: 50 }
  party: { current: null, invitation: null }
  items: { weapon: 0, armor: 0, head: 0, shield: 0 }
  preferences: { gender: 'm', skin: 'white', hair: 'blond', armorSet: 'v1' }
  idLists:
    habit: []
    daily: []
    todo: []
    reward: []
  apiToken: null # set in newUserObject below
  lastCron: 'new' #this will be replaced with `+new Date` on first run
  balance: 2
  tasks: {}
  flags:
    partyEnabled: false
    itemsEnabled: false
    kickstarter: 'show'
    # ads: 'show' # added on registration

module.exports.newUserObject = ->
  # deep clone, else further new users get duplicate objects
  newUser = lodash.cloneDeep userSchema
  newUser.apiToken = derby.uuid()

  defaultTasks = [
    {type: 'habit', text: '1h Productive Work', notes: '-- Habits: Constantly Track --\nFor some habits, it only makes sense to *gain* points (like this one).', value: 0, up: true, down: false }
    {type: 'habit', text: 'Eat Junk Food', notes: 'For others, it only makes sense to *lose* points', value: 0, up: false, down: true}
    {type: 'habit', text: 'Take The Stairs', notes: 'For the rest, both + and - make sense (stairs = gain, elevator = lose)', value: 0, up: true, down: true}
    {type: 'daily', text: '1h Personal Project', notes: '-- Dailies: Complete Once a Day --\nAt the end of each day, non-completed Dailies dock you points.', value: 0, completed: false }
    {type: 'daily', text: 'Exercise', notes: "If you are doing well, they turn green and are less valuable (experience, gold) and less damaging (HP). This means you can ease up on them for a bit.", value: 3, completed: false }
    {type: 'daily', text: '45m Reading', notes: 'But if you are doing poorly, they turn red. The worse you do, the more valuable (exp, gold) and more damaging (HP) these goals become. This encourages you to focus on your shortcomings, the reds.', value: -10, completed: false }
    {type: 'todo', text: 'Call Mom', notes: "-- Todos: Complete Eventually --\nNon-completed Todos won't hurt you, but they will become more valuable over time. This will encourage you to wrap up stale Todos.", value: -3, completed: false }
    {type: 'reward', text: '1 Episode of Game of Thrones', notes: '-- Rewards: Treat Yourself! --\nAs you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits.', value: 20 }
    {type: 'reward', text: 'Cake', notes: 'But only buy if you have enough gold - you lose HP otherwise.', value: 10 }
  ]

  for task in defaultTasks
    guid = task.id = derby.uuid()
    newUser.tasks[guid] = task
    switch task.type
      when 'habit' then newUser.idLists.habit.push guid
      when 'daily' then newUser.idLists.daily.push guid
      when 'todo' then newUser.idLists.todo.push guid
      when 'reward' then newUser.idLists.reward.push guid
  return newUser

module.exports.updateUser = (batch) ->
  user = batch.user
  obj = batch.obj()

  batch.set('apiToken', derby.uuid()) unless obj.apiToken

  ## Task List Cleanup
  # FIXME temporary hack to fix lists (Need to figure out why these are happening)
  tasks = obj.tasks
  _.each ['habit','daily','todo','reward'], (type) ->
    # 1. remove duplicates
    # 2. restore missing zombie tasks back into list
    taskIds =  _.pluck( _.where(tasks, {type:type}), 'id')
    union = _.union obj.idLists[type], taskIds

    # 2. remove empty (grey) tasks
    preened = _.filter(union, (val) -> _.contains(taskIds, val))

    # There were indeed issues found, set the new list
    batch.set("idLists.#{type}", preened) # if _.difference(preened, userObj[path]).length != 0

module.exports.BatchUpdate = BatchUpdate = (model) ->
  user = model.at("_user")
  transactionInProgress = false
  obj = {}
  updates = {}

  {
    user: user

    obj: ->
      obj ?= user.get()
      return obj

    startTransaction: ->
      # start a batch transaction - nothing between now and @commit() will be set immediately
      transactionInProgress = true
      model._dontPersist = true

      # Really strange, user.get() seems to only return attributes which have previously been accessed. So in
      # many cases, userObj.tasks.{taskId}.value is undefined - so we manually .get() each attribute here.
      # Additionally, for some reason after getting the user object, changing properies manually (userObj.stats.hp = 50)
      # seems to actually run user.set('stats.hp',50) which we don't want to do - so we deepClone here
      #_.each Object.keys(userSchema), (key) -> obj[key] = lodash.cloneDeep user.get(key)
      obj = model.get('users.'+user.get('id'), true)

    ###
      Handles updating the user model. If this is an en-mass operation (eg, server cron), changes are queued
      but not actually set to the model. It also modifies userObj in case you need to access properties manually later.
      If transaction not in progress, it just runs standard model.set()
    ###
    set: (path, val) ->
      updates[path] = val if transactionInProgress
      user.set(path, val)

    ###
      Hack to get around dom bindings being lost if parent objects are replaced whole-sale
      eg, user.set('stats', {hp:50, exp:10...}) will break dom bindings, but user.set('stats.hp',50) is ok
    ###
    setStats: (stats) ->
      stats ?= obj.stats
      that = @
      _.each Object.keys(stats), (key) -> that.set "stats.#{key}", stats[key]

#    queue: (path, val) ->
#      # Special function for setting object properties by string dot-notation. See http://stackoverflow.com/a/6394168/362790
#      arr = path.split('.')
#      arr.reduce (curr, next, index) ->
#         if (arr.length - 1) == index
#           curr[next] = val
#         curr[next]
#      , obj

    commit: ->
      model._dontPersist = false
      # some hackery in our own branched racer-db-mongo, see findAndModify of lefnire/racer-db-mongo#habitrpg index.js
      user.set "update__", updates
      transactionInProgress = false
      updates = {}
  }
