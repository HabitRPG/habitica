async = require 'async'
moment = require 'moment'
_ = require 'underscore'
{ randomVal } = helpers = require './helpers'
browser = require './browser'
character = require './character'
items = require './items'
{ pets, food } = items.items
algos = require './algos'

MODIFIER = algos.MODIFIER # each new level, armor, weapon add 2% modifier (this mechanism will change)

# {taskId} task you want to score
# {direction} 'up' or 'down'
# {times} # times to call score on this task (1 unless cron, usually)
# {update} if we're running updates en-mass (eg, cron on server) pass in userObj
score = (model, taskId, direction, times, batch, cron) ->
  user = model.at '_user'

  commit = false
  unless batch?
    commit = true
    batch = new character.BatchUpdate(model)
    batch.startTransaction()
  obj = batch.obj()

  {gp, hp, exp, lvl} = obj.stats

  taskPath = "tasks.#{taskId}"
  taskObj = obj.tasks[taskId]
  {type, value} = taskObj
  priority = taskObj.priority or '!'

  # If they're trying to purhcase a too-expensive reward, confirm they want to take a hit for it
  if taskObj.value > obj.stats.gp and taskObj.type is 'reward'
    r = confirm "Not enough GP to purchase this reward, buy anyway and lose HP? (Punishment for taking a reward you didn't earn)."
    unless r
      batch.commit()
      return

  delta = 0
  times ?= 1
  calculateDelta = (adjustvalue=true) ->
    # If multiple days have passed, multiply times days missed
    _.times times, (n) ->
      # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
      # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
      # rather than iteratively
      nextDelta = algos.taskDeltaFormula(value, direction)
      value += nextDelta if adjustvalue
      delta += nextDelta

  addPoints = ->
    level = user.get('stats.lvl')
    weaponStrength = items.items.weapon[user.get('items.weapon')].strength
    exp += algos.expModifier(delta,weaponStrength,level, priority) / 2 # / 2 hack for now bcause people leveling too fast
    gp += algos.gpModifier(delta, 1, priority)

  subtractPoints = ->
    level = user.get('stats.lvl')
    armorDefense = items.items.armor[user.get('items.armor')].defense
    helmDefense = items.items.head[user.get('items.head')].defense
    shieldDefense = items.items.shield[user.get('items.shield')].defense
    hp += algos.hpModifier(delta,armorDefense,helmDefense,shieldDefense,level, priority)

  switch type
    when 'habit'
      calculateDelta()
      # Add habit value to habit-history (if different)
      if (delta > 0) then addPoints() else subtractPoints()
      taskObj.history ?= []
      if taskObj.value != value
        historyEntry = { date: +new Date, value: value }
        taskObj.history.push historyEntry
        batch.set "#{taskPath}.history", taskObj.history

    when 'daily'
      if cron? # cron
        calculateDelta()
        subtractPoints()
      else
        calculateDelta(false)
        if delta != 0
          addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'todo'
      if cron? #cron
        calculateDelta()
        #don't touch stats on cron
      else
        calculateDelta()
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'reward'
      # Don't adjust values for rewards
      calculateDelta(false)
      # purchase item
      gp -= Math.abs(taskObj.value)
      num = parseFloat(taskObj.value).toFixed(2)
      # if too expensive, reduce health & zero gp
      if gp < 0
        hp += gp # hp - gp difference
        gp = 0

  taskObj.value = value
  batch.set "#{taskPath}.value", taskObj.value
  origStats = _.clone obj.stats
  updateStats model, { hp, exp, gp }, batch

  if commit
    # newStats / origStats is a glorious hack to trick Derby into seeing the change in model.on(*)
    newStats = _.clone batch.obj().stats
    _.each Object.keys(origStats), (key) -> obj.stats[key] = origStats[key]
    batch.setStats(newStats)
    # batch.setStats()
    batch.commit()

  # 1% chance of getting a pet or meat
  if direction is 'up' and obj.flags.dropsEnabled and Math.random() < .5
    if Math.random() < .5
      drop = randomVal(food)
      user.push 'items.food', drop.text
      drop.type = 'Food'
    else
      drop = randomVal(pets)
      user.push 'items.eggs', drop
      drop.type = 'Egg'

    model.set '_drop', drop
    $('#item-dropped-modal').modal 'show'

  return delta

