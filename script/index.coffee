moment = require('moment')
_ = require('lodash')
content = require('./content.coffee')

XP = 15
HP = 2

api = module.exports = {}


###
  ------------------------------------------------------
  Time / Day
  ------------------------------------------------------
###

###
  Each time we're performing date math (cron, task-due-days, etc), we need to take user preferences into consideration.
  Specifically {dayStart} (custom day start) and {timezoneOffset}. This function sanitizes / defaults those values.
  {now} is also passed in for various purposes, one example being the test scripts scripts testing different "now" times
###
sanitizeOptions = (o) ->
  dayStart = if (!_.isNaN(+o.dayStart) and 0 <= +o.dayStart <= 24) then +o.dayStart else 0
  timezoneOffset = if o.timezoneOffset then +(o.timezoneOffset) else +moment().zone()
  now = if o.now then moment(o.now).zone(timezoneOffset) else moment(+new Date).zone(timezoneOffset)
  # return a new object, we don't want to add "now" to user object
  {dayStart, timezoneOffset, now}

api.startOfWeek = api.startOfWeek = (options={}) ->
  o = sanitizeOptions(options)
  moment(o.now).startOf('week')

api.startOfDay = (options={}) ->
  o = sanitizeOptions(options)
  moment(o.now).startOf('day').add('h', o.dayStart)

dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s'}

###
  Absolute diff from "yesterday" till now
###
api.daysSince = (yesterday, options = {}) ->
  o = sanitizeOptions options
  Math.abs api.startOfDay(_.defaults {now:yesterday}, o).diff(o.now, 'days')

###
  Should the user do this taks on this date, given the task's repeat options and user.preferences.dayStart?
###
api.shouldDo = (day, repeat, options={}) ->
  return false unless repeat
  o = sanitizeOptions options
  selected = repeat[dayMapping[api.startOfDay(_.defaults {now:day}, o).day()]]
  return selected unless moment(day).zone(o.timezoneOffset).isSame(o.now,'d')
  if options.dayStart <= o.now.hour() # we're past the dayStart mark, is it due today?
    return selected
  else # we're not past dayStart mark, check if it was due "yesterday"
    yesterday = moment(o.now).subtract(1,'d').day() # have to wrap o.now so as not to modify original
    return repeat[dayMapping[yesterday]] # FIXME is this correct?? Do I need to do any timezone calcaulation here?

###
  ------------------------------------------------------
  Drop System
  ------------------------------------------------------
###

###
  Get a random property from an object
  http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
  returns random property (the value)
###
randomVal = (obj) ->
  result = undefined
  count = 0
  for key, val of obj
    result = val if Math.random() < (1 / ++count)
  result

randomDrop = (user, modifiers) ->
  {delta, priority, streak} = modifiers
  streak ?= 0
  # limit drops to 2 / day
  user.items.lastDrop ?=
    date: +moment().subtract('d', 1) # trick - set it to yesterday on first run, that way they can get drops today
    count: 0

  reachedDropLimit = (api.daysSince(user.items.lastDrop.date, user.preferences) is 0) and (user.items.lastDrop.count >= 5)
  return if reachedDropLimit

  # % chance of getting a pet or meat
  chanceMultiplier = Math.abs(delta)
  chanceMultiplier *= api.priorityValue(priority) # multiply chance by reddness
  chanceMultiplier += streak # streak bonus

  # Temporary solution to lower the maximum drop chance to 75 percent. More thorough
  # overhaul of drop changes is needed. See HabitRPG/habitrpg#1922 for details.
  # Old drop chance:
  # if user.flags?.dropsEnabled and Math.random() < (.05 * chanceMultiplier)
  max = 0.75 # Max probability of drop
  a = 0.1 # rate of increase
  alpha = a*max*chanceMultiplier/(a*chanceMultiplier+max) # current probability of drop

  if user.flags?.dropsEnabled and Math.random() < alpha
    # current breakdown - 1% (adjustable) chance on drop
    # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
    rarity = Math.random()

    # Food: 40% chance
    if rarity > .6
      drop = randomVal _.omit(content.food, 'Saddle')
      user.items.food[drop.name] ?= 0
      user.items.food[drop.name]+= 1
      drop.type = 'Food'
      drop.dialog = "You've found a #{drop.text} Food! #{drop.notes}"

      # Eggs: 30% chance
    else if rarity > .3
      drop = randomVal content.eggs
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
        else if rarity < .09 then ['Zombie', 'CottonCandyPink', 'CottonCandyBlue']
          # Uncommon: 30% (of 30%)
        else if rarity < .18 then ['Red', 'Shade', 'Skeleton']
          # Common: 40% (of 30%)
        else ['Base', 'White', 'Desert']

      # No Rarity (@see https://github.com/HabitRPG/habitrpg/issues/1048, we may want to remove rareness when we add mounts)
      #drop = helpers.randomVal hatchingPotions
      drop = randomVal _.pick(content.hatchingPotions, ((v,k) -> k in acceptableDrops))

      user.items.hatchingPotions[drop.name] ?= 0
      user.items.hatchingPotions[drop.name]++
      drop.type = 'HatchingPotion'
      drop.dialog = "You've found a #{drop.text} Hatching Potion! #{drop.notes}"

    # if they've dropped something, we want the consuming client to know so they can notify the user. See how the Derby
    # app handles it for example. Would this be better handled as an emit() ?
    user._tmp.drop = drop

    user.items.lastDrop.date = +new Date
    user.items.lastDrop.count++

