async = require 'async'
moment = require 'moment'
_ = require 'underscore'
helpers = require './helpers'
browser = require './browser'
schema = require './schema'
MODIFIER = .03 # each new level, armor, weapon add 3% modifier (this number may change)
user = undefined
model = undefined

# This is required by all the functions, make sure it's set before anythign else is called
setModel = (m) ->
  model = m
  user = model.at('_user')

###
  Calculates Exp & GP modification based on weapon & lvl
  {value} task.value for gain
  {modifiers} may manually pass in stats as {weapon, exp}. This is used for testing
###
expModifier = (value, modifiers = {}) ->
  weapon = modifiers.weapon || user.get('items.weapon')
  lvl = modifiers.lvl || user.get('stats.lvl')
  dmg = weapon * MODIFIER # each new weapon increases exp gain
  dmg += (lvl-1) * MODIFIER # same for lvls
  modified = value + (value * dmg)
  return modified

### 
  Calculates HP-loss modification based on armor & lvl
  {value} task.value which is hurting us
  {modifiers} may manually pass in modifier as {armor, lvl}. This is used for testing
###
hpModifier = (value, modifiers = {}) ->
  armor = modifiers.armor || user.get('items.armor')
  lvl = modifiers.lvl || user.get('stats.lvl')
  ac = armor * MODIFIER # each new armor decreases HP loss
  ac += (lvl-1) * MODIFIER # same for lvls
  modified = value - (value * ac)
  return modified
  
###
  Calculates the next task.value based on direction
  For negative values, use a line: something like y=-.1x+1
  For positibe values, taper off with inverse log: y=.9^x
  Would love to use inverse log for the whole thing, but after 13 fails it hits infinity. Revisit this formula later
  {currentValue} the current value of the task, determines it's next value
  {direction} 'up' or 'down'
###
taskDeltaFormula = (currentValue, direction) ->
  sign = if (direction == "up") then 1 else -1
  delta = if (currentValue < 0) then (( -0.1 * currentValue + 1 ) * sign) else (( Math.pow(0.9,currentValue) ) * sign)
  return delta

###
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
###
updateStats = (newStats, batch) ->
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
    # level up & carry-over exp
    tnl = model.get '_tnl'
    if newStats.exp >= tnl
      newStats.exp -= tnl
      obj.stats.lvl++
      obj.stats.hp = 50
    if !obj.flags.itemsEnabled and obj.stats.lvl >= 2
      # Set to object, then also send to browser right away to get model.on() subscription notification
      batch.set 'flags.itemsEnabled', true
      obj.flags.itemsEnabled = true
    if !obj.flags.partyEnabled and obj.stats.lvl >= 3
      batch.set 'flags.partyEnabled', true
      obj.flags.partyEnabled = true
    obj.stats.exp = newStats.exp

  if newStats.gp?
    #FIXME what was I doing here? I can't remember, gp isn't defined
    gp = 0.0 if (!gp? or gp<0)
    obj.stats.gp = newStats.gp

# {taskId} task you want to score
# {direction} 'up' or 'down'
# {times} # times to call score on this task (1 unless cron, usually)
# {update} if we're running updates en-mass (eg, cron on server) pass in userObj
score = (taskId, direction, times, batch, cron) ->
  commit = false
  unless batch?
    commit = true
    batch = new schema.BatchUpdate(model)
    batch.startTransaction()
  obj = batch.obj()

  {gp, hp, exp, lvl} = obj.stats

  taskPath = "tasks.#{taskId}"
  taskObj = obj.tasks[taskId]
  {type, value} = taskObj

  delta = 0
  times ?= 1
  calculateDelta = (adjustvalue=true) ->
    # If multiple days have passed, multiply times days missed
    _.times times, (n) ->
      # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
      # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
      # rather than iteratively
      nextDelta = taskDeltaFormula(value, direction)
      value += nextDelta if adjustvalue
      delta += nextDelta

  addPoints = ->
    modified = expModifier(delta)
    exp += modified
    gp += modified

  subtractPoints = ->
    modified = hpModifier(delta)
    hp += modified

  switch type
    when 'habit'
      # Don't adjust values for habits that don't have both + and -
      adjustvalue = if (taskObj.up==false or taskObj.down==false) then false else true
      calculateDelta(adjustvalue)
      # Add habit value to habit-history (if different)
      if (delta > 0) then addPoints() else subtractPoints()
      taskObj.history ?= []
      if taskObj.value != value
        historyEntry = { date: +new Date, value: value }
        taskObj.history.push historyEntry
        batch.set "#{taskPath}.history", taskObj.history

    when 'daily'
      calculateDelta()
      if cron? # cron
        subtractPoints()
      else
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'todo'
      calculateDelta()
      unless cron? # don't touch stats on cron
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
  updateStats {hp: hp, exp: exp, gp: gp}, batch
  if commit
    # newStats / origStats is a glorious hack to trick Derby into seeing the change in model.on(*)
    newStats = _.clone batch.obj().stats
    _.each Object.keys(origStats), (key) -> obj.stats[key] = origStats[key]
    batch.setStats(newStats)
#    batch.setStats()
    batch.commit()
  return delta

###
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
###
cron = () ->
  today = +new Date
  daysPassed = helpers.daysBetween(today, user.get('lastCron'))
  if daysPassed > 0
    batch = new schema.BatchUpdate(model)
    batch.startTransaction()
    batch.set 'lastCron', today
    obj = batch.obj()
    hpBefore = obj.stats.hp #we'll use this later so we can animate hp loss
    # Tally each task
    todoTally = 0
    _.each obj.tasks, (taskObj) ->
      unless taskObj.id?
        console.error "a task had a null id during cron, this should not be happening"
        return

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
          score id, 'down', daysFailed, batch, true

        if type == 'daily'
          taskObj.history ?= []
          taskObj.history.push { date: +new Date, value: value }
          batch.set "tasks.#{taskObj.id}.history", taskObj.history
          batch.set "tasks.#{taskObj.id}.completed", false
        else
          value = obj.tasks[taskObj.id].value #get updated value
          absVal = if (completed) then Math.abs(value) else value
          todoTally += absVal

    # Finished tallying
    obj.history ?= {}; obj.history.todos ?= []; obj.history.exp ?= []
    obj.history.todos.push { date: today, value: todoTally }
    # tally experience
    expTally = obj.stats.exp
    lvl = 0 #iterator
    while lvl < (obj.stats.lvl-1)
      lvl++
      expTally += (lvl*100)/5
    obj.history.exp.push  { date: today, value: expTally }

    # Set the new user specs, and animate HP loss
    [hpAfter, obj.stats.hp] = [obj.stats.hp, hpBefore]
    batch.setStats()
    batch.set('history', obj.history)
    batch.commit()
    browser.resetDom(model)
    setTimeout (-> user.set 'stats.hp', hpAfter), 1000 # animate hp loss


module.exports = {
  setModel: setModel
  MODIFIER: MODIFIER
  score: score
  cron: cron

  # testing stuff
  expModifier: expModifier
  hpModifier: hpModifier
  taskDeltaFormula: taskDeltaFormula
}
