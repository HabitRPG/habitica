
###
  Drop System
###
randomDrop = (model, delta, priority) ->
  user = model.at('_user')

  # limit drops to 2 / day
  user.setNull 'items.lastDrop',
    date: +moment().subtract('d',1) # trick - set it to yesterday on first run, that way they can get drops today
    count: 0
  reachedDropLimit = (helpers.daysBetween(user.get('items.lastDrop.date'), +new Date) is 0) and user.get('items.lastDrop.count') >= 2
  return if reachedDropLimit and model.flags.nodeEnv != 'development'

  # % chance of getting a pet or meat
  # debugging purpose - 50% chance during development, 3% chance on prod
  chanceMultiplier = if (model.flags.nodeEnv is 'development') then 50 else 1
  # TODO temporary min cap of 1 so people still get rewarded for good habits. Will change once we have streaks
  deltaMultiplier = if Math.abs(delta) < 1 then 1 else Math.abs(delta)
  chanceMultiplier = chanceMultiplier * deltaMultiplier * algos.priorityValue(priority) # multiply chance by reddness

  if user.get('flags.dropsEnabled') and Math.random() < (.05 * chanceMultiplier)
    # current breakdown - 3% (adjustable) chance on drop
    # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
    rarity = Math.random()

    # Egg, 40% chance
    if rarity > .6
      drop = randomVal(pets)
      user.push 'items.eggs', drop
      drop.type = 'Egg'
      drop.dialog = "You've found a #{drop.text} Egg! #{drop.notes}"

      # Hatching Potion, 60% chance - break down by rarity even more. FIXME this may not be the best method, so revisit
    else
      acceptableDrops = []

      # Tier 5 (Blue Moon Rare)
      if rarity < .1
        acceptableDrops = ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton', 'Zombie', 'CottonCandyPink', 'CottonCandyBlue', 'Golden']

        # Tier 4 (Very Rare)
      else if rarity < .2
        acceptableDrops = ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton', 'Zombie', 'CottonCandyPink', 'CottonCandyBlue']

        # Tier 3 (Rare)
      else if rarity < .3
        acceptableDrops = ['Base', 'White', 'Desert', 'Red', 'Shade', 'Skeleton']

        # Tier 2 (Scarce)
      else if rarity < .4
        acceptableDrops = ['Base', 'White', 'Desert']
        # Tier 1 (Common)
      else
        acceptableDrops = ['Base']

      acceptableDrops = _.filter(hatchingPotions, (hatchingPotion) -> hatchingPotion.name in acceptableDrops)
      drop = randomVal acceptableDrops
      user.push 'items.hatchingPotions', drop.name
      drop.type = 'HatchingPotion'
      drop.dialog = "You've found a #{drop.text} Hatching Potion! #{drop.notes}"

    model.set '_drop', drop
    $('#item-dropped-modal').modal 'show'

    user.set 'items.lastDrop.date', +new Date
    user.incr 'items.lastDrop.count'

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

  # Commit
  if commit
    # newStats / origStats is a glorious hack to trick Derby into seeing the change in model.on(*)
    newStats = _.clone batch.obj().stats
    _.each Object.keys(origStats), (key) -> obj.stats[key] = origStats[key]
    batch.setStats(newStats)
    # batch.setStats()
    batch.commit()

  # Drop system
  randomDrop(model, delta, priority) if direction is 'up'

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
    # NOTE we have to first model.set() the flag to true, then AFTER that obj.flags.flag = true
    # The reason is model.on() listeners still track object references, so if obj.flags.flags = true and then we
    # model.set(), the second argument of .on() listeners will be true (in otherwords, before/after tests will fail)
    if !obj.flags.customizationsNotification and (obj.stats.exp > 10 or obj.stats.lvl > 1)
      batch.set 'flags.customizationsNotification', true
      obj.flags.customizationsNotification = true
    if !obj.flags.itemsEnabled and obj.stats.lvl >= 2
      # Set to object, then also send to browser right away to get model.on() subscription notification
      batch.set 'flags.itemsEnabled', true
      obj.flags.itemsEnabled = true
    if !obj.flags.partyEnabled and obj.stats.lvl >= 3
      batch.set 'flags.partyEnabled', true
      obj.flags.partyEnabled = true
    if !obj.flags.dropsEnabled and obj.stats.lvl >= 4
      batch.set 'flags.dropsEnabled', true
      obj.flags.dropsEnabled = true

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
    obj = batch.obj()
    batch.set 'lastCron', today

    if user.get('flags.rest') is true
      _.each model.get('_dailyList'), (daily) -> batch.set("tasks.#{daily.id}.completed", false)
      browser.resetDom(model)
      batch.commit()
      return

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