###
  ------------------------------------------------------
  Scoring
  ------------------------------------------------------
###

api.priorityValue = (priority = '!') ->
  switch priority
    when '!' then 1
    when '!!' then 1.5
    when '!!!' then 2
    else 1

api.tnl = (level) ->
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
api.expModifier = (value, weaponStr, level, priority = '!') ->
  str = (level - 1) / 2
  # ultimately get this from user
  totalStr = (str + weaponStr) / 100
  strMod = 1 + totalStr
  exp = value * XP * strMod * api.priorityValue(priority)
  return Math.round(exp)

###
  Calculates HP modification based on level and armor defence
  {value} task.value for hp loss
  {armorDefense} defense from armor
  {helmDefense} defense from helm
  {level} current user level
  {priority} user-defined priority multiplier
###
api.hpModifier = (value, armorDef, helmDef, shieldDef, level, priority = '!') ->
  def = (level - 1) / 2
  # ultimately get this from user?
  totalDef = (def + armorDef + helmDef + shieldDef) / 100
  #ultimate get this from user
  defMod = 1 - totalDef
  hp = value * HP * defMod * api.priorityValue(priority)
  return Math.round(hp * 10) / 10
# round to 1dp

###
  Future use
  {priority} user-defined priority multiplier
###
api.gpModifier = (value, modifier, priority = '!', streak, user) ->
  val = value * modifier * api.priorityValue(priority)
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
api.taskDeltaFormula = (currentValue, direction) ->
  if currentValue < -47.27 then currentValue = -47.27
  else if currentValue > 21.27 then currentValue = 21.27
  delta = Math.pow(0.9747, currentValue)
  return delta if direction is 'up'
  return -delta

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
      return
    else
      user.stats.hp = newStats.hp

  if newStats.exp?
    tnl = api.tnl(user.stats.lvl)
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
          tnl = api.tnl(user.stats.lvl)
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
    if !user.flags.classSelected and user.stats.lvl >= 5
      user.flags.classSelected

  if newStats.gp?
    #FIXME what was I doing here? I can't remember, gp isn't defined
    gp = 0.0 if (!gp? or gp < 0)
    user.stats.gp = newStats.gp


###
  ------------------------------------------------------
  Cron
  ------------------------------------------------------
###

###
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
  Make sure to run this function once in a while as server will not take care of overnight calculations.
  And you have to run it every time client connects.
  {user}
###
api.cron = (user, options={}) ->
  [now] = [+options.now || +new Date]

  # They went to a different timezone
  # FIXME:
  # (1) This exit-early code isn't taking timezone into consideration!!
  # (2) Won't switching timezones be handled automatically client-side anyway? (aka, can we just remove this code?)
  # (3) And if not, is this the correct way to handle switching timezones
