character = require './character'
browser = require './browser'
items = require './items'

moment = require 'moment'
_ = require 'underscore'
lodash = require 'lodash'
derby = require 'derby'

module.exports.username = username = (auth) ->
  if auth?.facebook?.displayName?
    auth.facebook.displayName
  else if auth?.facebook?
    fb = auth.facebook
    if fb._raw then "#{fb.name.givenName} #{fb.name.familyName}" else fb.name
  else if auth?.local?
    auth.local.username
  else
    'Anonymous'

module.exports.view = (view) ->
  view.fn "username", (auth) -> username(auth)

module.exports.app = (appExports, model) ->
  user = model.at '_user'

  revive = (batch) ->
    # Reset stats
    batch.set 'stats.hp', 50
    batch.set 'stats.lvl', 1
    batch.set 'stats.gp', 0
    batch.set 'stats.exp', 0

    # Reset items
    batch.set 'items.armor', 0
    batch.set 'items.weapon', 0
    batch.set 'items.head', 0
    batch.set 'items.shield', 0

    # Reset item store
    items.updateStore(model)

  appExports.revive = (e, el) ->
    batch = new character.BatchUpdate(model)
    batch.startTransaction()
    revive(batch)
    batch.commit()

  appExports.reset = (e, el) ->
    batch = new character.BatchUpdate(model)
    batch.startTransaction()
    taskTypes = ['habit', 'daily', 'todo', 'reward']
    batch.set 'tasks', {}
    _.each taskTypes, (type) -> batch.set "#{type}Ids", []
    batch.set 'balance', 1 if user.get('balance') < 1 #only if they haven't manually bought tokens
    revive(batch)
    batch.commit()
    browser.resetDom(model)

  appExports.closeCelebrationNofitication = (e, el) ->
    user.set('flags.celebrationEvent', 'hide')

  appExports.customizeGender = (e, el) ->
    user.set 'preferences.gender', $(el).attr('data-value')

  appExports.customizeHair = (e, el) ->
    user.set 'preferences.hair', $(el).attr('data-value')

  appExports.customizeSkin = (e, el) ->
    user.set 'preferences.skin', $(el).attr('data-value')

  appExports.customizeArmorSet = (e, el) ->
    user.set 'preferences.armorSet', $(el).attr('data-value')

  appExports.restoreSave = (e, el) ->
    batch = new BatchUpdate(model)
    batch.startTransaction()
    $('#restore-form input').each ->
      batch.set $(this).attr('data-for'), parseInt($(this).val())
    batch.commit()

  user.on 'set', 'flags.customizationsNotification', (captures, args) ->
    return unless captures == true
    $('.main-avatar').popover('destroy') #remove previous popovers
    html = """
           Click your avatar to customize your appearance. <a href='#' onClick="$('.main-avatar').popover('hide');return false;">[Close]</a>
           """
    $('.main-avatar').popover
      title: "Customize Your Avatar"
      placement: 'bottom'
      trigger: 'manual'
      html: true
      content: html
    $('.main-avatar').popover 'show'


userSchema =
# _id
  stats: { gp: 0, exp: 0, lvl: 1, hp: 50 }
  party: { current: null, invitation: null }
  items: { weapon: 0, armor: 0, head: 0, shield: 0 }
  preferences: { gender: 'm', skin: 'white', hair: 'blond', armorSet: 'v1' }
  habitIds: []
  dailyIds: []
  todoIds: []
  rewardIds: []
  apiToken: null # set in newUserObject below
  lastCron: 'new' #this will be replaced with `+new Date` on first run
  balance: 1
  tasks: {}
  flags:
    partyEnabled: false
    itemsEnabled: false
  tags: []
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

  defaultTags = [
    {name: 'morning'}
    {name: 'afternoon'}
    {name: 'evening'}
  ]

  for task in defaultTasks
    guid = task.id = derby.uuid()
    newUser.tasks[guid] = task
    switch task.type
      when 'habit' then newUser.habitIds.push guid
      when 'daily' then newUser.dailyIds.push guid
      when 'todo' then newUser.todoIds.push guid
      when 'reward' then newUser.rewardIds.push guid

  for tag in defaultTags
    tag.id = derby.uuid()
    newUser.tags.push tag

  return newUser

module.exports.updateUser = (model) ->
  batch = new BatchUpdate(model)
  user = batch.user
  obj = batch.obj()
  tasks = obj.tasks

  # Remove corrupted tasks
  _.each tasks, (task, key) ->
    unless task?
      user.del("tasks.#{key}")
      delete tasks[key]

  batch.startTransaction()

  batch.set('apiToken', derby.uuid()) unless obj.apiToken

  ## Task List Cleanup
  # FIXME temporary hack to fix lists (Need to figure out why these are happening)
  _.each ['habit','daily','todo','reward'], (type) ->
    # 1. remove duplicates
    # 2. restore missing zombie tasks back into list
    taskIds =  _.pluck( _.where(tasks, {type:type}), 'id')
    union = _.union obj[type + 'Ids'], taskIds

    # 2. remove empty (grey) tasks
    preened = _.filter(union, (val) -> _.contains(taskIds, val))

    # There were indeed issues found, set the new list
    batch.set("#{type}Ids", preened) # if _.difference(preened, userObj[path]).length != 0

  batch.commit()

module.exports.BatchUpdate = BatchUpdate = (model) ->
  user = model.at("_user")
  transactionInProgress = false
  obj = null
  updates = {}

  {
  user: user

  obj: ->
    obj ?= model.get 'users.'+user.get('id')
    return obj

  startTransaction: ->
    # start a batch transaction - nothing between now and @commit() will be set immediately
    transactionInProgress = true
    model._dontPersist = true
    @obj()

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
