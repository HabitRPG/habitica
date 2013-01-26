async = require 'async'
moment = require 'moment'
_ = require 'underscore'
content = require './content'
helpers = require './helpers'
browser = require './browser'
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
  Handles updating the user model. If this is an en-mass operation (eg, server cron), pass the user object as {update}.
  otherwise, null means commit the changes immediately
###
userSet = (path, value, update) ->
  if update
    # Special function for setting object properties by string dot-notation. See http://stackoverflow.com/a/6394168/362790
    arr = path.split('.')
    arr.reduce (curr, next, index) ->
      if (arr.length - 1) == index
        curr[next] = value
      curr[next]
    , update
  else
    user.set path, value
  
###
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
###
updateStats = (newStats, update) ->
  userObj = update || user.get()

  # if user is dead, dont do anything
  return if userObj.stats.lvl == 0
    
  if newStats.hp?
    # Game Over
    if newStats.hp <= 0
      userSet 'stats.lvl', 0, update # signifies dead
      userSet 'stats.hp', 0, update
      return
    else
      userSet 'stats.hp', newStats.hp, update

  if newStats.exp?
    # level up & carry-over exp
    tnl = user.get '_tnl'
    if newStats.exp >= tnl
      newStats.exp -= tnl
      userSet 'stats.lvl', userObj.stats.lvl + 1, update
      userSet 'stats.hp', 50, update
    if !userObj.items?.itemsEnabled and newStats.exp >=15
      user.set 'items.itemsEnabled', true #bit of trouble using userSet here
    userSet 'stats.exp', newStats.exp, update

  if newStats.money?
    money = 0.0 if (!money? or money<0)
    userSet 'stats.money', newStats.money, update

# {taskId} task you want to score
# {direction} 'up' or 'down'
# {times} # times to call score on this task (1 unless cron, usually)
# {update} if we're running updates en-mass (eg, cron on server) pass in userObj
score = (taskId, direction, times, update) ->
  times ?= 1

  userObj = update or user.get()
  {money, hp, exp, lvl} = userObj.stats

  taskPath = "tasks.#{taskId}"
  taskObj = userObj.tasks[taskId]
  {type, value} = taskObj

  delta = 0
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
    money += modified

  subtractPoints = ->
    modified = hpModifier(delta)
    hp += modified

  switch type
    when 'habit'
      # Don't adjust values for habits that don't have both + and -
      adjustvalue = if (taskObj.up==false or taskObj.down==false) then false else true
      calculateDelta(adjustvalue)
      # Add habit value to habit-history (if different)
      historyEntry = { date: new Date(), value: value } if taskObj.value != value
      if (delta > 0) then addPoints() else subtractPoints()
      model.push "_user.#{taskPath}.history", historyEntry

    when 'daily'
      calculateDelta()
      if update? # cron
        subtractPoints()
      else
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'todo'
      calculateDelta()
      unless update? # don't touch stats on cron
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'reward'
      # Don't adjust values for rewards
      calculateDelta(false)
      # purchase item
      money -= taskObj.value
      num = parseFloat(taskObj.value).toFixed(2)
      # if too expensive, reduce health & zero money
      if money < 0
        hp += money # hp - money difference
        money = 0

  userSet "#{taskPath}.value", value, update
  updateStats {hp: hp, exp: exp, money: money}, update
  return delta

###
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
###
cron = (userObj) ->
  today = new Date()
  userObj.lastCron ?= today
  daysPassed = helpers.daysBetween(today, userObj.lastCron)
  if daysPassed > 0
    # Tally each task
    todoTally = 0
    _.each userObj.tasks, (taskObj) ->
      #FIXME remove broken tasks
      if taskObj.id? # a task had a null id during cron, this should not be happening
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
            score id, 'down', daysFailed, userObj

          value = userObj.tasks[taskObj.id].value #get updated value
          if type == 'daily'
            userObj.tasks[taskObj.id].history ?= []
            userObj.tasks[taskObj.id].history.push { date: today, value: value }
            userObj.tasks[taskObj.id].completed = false
          else
            absVal = if (completed) then Math.abs(value) else value
            todoTally += absVal

    # Finished tallying
    userObj.history ?= {}; userObj.history.todos ?= []; userObj.history.exp ?= []
    userObj.history.todos.push { date: today, value: todoTally }
    # tally experience
    expTally = userObj.stats.exp
    lvl = 0 #iterator
    while lvl < (userObj.stats.lvl-1)
      lvl++
      expTally += (lvl*100)/5
    userObj.history.exp.push  { date: today, value: expTally }
    userObj.lastCron = today # reset cron

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
