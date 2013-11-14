moment = require('moment')
_ = require('lodash')
helpers = require('./helpers.coffee')
items = require('./items.coffee')
{eggs, hatchingPotions} = items.items

XP = 15
HP = 2
obj = module.exports = {}

obj.revive = (user, options={})->
  paths = options.paths || {}

  # Reset stats
  user.stats.hp = 50
  user.stats.exp = 0
  user.stats.gp = 0
  user.stats.lvl-- if user.stats.lvl > 1

  ## Lose a random item
  loseThisItem = false
  owned = user.items
  # unless they're already at 0-everything
  if ~~owned.armor > 0 or ~~owned.head > 0 or ~~owned.shield > 0 or ~~owned.weapon > 0
    # find a random item to lose
    until loseThisItem
      #candidate = {0:'items.armor', 1:'items.head', 2:'items.shield', 3:'items.weapon', 4:'stats.gp'}[Math.random()*5|0]
      candidate = {0:'armor', 1:'head', 2:'shield', 3:'weapon'}[Math.random()*4|0]
      loseThisItem = candidate if owned[candidate] > 0
    user.items[loseThisItem] = 0
  "stats.hp stats.exp stats.gp stats.lvl items.#{loseThisItem}".split(' ').forEach (path) ->
    paths[path] = 1


obj.priorityValue = (priority = '!') ->
  switch priority
    when '!' then 1
    when '!!' then 1.5
    when '!!!' then 2
    else 1

obj.tnl = (level) ->
  if level >= 100
    value = 0
  else
    value = Math.round(((Math.pow(level, 2) * 0.25) + (10 * level) + 139.75) / 10) * 10
  # round to nearest 10
  return value

###
  Calculates Exp modificaiton based on level and weapon strength
  {value} task.value for exp gain
  {weaponStrength) weapon strength
  {level} current user level
  {priority} user-defined priority multiplier
###
obj.expModifier = (value, weaponStr, level, priority = '!') ->
  str = (level - 1) / 2
  # ultimately get this from user
  totalStr = (str + weaponStr) / 100
  strMod = 1 + totalStr
  exp = value * XP * strMod * obj.priorityValue(priority)
  return Math.round(exp)

###
  Calculates HP modification based on level and armor defence
  {value} task.value for hp loss
  {armorDefense} defense from armor
  {helmDefense} defense from helm
  {level} current user level
  {priority} user-defined priority multiplier
###
obj.hpModifier = (value, armorDef, helmDef, shieldDef, level, priority = '!') ->
  def = (level - 1) / 2
  # ultimately get this from user?
  totalDef = (def + armorDef + helmDef + shieldDef) / 100
  #ultimate get this from user
  defMod = 1 - totalDef
  hp = value * HP * defMod * obj.priorityValue(priority)
  return Math.round(hp * 10) / 10
# round to 1dp

###
  Future use
  {priority} user-defined priority multiplier
###
obj.gpModifier = (value, modifier, priority = '!', streak, user) ->
  val = value * modifier * obj.priorityValue(priority)
  if streak and user
    streakBonus = streak / 100 + 1 # eg, 1-day streak is 1.1, 2-day is 1.2, etc
    afterStreak = val * streakBonus
    user._tmp.streakBonus = afterStreak - val if (val > 0) # keep this on-hand for later, so we can notify streak-bonus
    return afterStreak
  else
    return val

###
  Calculates the next task.value based on direction
  Uses a capped inverse log y=.95^x, y>= -5
  {currentValue} the current value of the task
  {direction} up or down
###
obj.taskDeltaFormula = (currentValue, direction) ->
  if currentValue < -47.27 then currentValue = -47.27
  else if currentValue > 21.27 then currentValue = 21.27
  delta = Math.pow(0.9747, currentValue)
  return delta if direction is 'up'
  return -delta


###
  Drop System
###