###
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
###
updateStats = (model, newStats, batch) ->
  user = model.at '_user'
  obj = batch.obj()

  # if user is dead, dont do anything
  return if obj.stats.lvl == 0

  if newStats.hp?
    # Game Over
    if newStats.hp <= 0
      obj.stats.lvl = 0 # signifies dead
      obj.stats.hp = 0
      return
    else
      obj.stats.hp = newStats.hp

  if newStats.exp?
    tnl = algos.tnl(obj.stats.lvl)
    #silent = false
    # if we're at level 100, turn xp to gold
    if obj.stats.lvl >= 100
      newStats.gp += newStats.exp / 15
      newStats.exp = 0
      obj.stats.lvl = 100
    else
      # level up & carry-over exp
      if newStats.exp >= tnl
        #silent = true # push through the negative xp silently
        user.set('stats.exp', newStats.exp) # push normal + notification
        while newStats.exp >= tnl and obj.stats.lvl < 100 # keep levelling up
          newStats.exp -= tnl
          obj.stats.lvl++
          tnl = algos.tnl(obj.stats.lvl)
        if obj.stats.lvl== 100
          newStats.exp = 0
        obj.stats.hp = 50

    obj.stats.exp = newStats.exp
    #if silent
      #console.log("pushing silent :"  + obj.stats.exp)
      #user.pass(true).set('stats.exp', obj.stats.exp)

    # Set flags when they unlock features
    if !obj.flags.customizationsNotification and (obj.stats.exp > 10 or obj.stats.lvl > 1)
      batch.set 'flags.customizationsNotification', true
      obj.flags.customizationsNotification = true
    if !obj.flags.itemsEnabled and obj.stats.lvl >= 2
      # Set to object, then also send to browser right away to get model.on() subscription notification
      batch.set 'flags.itemsEnabled', obj.flags.itemsEnabled = true
    if !obj.flags.partyEnabled and obj.stats.lvl >= 3
      batch.set 'flags.partyEnabled', obj.flags.partyEnabled = true
    if !obj.flags.dropsEnabled and obj.stats.lvl >= 4
      batch.set 'flags.dropsEnabled', obj.flags.dropsEnabled = true

  if newStats.gp?
    #FIXME what was I doing here? I can't remember, gp isn't defined
    gp = 0.0 if (!gp? or gp<0)
    obj.stats.gp = newStats.gp

###
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
###
cron = (model) ->
  user = model.at '_user'
  today = +new Date
  daysPassed = helpers.daysBetween(user.get('lastCron'), today, user.get('preferences.dayStart'))
  if daysPassed > 0
    batch = new character.BatchUpdate(model)
    batch.startTransaction()
    batch.set 'lastCron', today
    obj = batch.obj()
    hpBefore = obj.stats.hp #we'll use this later so we can animate hp loss
    # Tally each task
    todoTally = 0
    _.each obj.tasks, (taskObj) ->
      {id, type, completed, repeat} = taskObj
      if type in ['todo', 'daily']
        # Deduct experience for missed Daily tasks,
        # but not for Todos (just increase todo's value)
        unless completed
          # for todos & typical dailies, these are equivalent
          daysFailed = daysPassed
          # however, for dailys which have repeat dates, need
          # to calculate how many they've missed according to their own schedule
          if type=='daily' && repeat
            daysFailed = 0
            _.times daysPassed, (n) ->
              thatDay = moment().subtract('days', n+1)
              if repeat[helpers.dayMapping[thatDay.day()]]==true
                daysFailed++
          score model, id, 'down', daysFailed, batch, true
        if type == 'daily'
          if completed #set OHV for completed dailies
            newValue = taskObj.value + algos.taskDeltaFormula(taskObj.value,'up')
            batch.set "tasks.#{taskObj.id}.value", newValue

          taskObj.history ?= []
          taskObj.history.push { date: +new Date, value: taskObj.value }
          batch.set "tasks.#{taskObj.id}.history", taskObj.history
          batch.set "tasks.#{taskObj.id}.completed", false
        else
          value = obj.tasks[taskObj.id].value #get updated value
          absVal = if (completed) then Math.abs(value) else value
          todoTally += absVal
      else if type is 'habit' # slowly reset 'onlies' value to 0
        if taskObj.up==false or taskObj.down==false
          if Math.abs(taskObj.value) < 0.1
            batch.set "tasks.#{taskObj.id}.value", 0
          else
            batch.set "tasks.#{taskObj.id}.value", taskObj.value / 2

    # Finished tallying
    obj.history ?= {}; obj.history.todos ?= []; obj.history.exp ?= []
    obj.history.todos.push { date: today, value: todoTally }
    # tally experience
    expTally = obj.stats.exp
    lvl = 0 #iterator
    while lvl < (obj.stats.lvl-1)
      lvl++
      expTally += algos.tnl(lvl)
    obj.history.exp.push  { date: today, value: expTally }

    # Set the new user specs, and animate HP loss
    [hpAfter, obj.stats.hp] = [obj.stats.hp, hpBefore]
    batch.setStats()
    batch.set('history', obj.history)
    batch.commit()
    browser.resetDom(model)
    setTimeout (-> user.set 'stats.hp', hpAfter), 1000 # animate hp loss


module.exports = {
  score: score
  cron: cron

  # testing stuff
  expModifier: algos.expModifier
  hpModifier: algos.hpModifier
  taskDeltaFormula: algos.taskDeltaFormula
}
