moment = require('moment')
_ = require('lodash')
helpers = require('./helpers.coffee')
items = require('./items.coffee')
{pets, hatchingPotions} = items.items

# Very strange bug where `require(./script/helpers.coffee)` is returning a blank object under certain circumsntances I haven't yet figured out
helpers = require('habitrpg-shared/script/helpers') if _.isEmpty(helpers)

XP = 15
HP = 2
obj = module.exports = {}


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
    (user._tmp?={}).streakBonus = afterStreak - val if (val > 0) # keep this on-hand for later, so we can notify streak-bonus
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
  paths['items.lastDrop'] = true
  reachedDropLimit = (helpers.daysBetween(user.items.lastDrop.date, +new Date) is 0) and (user.items.lastDrop.count >= 2)
  return if reachedDropLimit

  # % chance of getting a pet or meat
  chanceMultiplier = Math.abs(delta)
  chanceMultiplier *= obj.priorityValue(priority) # multiply chance by reddness
  chanceMultiplier += streak # streak bonus

  if user.flags?.dropsEnabled and Math.random() < (.05 * chanceMultiplier)
    # current breakdown - 1% (adjustable) chance on drop
    # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
    rarity = Math.random()

    # Egg, 50% chance
    if rarity > .5
      drop = helpers.randomVal(pets)
      (user.items.eggs ?= []).push drop; paths['items.eggs'] = true
      drop.type = 'Egg'
      drop.dialog = "You've found a #{drop.text} Egg! #{drop.notes}"

      # Hatching Potion, 50% chance - break down by rarity even more. FIXME this may not be the best method, so revisit
    else
      acceptableDrops = []

      # Tier 5 (Blue Moon Rare)
      if rarity < .1
        acceptableDrops =
          ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton', 'Zombie', 'CottonCandyPink', 'CottonCandyBlue',
           'Golden']

        # Tier 4 (Very Rare)
      else if rarity < .2
        acceptableDrops =
          ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton', 'Zombie', 'CottonCandyPink', 'CottonCandyBlue']

        # Tier 3 (Rare)
      else if rarity < .3
        acceptableDrops = ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton']
      
      # Commented out for testing with increased egg drop, delete if successful
        # Tier 2 (Scarce)
      # else if rarity < .4
      #   acceptableDrops = ['Base', 'White', 'Desert']
      
        # Tier 1 (Common)
      else
        acceptableDrops = ['Base', 'White', 'Desert']

      acceptableDrops = hatchingPotions.filter (hatchingPotion) ->
        hatchingPotion.name in acceptableDrops
      drop = helpers.randomVal acceptableDrops
      (user.items.hatchingPotions ?= []).push drop.name; paths['items.hatchingPotions'] = true
      drop.type = 'HatchingPotion'
      drop.dialog = "You've found a #{drop.text} Hatching Potion! #{drop.notes}"

    # if they've dropped something, we want the consuming client to know so they can notify the user. See how the Derby
    # app handles it for example. Would this be better handled as an emit() ?
    (user._tmp?={}).drop = drop

    user.items.lastDrop.date = +new Date
    user.items.lastDrop.count++
    paths['items.lastDrop'] = true

#  {task} task you want to score
#  {direction} 'up' or 'down'
obj.score = (user, task, direction, options={}) ->
  {gp, hp, exp, lvl} = user.stats
  {type, value, streak} = task
  [paths, times, cron] = [options.paths || {}, options.times || 1, options.cron || false]
  priority = task.priority or '!'

  # If they're trying to purhcase a too-expensive reward, confirm they want to take a hit for it
  if task.value > user.stats.gp and task.type is 'reward'
    return unless confirm "Not enough GP to purchase this reward, buy anyway and lose HP? (Punishment for taking a reward you didn't earn)."

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
    level = user.stats.lvl
    weaponStrength = items.items.weapon[user.items.weapon].strength
    exp += obj.expModifier(delta, weaponStrength, level, priority) / 2 # /2 hack for now, people leveling too fast
    if streak
      gp += obj.gpModifier(delta, 1, priority, streak, user)
    else
      gp += obj.gpModifier(delta, 1, priority)


  subtractPoints = ->
    level = user.stats.lvl
    armorDefense = items.items.armor[user.items.armor].defense
    helmDefense = items.items.head[user.items.head].defense
    shieldDefense = items.items.shield[user.items.shield].defense
    hp += obj.hpModifier(delta, armorDefense, helmDefense, shieldDefense, level, priority)

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
        else
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

  # Drop system #FIXME
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
      user.stats.hp = 0; paths['stats.hp'] = true # signifies dead
      return
    else
      user.stats.hp = newStats.hp; paths['stats.hp'] = true

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

    paths["stats.exp"]=true; paths['stats.lvl']=true; paths['stats.gp']=true; paths['stats.hp']=true;
    #if silent
    #console.log("pushing silent :"  + obj.stats.exp)


    # Set flags when they unlock features
    user.flags ?= {}
    if !user.flags.customizationsNotification and (user.stats.exp > 10 or user.stats.lvl > 1)
      user.flags.customizationsNotification = true; paths['flags.customizationsNotification']=true;
    if !user.flags.itemsEnabled and user.stats.lvl >= 2
      user.flags.itemsEnabled = true; paths['flags.itemsEnabled']=true;
    if !user.flags.partyEnabled and user.stats.lvl >= 3
      user.flags.partyEnabled = true; paths['flags.partyEnabled']=true;
    if !user.flags.dropsEnabled and user.stats.lvl >= 4
      user.flags.dropsEnabled = true; paths['flags.dropsEnabled']=true;

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
  if !user.lastCron? or user.lastCron is 'new' or moment(user.lastCron).isAfter(now)
    user.lastCron = now; paths['lastCron'] = true
    return

  daysMissed = helpers.daysBetween(user.lastCron, now, user.preferences?.dayStart)
  return unless daysMissed > 0

  user.lastCron = now; paths['lastCron'] = true

  # User is resting at the inn. Used to be we un-checked each daily without performing calculation (see commits before fb29e35)
  # but to prevent abusing the inn (http://goo.gl/GDb9x) we now do *not* calculate dailies, and simply set lastCron to today
  return if user.flags.rest is true

  # Tally each task
  todoTally = 0
  user.todos.concat(user.dailys).forEach (task) ->
    {id, type, completed, repeat} = task
    # Deduct experience for missed Daily tasks, but not for Todos (just increase todo's value)
    unless completed
      scheduleMisses = daysMissed
      # for dailys which have repeat dates, need to calculate how many they've missed according to their own schedule
      if (type is 'daily') and repeat
        scheduleMisses = 0
        _.times daysMissed, (n) ->
          thatDay = moment(now).subtract('days', n + 1)
          scheduleMisses++ if helpers.shouldDo(thatDay, repeat, {dayStart:obj.preferences?.dayStart})
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
  user