#  if moment(user.lastCron).isAfter(now)
#    user.lastCron = now
#    return

  daysMissed = api.daysSince user.lastCron, _.defaults({now}, user.preferences)
  return unless daysMissed > 0

  user.lastCron = now

  # Reset the lastDrop count to zero
  if user.items.lastDrop.count > 0
    user.items.lastDrop.count = 0

  # User is resting at the inn. Used to be we un-checked each daily without performing calculation (see commits before fb29e35)
  # but to prevent abusing the inn (http://goo.gl/GDb9x) we now do *not* calculate dailies, and simply set lastCron to today
  return if user.flags.rest is true

  # Tally each task
  todoTally = 0
  user.todos.concat(user.dailys).forEach (task) ->
    return unless task

    return if user.stats.buffs.stealth && user.stats.buffs.stealth-- # User "evades" a certain number of tasks

    {id, type, completed, repeat} = task
    # Deduct experience for missed Daily tasks, but not for Todos (just increase todo's value)
    unless completed
      scheduleMisses = daysMissed
      # for dailys which have repeat dates, need to calculate how many they've missed according to their own schedule
      if (type is 'daily') and repeat
        scheduleMisses = 0
        _.times daysMissed, (n) ->
          thatDay = moment(now).subtract('days', n + 1)
          scheduleMisses++ if api.shouldDo(thatDay, repeat, user.preferences)
      api.score(user, task, 'down', {times:scheduleMisses, cron:true}) if scheduleMisses > 0

    switch type
      when 'daily'
        (task.history ?= []).push({ date: +new Date, value: task.value })
        task.completed = false
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


  # Finished tallying
  ((user.history ?= {}).todos ?= []).push { date: now, value: todoTally }
  # tally experience
  expTally = user.stats.exp
  lvl = 0 #iterator
  while lvl < (user.stats.lvl - 1)
    lvl++
    expTally += api.tnl(lvl)
  (user.history.exp ?= []).push { date: now, value: expTally }
  api.preenUserHistory(user)
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
        value: _.reduce(group, ((m, obj) -> m + api.value), 0) / group.length # average
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
api.preenUserHistory = (user, minHistLen = 7) ->
  _.each user.habits.concat(user.dailys), (task) ->
    task.history = preenHistory(task.history) if task.history?.length > minHistLen
    true

  _.defaults user.history, {todos:[], exp: []}
  user.history.exp = preenHistory(user.history.exp) if user.history.exp.length > minHistLen
  user.history.todos = preenHistory(user.history.todos) if user.history.todos.length > minHistLen
  #user.markModified('history')
  #user.markModified('habits')
  #user.markModified('dailys')


###
------------------------------------------------------
Content
------------------------------------------------------
###

api.content = content


###
------------------------------------------------------
Misc Helpers
------------------------------------------------------
###

api.uuid = ->
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace /[xy]/g, (c) ->
    r = Math.random() * 16 | 0
    v = (if c is "x" then r else (r & 0x3 | 0x8))
    v.toString 16

###
Even though Mongoose handles task defaults, we want to make sure defaults are set on the client-side before
sending up to the server for performance
###
api.taskDefaults = (task) ->
  defaults =
    id: api.uuid()
    type: 'habit'
    text: ''
    notes: ''
    priority: '!'
    challenge: {}
  _.defaults task, defaults
  _.defaults(task, {up:true,down:true}) if task.type is 'habit'
  _.defaults(task, {history: []}) if task.type in ['habit', 'daily']
  _.defaults(task, {completed:false}) if task.type in ['daily', 'todo']
  _.defaults(task, {streak:0, repeat: {su:1,m:1,t:1,w:1,th:1,f:1,s:1}}) if task.type is 'daily'
  task._id = task.id # may need this for TaskSchema if we go back to using it, see http://goo.gl/a5irq4
  task.value ?= if task.type is 'reward' then 10 else 0
  task

api.percent = (x,y) ->
  x=1 if x==0
  Math.round(x/y*100)

###
Remove whitespace #FIXME are we using this anywwhere? Should we be?
###
api.removeWhitespace = (str) ->
  return '' unless str
  str.replace /\s/g, ''

###
Encode the download link for .ics iCal file
###
api.encodeiCalLink = (uid, apiToken) ->
  loc = window?.location.host or process?.env?.BASE_URL or ''
  encodeURIComponent "http://#{loc}/v1/users/#{uid}/calendar.ics?apiToken=#{apiToken}"

###
Gold amount from their money
###
api.gold = (num) ->
  if num
    return Math.floor num
  else
    return "0"

###
Silver amount from their money
###
api.silver = (num) ->
  if num
    ("0" + Math.floor (num - Math.floor(num))*100).slice -2
  else
    return "00"