randomDrop = (user, delta, priority, streak = 0, options={}) ->
  paths = options.paths || {}
  # limit drops to 2 / day
  user.items.lastDrop ?=
    date: +moment().subtract('d', 1) # trick - set it to yesterday on first run, that way they can get drops today
    count: 0

  reachedDropLimit = (helpers.daysSince(user.items.lastDrop.date, user.preferences) is 0) and (user.items.lastDrop.count >= 5)
  return if reachedDropLimit

  # % chance of getting a pet or meat
  chanceMultiplier = Math.abs(delta)
  chanceMultiplier *= obj.priorityValue(priority) # multiply chance by reddness
  chanceMultiplier += streak # streak bonus

  if user.flags?.dropsEnabled and Math.random() < (.05 * chanceMultiplier)
    # current breakdown - 1% (adjustable) chance on drop
    # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
    rarity = Math.random()

    # Food: 40% chance
    if rarity > .6
      drop = helpers.randomVal _.omit(items.items.food, 'Saddle')
      user.items.food[drop.name] ?= 0
      user.items.food[drop.name]+= 1
      drop.type = 'Food'
      drop.dialog = "You've found a #{drop.text} Food! #{drop.notes}"

    # Eggs: 30% chance
    else if rarity > .3
      drop = helpers.randomVal eggs
      user.items.eggs[drop.name] ?= 0
      user.items.eggs[drop.name]++
      drop.type = 'Egg'
      drop.dialog = "You've found a #{drop.text} Egg! #{drop.notes}"

    # Hatching Potion, 30% chance - break down by rarity.
    else
      acceptableDrops =
        # Very Rare: 10% (of 30%)
        if rarity < .03 then ['Golden']
        # Rare: 20% (of 30%)
        else if rarity < .06 then ['Zombie', 'CottonCandyPink', 'CottonCandyBlue']
        # Uncommon: 30% (of 30%)
        else if rarity < .09 then ['Red', 'Shade', 'Skeleton']
        # Common: 40% (of 30%)
        else ['Base', 'White', 'Desert']

      # No Rarity (@see https://github.com/HabitRPG/habitrpg/issues/1048, we may want to remove rareness when we add mounts)
      #drop = helpers.randomVal hatchingPotions
      drop = helpers.randomVal _.pick(hatchingPotions, ((v,k) -> k in acceptableDrops))

      user.items.hatchingPotions[drop.name] ?= 0
      user.items.hatchingPotions[drop.name]++
      drop.type = 'HatchingPotion'
      drop.dialog = "You've found a #{drop.text} Hatching Potion! #{drop.notes}"

    # if they've dropped something, we want the consuming client to know so they can notify the user. See how the Derby
    # app handles it for example. Would this be better handled as an emit() ?
    user._tmp.drop = drop

    user.items.lastDrop.date = +new Date
    user.items.lastDrop.count++


#  {task} task you want to score
#  {direction} 'up' or 'down'
obj.score = (user, task, direction, options={}) ->

  # This is for setting one-time temporary flags, such as streakBonus or itemDropped. Useful for notifying
  # the API consumer, then cleared afterwards
  user._tmp = {}

  [gp, hp, exp, lvl] = [+user.stats.gp, +user.stats.hp, +user.stats.exp, ~~user.stats.lvl]
  [type, value, streak, priority] = [task.type, +task.value, ~~task.streak, task.priority or '!']
  [paths, times, cron] = [options.paths || {}, options.times || 1, options.cron || false]

  # Handle corrupt tasks
  # This type of cleanup-code shouldn't be necessary, revisit once we're off Derby
  return 0 unless task.id
  if !_.isNumber(value) or _.isNaN(value)
    task.value = value = 0;
    paths["tasks.#{task.id}.value"] = true
  _.each user.stats, (v,k) ->
    if !_.isNumber(v) or _.isNaN(v)
      user.stats[k] = 0; paths["stats.#{k}"] = true

  # If they're trying to purhcase a too-expensive reward, don't allow them to do that.
  if task.value > user.stats.gp and task.type is 'reward'
    return

  delta = 0
  calculateDelta = (adjustvalue = true) ->
    # If multiple days have passed, multiply times days missed
    _.times times, ->
      # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
      # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
      # rather than iteratively
      nextDelta = obj.taskDeltaFormula(value, direction)
      value += nextDelta if adjustvalue
      delta += nextDelta

  addPoints = ->
    weaponStr = items.getItem('weapon', user.items.weapon).strength
    exp += obj.expModifier(delta, weaponStr, user.stats.lvl, priority) / 2 # /2 hack for now, people leveling too fast
    if streak
      gp += obj.gpModifier(delta, 1, priority, streak, user)
    else
      gp += obj.gpModifier(delta, 1, priority)


  subtractPoints = ->
    armorDef = items.getItem('armor', user.items.armor).defense
    headDef = items.getItem('head', user.items.head).defense
    shieldDef = items.getItem('shield', user.items.shield).defense
    hp += obj.hpModifier(delta, armorDef, headDef, shieldDef, user.stats.lvl, priority)

  switch type
    when 'habit'
      calculateDelta()
      # Add habit value to habit-history (if different)
      if (delta > 0) then addPoints() else subtractPoints()
      if task.value != value
        (task.history ?= []).push { date: +new Date, value: value }; paths["tasks.#{task.id}.history"] = true

    when 'daily'
      if cron
        calculateDelta()
        subtractPoints()
        task.streak = 0
      else
        calculateDelta()
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes
        if direction is 'up'
          streak = if streak then streak + 1 else 1

          # Give a streak achievement when the streak is a multiple of 21
          if (streak % 21) is 0
            user.achievements.streak = if user.achievements.streak then user.achievements.streak + 1 else 1
            paths["achievements.streak"] = true

        else
          # Remove a streak achievement if streak was a multiple of 21 and the daily was undone
          if (streak % 21) is 0
            user.achievements.streak = if user.achievements.streak then user.achievements.streak - 1 else 0
            paths["achievements.streak"] = true

          streak = if streak then streak - 1 else 0
        task.streak = streak

      paths["tasks.#{task.id}.streak"] = true

    when 'todo'
      if cron
        calculateDelta()
        #don't touch stats on cron
      else
        calculateDelta()
        addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

    when 'reward'
    # Don't adjust values for rewards
      calculateDelta(false)
      # purchase item
      gp -= Math.abs(task.value)
      num = parseFloat(task.value).toFixed(2)
      # if too expensive, reduce health & zero gp
      if gp < 0
        hp += gp
        # hp - gp difference
        gp = 0

  task.value = value; paths["tasks.#{task.id}.value"] = true
  updateStats user, { hp, exp, gp }, {paths: paths}

  # Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
  if typeof window is 'undefined'
    randomDrop(user, delta, priority, streak, {paths: paths}) if direction is 'up'

  return delta

