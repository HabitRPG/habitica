({ define: (
  if typeof define == "function"
    define
  else
    (F)->
      F(require, exports, module)
)}).define (require, exports, module)->
  helpers = require('./helpers')
  moment = require('./moment')
  XP = 15
  HP = 2
  obj = module.exports =
  {};
  obj.priorityValue = (priority = '!') ->
    switch priority
      when '!' then 1
      when '!!' then 1.5
      when '!!!' then 2
      else
        1

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
      streakBonus = streak / 100 + 1
      # eg, 1-day streak is 1.1, 2-day is 1.2, etc
      afterStreak = val * streakBonus
      user.streakBonus = afterStreak - val if (val > 0)
      # can we do this without model? just global emit?
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

  randomDrop = (user, delta, priority, streak = 0) ->
    # limit drops to 2 / day
    if !user.items.lastDrop?
      user.items =
      {
      date: +moment().subtract('d', 1) # trick - set it to yesterday on first run, that way they can get drops today
      count: 0
      }
    reachedDropLimit = (helpers.daysBetween(user.items.lastDrop.date,
                                            +new Date) is 0) and user.items.lastDrop.count >= 2
    return if reachedDropLimit

    # % chance of getting a pet or meat
    chanceMultiplier = Math.abs(delta)
    chanceMultiplier *= obj.priorityValue(priority)
    # multiply chance by reddness
    chanceMultiplier += streak
    # streak bonus
    console.log chanceMultiplier

    if user.flags.dropsEnabled and Math.random() < (.05 * chanceMultiplier)
      # current breakdown - 3% (adjustable) chance on drop
      # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
      rarity = Math.random()

      # Egg, 40% chance
      if rarity > .6
        drop = randomVal(pets)
        user.items.eggs.push drop
        drop.type = 'Egg'
        drop.dialog = "You've found a #{drop.text} Egg! #{drop.notes}"

        # Hatching Potion, 60% chance - break down by rarity even more. FIXME this may not be the best method, so revisit
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

          # Tier 2 (Scarce)
        else if rarity < .4
          acceptableDrops = ['Base', 'White', 'Desert']
          # Tier 1 (Common)
        else
          acceptableDrops = ['Base']

        acceptableDrops = hatchingPotions.filter (hatchingPotion) ->
          hatchingPotion.name in acceptableDrops
        drop = randomVal acceptableDrops
        user.items.hatchingPotions.push drop.name
        drop.type = 'HatchingPotion'
        drop.dialog = "You've found a #{drop.text} Hatching Potion! #{drop.notes}"

      user.drop = drop

      user.items.lastDrop.date = +new Date
      user.items.lastDrop.count++

  #  {task} task you want to score
  #  {direction} 'up' or 'down'
  obj.score = (user, task, direction, items) ->
    {gp, hp, exp, lvl} = user.stats
    {type, value, streak} = task
    priority = task.priority or '!'

    # If they're trying to purhcase a too-expensive reward, confirm they want to take a hit for it
    if task.value > user.stats.gp and task.type is 'reward'
      r = confirm "Not enough GP to purchase this reward, buy anyway and lose HP? (Punishment for taking a reward you didn't earn)."
      unless r
        #TODO if this rule is working OK.
        return

    delta = 0
    calculateDelta = (adjustvalue = true) ->
      # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
      # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
      # rather than iteratively
      nextDelta = obj.taskDeltaFormula(value, direction)
      value += nextDelta if adjustvalue
      delta += nextDelta

    addPoints = ->
      level = user.stats.lvl
      weaponStrength = items.items.weapon[user.items.weapon].strength
      exp += obj.expModifier(delta, weaponStrength, level, priority) / 2
      # / 2 hack for now bcause people leveling too fast
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
        task.history ?= []
        if task.value != value
          historyEntry = { date: +new Date, value: value }
          task.history.push historyEntry

      when 'daily'
        calculateDelta(false)
        if delta != 0
          addPoints()
          # obviously for delta>0, but also a trick to undo accidental checkboxes
          if direction is 'up'
            streak = if streak then streak + 1 else 1
          else
            streak = if streak then streak - 1 else 0
          task.streak = streak

      when 'todo'
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

    task.value = value
    updateStats user, { hp, exp, gp }

    # Drop system
    #    randomDrop(user, delta, priority, streak) if direction is 'up'

    return delta

  ###
    Updates user stats with new stats. Handles death, leveling up, etc
    {stats} new stats
    {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
  ###
  updateStats = (user, newStats) ->
    # if user is dead, dont do anything
    return if user.stats.hp <= 0

    if newStats.hp?
      # Game Over
      if newStats.hp <= 0
        user.stats.hp = 0
        # signifies dead
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
          user.stats.exp = newStats.exp
          # push normal + notification
          while newStats.exp >= tnl and user.stats.lvl < 100 # keep levelling up
            newStats.exp -= tnl
            user.stats.lvl++
            tnl = obj.tnl(user.stats.lvl)
          if user.stats.lvl == 100
            newStats.exp = 0
          user.stats.hp = 50

      user.stats.exp = newStats.exp
      #if silent
      #console.log("pushing silent :"  + obj.stats.exp)


      # Set flags when they unlock features
      if !user.flags.customizationsNotification and (user.stats.exp > 10 or user.stats.lvl > 1)
        user.flags.customizationsNotification = true
      if !user.flags.itemsEnabled and user.stats.lvl >= 2
        user.flags.itemsEnabled = true
      if !user.flags.partyEnabled and user.stats.lvl >= 3
        user.flags.partyEnabled = true
      if !user.flags.dropsEnabled and user.stats.lvl >= 4
        user.flags.dropsEnabled = true

    if newStats.gp?
      #FIXME what was I doing here? I can't remember, gp isn't defined
      gp = 0.0 if (!gp? or gp < 0)
      user.stats.gp = newStats.gp

  ###
    At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
    For incomplete Dailys, deduct experience
    Make sure to run this function once in a while as server will not take care of overnight calculations.
    And you have to run it every time client connects.
  ###
  obj.cron = (user) ->
    today = +new Date
    daysPassed = helpers.daysBetween(user.lastCron, today, user.preferences.dayStart)
    if daysPassed > 0
      user.lastCron = today

      if user.flags.rest is true
        user.dailys.forEach (daily) ->
          daily.completed = false
        return

      # Tally each task
      todoTally = 0
      user.todos.concat(user.dailys).forEach (task) ->
        {id, type, completed, repeat} = task
        # Deduct experience for missed Daily tasks,
        # but not for Todos (just increase todo's value)
        unless completed
          # for todos & typical dailies, these are equivalent
          daysFailed = daysPassed
          # however, for dailys which have repeat dates, need
          # to calculate how many they've missed according to their own schedule
          if type == 'daily' && repeat
            daysFailed = 0
            for i in [1..daysPassed] by 1
              thatDay = moment().subtract('days', i + 1)
              if repeat[helpers.dayMapping[thatDay.day()]] == true
                daysFailed++
          score user, task, 'down'
        if type == 'daily'
          if completed #set OHV for completed dailies
            task.value = task.value + taskDeltaFormula(task.value, 'up')
          task.history ?= []
          task.history.push { date: +new Date, value: task.value }
          task.completed = false
        else
          #get updated value
          absVal = if (completed) then Math.abs(task.value) else task.value
          todoTally += absVal
      user.habits.forEach (task) -> # slowly reset 'onlies' value to 0
        if task.up == false or task.down == false
          if Math.abs(task.value) < 0.1
            task.value = 0
          else
            task.value = task.value / 2

      # Finished tallying
      user.history ?= {};
      user.history.todos ?= [];
      user.history.exp ?= []
      user.history.todos.push { date: today, value: todoTally }
      # tally experience
      expTally = user.stats.exp
      lvl = 0
      #iterator
      while lvl < (user.stats.lvl - 1)
        lvl++
        expTally += obj.tnl(lvl)
      user.history.exp.push { date: today, value: expTally }
      user