###
Task classes given everything about the class
###
api.taskClasses = (task, filters=[], dayStart=0, lastCron=+new Date, showCompleted=false, main=false) ->
  return unless task
  {type, completed, value, repeat} = task

  # completed / remaining toggle
  return 'hidden' if (type is 'todo') and (completed != showCompleted)

  # Filters
  if main # only show when on your own list
    for filter, enabled of filters
      if enabled and not task.tags?[filter]
        # All the other classes don't matter
        return 'hidden'

  classes = type

  # show as completed if completed (naturally) or not required for today
  if type in ['todo', 'daily']
    if completed or (type is 'daily' and !api.shouldDo(+new Date, task.repeat, {dayStart}))
      classes += " completed"
    else
      classes += " uncompleted"
  else if type is 'habit'
    classes += ' habit-wide' if task.down and task.up

  if value < -20
    classes += ' color-worst'
  else if value < -10
    classes += ' color-worse'
  else if value < -1
    classes += ' color-bad'
  else if value < 1
    classes += ' color-neutral'
  else if value < 5
    classes += ' color-good'
  else if value < 10
    classes += ' color-better'
  else
    classes += ' color-best'
  return classes

###
Friendly timestamp
###
api.friendlyTimestamp = (timestamp) -> moment(timestamp).format('MM/DD h:mm:ss a')

###
Does user have new chat messages?
###
api.newChatMessages = (messages, lastMessageSeen) ->
  return false unless messages?.length > 0
  messages?[0] and (messages[0].id != lastMessageSeen)

###
are any tags active?
###
api.noTags = (tags) -> _.isEmpty(tags) or _.isEmpty(_.filter( tags, (t) -> t ) )

###
Are there tags applied?
###
api.appliedTags = (userTags, taskTags) ->
  arr = []
  _.each userTags, (t) ->
    return unless t?
    arr.push(t.name) if taskTags?[t.id]
  arr.join(', ')

api.countPets = (originalCount, pets) ->
  count = if originalCount? then originalCount else _.size(pets)
  for pet of content.specialPets
    count-- if pets[pet]
  count

