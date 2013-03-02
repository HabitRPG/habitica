async = require 'async'
moment = require 'moment'
_ = require 'underscore'
helpers = require './helpers'
browser = require './browser'
character = require './character'
items = require './items'
algos = require './algos'

module.exports.Scoring = (model) ->
  MODIFIER = algos.MODIFIER # each new level, armor, weapon add 2% modifier (this mechanism will change)
  user = model.at '_user'

  # {taskId} task you want to score
  # {direction} 'up' or 'down'
  # {times} # times to call score on this task (1 unless cron, usually)
  # {update} if we're running updates en-mass (eg, cron on server) pass in userObj
  score = (taskId, direction, times, batch, cron) ->
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
      modified = algos.expModifier(delta,weaponStrength,level)
      exp += modified*10
      gp += delta

    subtractPoints = ->
      level = user.get('stats.lvl')
      armorDefense = items.items.armor[user.get('items.armor')].defense
      helmDefense = items.items.head[user.get('items.head')].defense
      shieldDefense = items.items.shield[user.get('items.shield')].defense
      modified = algos.hpModifier(delta,armorDefense,helmDefense,shieldDefense,level)
      hp += modified

    switch type
      when 'habit'
        # Don't adjust values for habits that don't have both + and -
        #adjustvalue = if (taskObj.up==false or taskObj.down==false) then false else true
        adjustvalue = true;
        calculateDelta(adjustvalue)
        # Add habit value to habit-history (if different)
        if (delta > 0) then addPoints() else subtractPoints()
        taskObj.history ?= []
        if taskObj.value != value
          historyEntry = { date: +new Date, value: value }
          taskObj.history.push historyEntry
          batch.set "#{taskPath}.history", taskObj.history

      when 'daily'
        #calculateDelta()
        if cron? # cron
          calculateDelta()
          subtractPoints()
        else
          calculateDelta(false)
          addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

      when 'todo'
        if cron? #cron
          calculateDelta()
          #don't touch stats on cron
        else
          calculateDelta(false)
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
      # batch.setStats()
      batch.commit()
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
      silent = false
      if newStats.exp >= tnl
        silent = true
        user.set('stats.exp', newStats.exp)
        newStats.exp -= tnl
        obj.stats.lvl++
        obj.stats.hp = 50

      obj.stats.exp = newStats.exp
      user.pass(silent:true).set('stats.exp', obj.stats.exp) if silent

      # Set flags when they unlock features
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
      if !obj.flags.petsEnabled and obj.stats.lvl >= 4
        batch.set 'flags.petsEnabled', true
        obj.flags.petsEnabled = true

    if newStats.gp?
      #FIXME what was I doing here? I can't remember, gp isn't defined
      gp = 0.0 if (!gp? or gp<0)
      obj.stats.gp = newStats.gp

  ###
    At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
    For incomplete Dailys, deduct experience
  ###
  cron = () ->
    today = +new Date
    daysPassed = helpers.daysBetween(today, user.get('lastCron'))
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
        expTally += algos.tnl(lvl)
      obj.history.exp.push  { date: today, value: expTally }

      # Set the new user specs, and animate HP loss
      [hpAfter, obj.stats.hp] = [obj.stats.hp, hpBefore]
      batch.setStats()
      batch.set('history', obj.history)
      batch.commit()
      browser.resetDom(model)
      setTimeout (-> user.set 'stats.hp', hpAfter), 1000 # animate hp loss


  return {
    score: score
    cron: cron

    # testing stuff
    expModifier: algos.expModifier
    hpModifier: algos.hpModifier
    taskDeltaFormula: algos.taskDeltaFormula
  }