###
  Updates user stats with new stats. Handles death, leveling up, etc
  {stats} new stats
  {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
###
updateStats = (user, newStats, options={}) ->
  paths = options.paths || {}
  # if user is dead, dont do anything
  return if user.stats.hp <= 0

  if newStats.hp?
    # Game Over
    if newStats.hp <= 0
      user.stats.hp = 0
      return
    else
      user.stats.hp = newStats.hp

  if newStats.exp?
    tnl = obj.tnl(user.stats.lvl)
    #silent = false
    # if we're at level 100, turn xp to gold
    if user.stats.lvl >= 100
      newStats.gp += newStats.exp / 15
      newStats.exp = 0
      user.stats.lvl = 100
    else
      # level up & carry-over exp
      if newStats.exp >= tnl
        #silent = true # push through the negative xp silently
        user.stats.exp = newStats.exp # push normal + notification
        while newStats.exp >= tnl and user.stats.lvl < 100 # keep levelling up
          newStats.exp -= tnl
          user.stats.lvl++
          tnl = obj.tnl(user.stats.lvl)
        if user.stats.lvl == 100
          newStats.exp = 0
        user.stats.hp = 50

    user.stats.exp = newStats.exp

    # Set flags when they unlock features
    user.flags ?= {}
    if !user.flags.customizationsNotification and (user.stats.exp > 10 or user.stats.lvl > 1)
      user.flags.customizationsNotification = true
    if !user.flags.itemsEnabled and user.stats.lvl >= 2
      user.flags.itemsEnabled = true
    if !user.flags.partyEnabled and user.stats.lvl >= 3
      user.flags.partyEnabled = true
    if !user.flags.dropsEnabled and user.stats.lvl >= 4
      user.flags.dropsEnabled = true
      user.items.eggs["Wolf"] = 1

  if newStats.gp?
    #FIXME what was I doing here? I can't remember, gp isn't defined
    gp = 0.0 if (!gp? or gp < 0)
    user.stats.gp = newStats.gp

###
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
  Make sure to run this function once in a while as server will not take care of overnight calculations.
  And you have to run it every time client connects.
  {user}
###
obj.cron = (user, options={}) ->
  [paths, now] = [options.paths || {}, +options.now || +new Date]

  # New user (!lastCron, lastCron==new) or it got busted somehow, maybe they went to a different timezone
  # FIXME move this to pre-save in mongoose
  if !user.lastCron? or user.lastCron is 'new' or moment(user.lastCron).isAfter(now)
    user.lastCron = now; paths['lastCron'] = true
    return

  daysMissed = helpers.daysSince user.lastCron, _.defaults({now}, user.preferences)
  return unless daysMissed > 0

  user.lastCron = now; paths['lastCron'] = true

  # Reset the lastDrop count to zero
  if user.items.lastDrop.count > 0
    user.items.lastDrop.count = 0
    paths['items.lastDrop'] = true

  # User is resting at the inn. Used to be we un-checked each daily without performing calculation (see commits before fb29e35)
  # but to prevent abusing the inn (http://goo.gl/GDb9x) we now do *not* calculate dailies, and simply set lastCron to today
  return if user.flags.rest is true

  # Tally each task
  todoTally = 0
  user.todos.concat(user.dailys).forEach (task) ->
    return unless task
    {id, type, completed, repeat} = task
    # Deduct experience for missed Daily tasks, but not for Todos (just increase todo's value)
    unless completed
      scheduleMisses = daysMissed
      # for dailys which have repeat dates, need to calculate how many they've missed according to their own schedule
      if (type is 'daily') and repeat
        scheduleMisses = 0
        _.times daysMissed, (n) ->
          thatDay = moment(now).subtract('days', n + 1)
          scheduleMisses++ if helpers.shouldDo(thatDay, repeat, user.preferences)
      obj.score(user, task, 'down', {times:scheduleMisses, cron:true, paths:paths}) if scheduleMisses > 0

    switch type
      when 'daily'
        (task.history ?= []).push({ date: +new Date, value: task.value }); paths["tasks.#{task.id}.history"] = true
        task.completed = false; paths["tasks.#{task.id}.completed"] = true;
      when 'todo'
        #get updated value
        absVal = if (completed) then Math.abs(task.value) else task.value
        todoTally += absVal

  user.habits.forEach (task) -> # slowly reset 'onlies' value to 0
    if task.up is false or task.down is false
      if Math.abs(task.value) < 0.1
        task.value = 0
      else
        task.value = task.value / 2
      paths["tasks.#{task.id}.value"] = true


  # Finished tallying
  ((user.history ?= {}).todos ?= []).push { date: now, value: todoTally }
  # tally experience
  expTally = user.stats.exp
  lvl = 0 #iterator
  while lvl < (user.stats.lvl - 1)
    lvl++
    expTally += obj.tnl(lvl)
  (user.history.exp ?= []).push { date: now, value: expTally }
  paths["history"] = true
  obj.preenUserHistory(user) # we can probably start removing paths[...] stuff, no longer used by our app
  user

###
Preen history for users with > 7 history entries
This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
###
preenHistory = (history) ->
  history = _.filter(history, (h) -> !!h) # discard nulls (corrupted somehow)
  newHistory = []
  preen = (amount, groupBy) ->
    groups = _.chain(history)
      .groupBy((h) -> moment(h.date).format groupBy) # get date groupings to average against
      .sortBy((h, k) -> k) # sort by date
      .value() # turn into an array
    groups = groups.slice(-amount)
    groups.pop() # get rid of "this week", "this month", etc (except for case of days)
    _.each groups, (group) ->
      newHistory.push
        date: moment(group[0].date).toDate()
        #date: moment(group[0].date).format('MM/DD/YYYY') # Use this one when testing
        value: _.reduce(group, ((m, obj) -> m + obj.value), 0) / group.length # average
      true

  # Keep the last:
  preen 50, "YYYY" # 50 years (habit will toootally be around that long!)
  preen moment().format('MM'), "YYYYMM" # last MM months (eg, if today is 05, keep the last 5 months)

  # Then keep all days of this month. Note, the extra logic is to account for Habits, which can be counted multiple times per day
  # FIXME I'd rather keep 1-entry/week of this month, then last 'd' days in this week. However, I'm having issues where the 1st starts mid week
  thisMonth = moment().format('YYYYMM')
  newHistory = newHistory.concat _.filter(history, (h)-> moment(h.date).format('YYYYMM') is thisMonth)
  #preen Math.ceil(moment().format('D')/7), "YYYYww" # last __ weeks (# weeks so far this month)
  #newHistory = newHistory.concat(history.slice -moment().format('D')) # each day of this week

  newHistory

# Registered users with some history
obj.preenUserHistory = (user, minHistLen = 7) ->
  _.each user.habits.concat(user.dailys), (task) ->
    task.history = preenHistory(task.history) if task.history?.length > minHistLen
    true

  _.defaults user.history, {todos:[], exp: []}
  user.history.exp = preenHistory(user.history.exp) if user.history.exp.length > minHistLen
  user.history.todos = preenHistory(user.history.todos) if user.history.todos.length > minHistLen
  #user.markModified('history')
  #user.markModified('habits')
  #user.markModified('dailys')