###
------------------------------------------------------
User (prototype wrapper to give it ops, helper funcs, and virtuals
------------------------------------------------------
###

###
  This wraps the user prototype, giving it functions
###
api.wrap = (user) ->
  return if user._wrapped
  user._wrapped = true

  # TODO Document
  user.ops =

    update: (req, cb) ->
      _.each req.body, (v,k) ->
        user.fns.dotSet(k,v)
      cb? null, req

    updateTask: (req, cb) ->
      return cb?("Task not found") unless req.params.id and user.tasks[req.params.id]
      _.merge user.tasks[req.params.id], req.body
      cb? null, req

    deleteTask: (req, cb) ->
      cb? null, req

    addTask: (req, cb) ->
      task = api.taskDefaults(req.body)
      user["#{task.type}s"].unshift(task)
      cb? null, req
      task

    buy: (req, cb) ->
      {key} = req.query
      item = if key is 'potion' then content.potion else content.gear.flat[key]
      return cb?({code:404, message:"Item '#{key} not found (see https://github.com/HabitRPG/habitrpg-shared/blob/develop/script/content.coffee)"}) unless item
      return cb?({code:200, message:'Not enough gold.'}) if user.stats.gp < item.value
      if item.key is 'potion'
        user.stats.hp += 15
        user.stats.hp = 50 if user.stats.hp > 50
      else
        user.items.gear.equipped[item.type] = item.key
        user.items.gear.owned[item.key] = true;
        if item.klass in ['warrior','wizard','healer','rogue']
          if user.fns.getItem('weapon').last and user.fns.getItem('armor').last and user.fns.getItem('head').last and user.fns.getItem('shield').last
            user.achievements.ultimateGear = true
      user.stats.gp -= item.value
      cb? null, req

    sell: (req, cb) ->
      {key, type} = req.query
      return cb("?type must by in [eggs, hatchingPotions, food]") unless type in ['eggs','hatchingPotions', 'food']
      return cb("?key not found for user.items.#{type}") unless user.items[type][key]
      user.items[type][key]--
      user.stats.gp += content[type][key].value
      cb? null, req

    equip: (req, cb) ->
      [type, key] = [req.query.type || 'equipped', req.query.key]
      switch type
        when 'mount'
          user.items.currentMount = if user.items.currentMount is key then '' else key
        when 'pet'
          user.items.currentPet = if user.items.currentPet is key then '' else key
        when 'costume','equipped'
          item = content.gear.flat[key]
          if item.type is "shield"
            weapon = content.gear.flat[user.items.gear[type].weapon]
            return cb?(weapon.text + " is two-handed") if weapon?.twoHanded
          user.items.gear[type][item.type] = item.key
          user.items.gear[type].shield = "shield_base_0"  if item.twoHanded
      cb? null, req

    revive: (req, cb) ->
      # Reset stats
      _.merge user.stats, {hp:50, exp:0, gp:0}
      user.stats.lvl-- if user.stats.lvl > 1

      # Lose a stat point
      lostStat = randomVal _.reduce ['str','con','per','int'], ((m,k)->(m[k]=k if user.stats[v];m)), {}
      user.stats[lostStat]-- if lostStat

      # Lose a gear piece
      # Can't use randomVal since we need k, not v
      count = 0
      for k,v of user.items.gear.owned
        lostItem = k if Math.random() < (1 / ++count)
      if item = content.gear.flat[lostItem]
        delete user.items.gear.owned[lostItem]
        user.items.gear.equipped[item.type] = "#{item.type}_base_0"
        user.items.gear.costume[item.type] = "#{item.type}_base_0"
      user.markModified? 'items.gear'
      cb? null, req

    hatch: (req, cb) ->
      {egg, hatchingPotion} = req.query
      return cb("Please specify query.egg & query.hatchingPotion") unless egg and hatchingPotion
      return cb("You're missing either that egg or that potion") unless user.items.eggs[egg] > 0 and user.items.hatchingPotions[hatchingPotion] > 0
      pet = "#{egg}-#{hatchingPotion}"
      return cb("You already have that pet. Try hatching a different combination!")  if user.items.pets[pet]
      user.items.pets[pet] = 5
      user.items.eggs[egg]--
      user.items.hatchingPotions[hatchingPotion]--
      cb? null, req

    unlock: (req, cb) ->
      {path} = req.query
      fullSet = ~path.indexOf(",")
      cost = if fullSet then 1.25 else 0.5 # 5G per set, 2G per individual
      return cb?({code:401, err: "Not enough gems"}) if user.balance < cost
      if fullSet
        _.each path.split(","), (p) ->
          user.fns.dotSet "purchased." + p, true
      else
        if user.fns.dotGet("purchased." + path) is true
          user.preferences[path.split(".")[0]] = path.split(".")[1]
          return cb? null, req
        user.fns.dotSet "purchased." + path, true
      user.balance -= cost
      if user.markModified
        user._v++
        user.markModified? "purchased"
      cb? null, req

    changeClass: (req, cb) ->
      klass = req.query?.class
      if klass in ['warrior','rogue','wizard','healer']
        user.stats.class = klass
        user.flags.classSelected = true
        # Clear their gear and equip their new class's gear (can still equip old gear from inventory)
        # If they've rolled this class before, restore their progress
        _.each ["weapon", "armor", "shield", "head"], (type) ->
          foundKey = false
          _.findLast user.items.gear.owned, (v, k) ->
            return foundKey = k if ~k.indexOf(type + "_" + klass)
          # restore progress from when they last rolled this class
          # weapon_0 is significant, don't reset to base_0
          # rogues start with an off-hand weapon
          user.items.gear.equipped[type] =
            if foundKey then foundKey
            else if type is "weapon" then "weapon_#{klass}_0"
            else if type is "shield" and klass is "rogue" then "shield_rogue_0"
            else "#{type}_base_0" # naked for the rest!

          # Grant them their new class's gear
          user.items.gear.owned["#{type}_#{klass}_0"] = true  if type is "weapon" or (type is "shield" and klass is "rogue")
      else
        # Null ?class value means "reset class"
        _.merge user.stats, {str: 0, def: 0, per: 0, int: 0}
        user.flags.classSelected = false
        #'stats.points': this is handled on the server
      cb? null, req

    allocate: (req, cb) ->
      stat = req.query.stat or 'str'
      if user.stats.points > 0
        user.stats[stat]++
        user.stats.points--
      cb? null, req


    score: (req, cb) ->
      {id, direction} = req.params # up or down
      task = user.tasks[id]

      # This is for setting one-time temporary flags, such as streakBonus or itemDropped. Useful for notifying
      # the API consumer, then cleared afterwards
      user._tmp = {}

      [gp, hp, exp, lvl] = [+user.stats.gp, +user.stats.hp, +user.stats.exp, ~~user.stats.lvl]
      [type, value, streak, priority] = [task.type, +task.value, ~~task.streak, task.priority or '!']
      [times, cron] = [req.query?.times or 1, req.query?.cron or false]

      # If they're trying to purhcase a too-expensive reward, don't allow them to do that.
      if task.value > user.stats.gp and task.type is 'reward'
        return cb('Not enough Gold');

      delta = 0
      calculateDelta = (adjustvalue = true) ->
        # If multiple days have passed, multiply times days missed
        _.times times, ->
          # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
          # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
          # rather than iteratively
          nextDelta = api.taskDeltaFormula(value, direction)
          value += nextDelta if adjustvalue
          delta += nextDelta

      addPoints = ->
        weaponStr = user.fns.getItem('weapon').str
        exp += api.expModifier(delta, weaponStr, user.stats.lvl, priority) / 2 # /2 hack for now, people leveling too fast
        if streak
          gp += api.gpModifier(delta, 1, priority, streak, user)
        else
          gp += api.gpModifier(delta, 1, priority)

      subtractPoints = ->
        armorDef = user.fns.getItem('armor').con
        headDef = user.fns.getItem('head').con
        shieldDef = user.fns.getItem('shield').con
        hp += api.hpModifier(delta, armorDef, headDef, shieldDef, user.stats.lvl, priority)

      switch type
        when 'habit'
          calculateDelta()
          # Add habit value to habit-history (if different)
          if (delta > 0) then addPoints() else subtractPoints()
          if task.value != value
            (task.history ?= []).push { date: +new Date, value: value }

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

            else
              # Remove a streak achievement if streak was a multiple of 21 and the daily was undone
              if (streak % 21) is 0
                user.achievements.streak = if user.achievements.streak then user.achievements.streak - 1 else 0

              streak = if streak then streak - 1 else 0
            task.streak = streak

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

      task.value = value
      updateStats user, { hp, exp, gp }

      # Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
      if typeof window is 'undefined'
        randomDrop(user, {delta, priority, streak}) if direction is 'up'

      cb? null, req
      return delta

  user.fns =
    getItem: (type) ->
      item = content.gear.flat[user.items.gear.equipped[type]]
      return content.gear.flat["#{type}_base_0"] unless item
      item

    updateStore: ->
      changes = []
      _.each ['weapon', 'armor', 'shield', 'head'], (type) ->
        found = _.find content.gear.tree[type][user.stats.class], (item) ->
          !user.items.gear.owned[item.key]
        changes.push(found) if found
      # Add special items (contrib gear, backer gear, etc)
      _.defaults changes, _.transform _.where(content.gear.flat, {klass:'special'}), (m,v) ->
        m.push v if v.canOwn?(user) && !user.items.gear.owned[v.key]
      changes.push content.potion
      # Return sorted store (array)
      _.sortBy changes, (item) ->
        switch item.type
          when 'weapon' then 1
          when 'armor'  then 2
          when 'head'   then 3
          when 'shield' then 4
          when 'potion' then 5
          else               6

    ###
    This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
    user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
    so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
    Angular sets object properties directly - in which case, this function will be used.
    ###
    dotSet: (path, val) ->
      arr = path.split('.')
      _.reduce arr, (curr, next, index) =>
        if (arr.length - 1) == index
          curr[next] = val
        (curr[next] ?= {})
      , user

    dotGet: (path) ->
      _.reduce path.split('.'), ((curr, next) => curr?[next]), user

  # Aggregate all intrinsic stats, buffs, weapon, & armor into computed stats
  Object.defineProperty user, '_statsComputed',
    get: ->
      _.reduce(['per','con','str','int'], (m,stat) =>
        m[stat] = _.reduce('stats stats.buffs items.gear.equipped.weapon items.gear.equipped.armor items.gear.equipped.head items.gear.equipped.shield'.split(' '), (m2,path) =>
          val = user.dotGet(path)
          m2 +
          if ~path.indexOf('items.gear')
            # get the gear stat, and multiply it by 1.5 if it's class-gear
            (+content.gear.flat[val]?[stat] or 0) * (if ~val?.indexOf(user.stats.class) then 1.5 else 1)
          else
            +val[stat] or 0
        , 0); m
      , {})
  Object.defineProperty user, 'tasks',
    get: ->
      tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards)
      _.object(_.pluck(tasks, "id"), tasks)

