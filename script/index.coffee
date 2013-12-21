moment = require('moment')
_ = require('lodash')
content = require('./content.coffee')

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
  Scoring
  ------------------------------------------------------
###

api.tnl = (lvl) ->
  if lvl >= 100 then 0
  else Math.round(((Math.pow(lvl, 2) * 0.25) + (10 * lvl) + 139.75) / 10) * 10
  # round to nearest 10?

###
  A hyperbola function that creates diminishing returns, so you can't go to infinite (eg, with Exp gain).
  {max} The asymptote
  {bonus} All the numbers combined for your point bonus (eg, task.value * user.stats.int * critChance, etc)
  {halfway} (optional) the point at which the graph starts bending
###
api.diminishingReturns = (bonus, max, halfway=bonus/2) ->
  max*(bonus/(bonus+halfway))


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

###
  Update the in-browser store with new gear. FIXME this was in user.fns, but it was causing strange issues there
###
api.updateStore = (user) ->
  return unless user
  changes = []
  _.each ['weapon', 'armor', 'shield', 'head'], (type) ->
    found = _.find content.gear.tree[type][user.stats.class], (item) ->
      !user.items.gear.owned[item.key]
    changes.push(found) if found
    true
  # Add special items (contrib gear, backer gear, etc)
  changes = changes.concat _.filter content.gear.flat, (v) ->
    v.klass is 'special' and !user.items.gear.owned[v.key] and v.canOwn?(user)
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
    priority: 1
    challenge: {}
    attribute: 'str'
  _.defaults task, defaults
  _.defaults(task, {up:true,down:true}) if task.type is 'habit'
  _.defaults(task, {history: []}) if task.type in ['habit', 'daily']
  _.defaults(task, {completed:false}) if task.type in ['daily', 'todo']
  _.defaults(task, {streak:0, repeat: {su:1,m:1,t:1,w:1,th:1,f:1,s:1}}) if task.type is 'daily'
  task._id = task.id # may need this for TaskSchema if we go back to using it, see http://goo.gl/a5irq4
  task.value ?= if task.type is 'reward' then 10 else 0
  task.priority = 1 unless _.isNumber(task.priority) # hotfix for apiv1. once we're off apiv1, we can remove this
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
api.noTags = (tags) -> _.isEmpty(tags) or _.isEmpty(_.filter(tags, (t)->t))

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
User is now wrapped (both on client and server), adding a few new properties:
  * getters (_statsComputed, tasks, etc)
  * user.fns, which is a bunch of helper functions
    These were originally up above, but they make more sense belonging to the user object so we don't have to pass
    the user object all over the place. In fact, we should pull in more functions such as cron(), updateStats(), etc.
  * user.ops, which is super important:

If a function is inside user.ops, it has magical properties. If you call it on the client it updates the user object in
the browser and when it's done it automatically POSTs to the server, calling src/controllers/user.js#OP_NAME (the exact same name
of the op function). The first argument req is {query, body, params}, it's what the express controller function
expects. This means we call our functions as if we were calling an Express route. Eg, instead of score(task, direction),
we call score({params:{id:task.id,direction:direction}}). This also forces us to think about our routes (whether to use
params, query, or body for variables). see http://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters

If `src/controllers/user.js#OP_NAME` doesn't exist on the server, it's automatically added. It runs the code in user.ops.OP_NAME
to update the user model server-side, then performs `user.save()`. You can see this in action for `user.ops.buy`. That
function doesn't exist on the server - so the client calls it, it updates user in the browser, auto-POSTs to server, server
handles it by calling `user.ops.buy` again (to update user on the server), and then saves. We can do this for
everything that doesn't need any code difference from what's in user.ops.OP_NAME for special-handling server-side. If we
*do* need special handling, just add `src/controllers/user.js#OP_NAME` to override the user.ops.OP_NAME, and be
sure to call user.ops.OP_NAME at some point within the overridden function.

TODO
  * Is this the best way to wrap the user object? I thought of using user.prototype, but user is an object not a Function.
    user on the server is a Mongoose model, so we can use prototype - but to do it on the client, we'd probably have to
    move to $resource for user
  * Move to $resource!
###
api.wrap = (user) ->
  return if user._wrapped
  user._wrapped = true

  # ----------------------------------------------------------------------
  # user.ops shared client/server operations
  # ----------------------------------------------------------------------

  user.ops =

    # ------
    # User
    # ------

    update: (req, cb) ->
      _.each req.body, (v,k) ->
        user.fns.dotSet(k,v);true
      cb? null, req

    sleep: (req, cb) ->
      user.preferences.sleep = !user.preferences.sleep
      cb null, req

    revive: (req, cb) ->
      # Reset stats
      _.merge user.stats, {hp:50, exp:0, gp:0}
      user.stats.lvl-- if user.stats.lvl > 1

      # Lose a stat point
      lostStat = user.fns.randomVal _.reduce(['str','con','per','int'], ((m,k)->m[k]=k if user.stats[k];m), {})
      user.stats[lostStat]-- if lostStat

      # Lose a gear piece
      # Note, they can actually lose item weapon_*_0 - it's 0 to buy back, no big deal
      # Note the `""+` string-casting. Without this, when run on the server Mongoose returns funny objects
      lostItem = user.fns.randomVal _.reduce(user.items.gear.owned, ((m,v,k)->m[""+k]=""+k if v;m), {})
      if item = content.gear.flat[lostItem]
        user.items.gear.owned[lostItem] = false
        user.items.gear.equipped[item.type] = "#{item.type}_base_0" if user.items.gear.equipped[item.type] is lostItem
        user.items.gear.costume[item.type] = "#{item.type}_base_0" if user.items.gear.costume[item.type] is lostItem
      user.markModified? 'items.gear'
      cb? (if item then {code:200,message:"Your #{item.text} broke."} else null), req

    reset: (req, cb) ->
      user.habits = []
      user.dailys = []
      user.todos = []
      user.rewards = []
      user.stats.hp = 50
      user.stats.lvl = 1
      user.stats.gp = 0
      user.stats.exp = 0
      # TODO handle MP
      gear = user.items.gear
      _.each ['equipped', 'costume'], (type) ->
        gear[type].armor  = 'armor_base_0'
        gear[type].weapon = 'weapon_base_0'
        gear[type].head   = 'head_base_0'
        gear[type].shield = 'shield_base_0'
      user.items.gear.owned = {weapon_warrior_0:true}
      user.markModified? 'items.gear.owned'
      user.preferences.costume = false
      cb null, req

    reroll: (req, cb) ->
      if user.balance < 1
        return cb {code:401,message: "Not enough gems."}, req
      user.balance--
      _.each user.tasks, (task) ->
        task.value = 0
      user.stats.hp = 50
      cb null, req

    # ------
    # Tasks
    # ------

    clearCompleted: (req, cb) ->
      user.todos = _.where(user.todos, {completed: false})
      cb null, req

    sortTask: (req, cb) ->
      {id} = req.params
      {to, from} = req.query
      task = user.tasks[id]
      return cb({code:404, message: "Task not found."}) unless task
      return cb('?to=__&from=__ are required') unless to? and from?
      user["#{task.type}s"].splice to, 0, user["#{task.type}s"].splice(from, 1)[0]
      cb null, req

    updateTask: (req, cb) ->
      return cb?("Task not found") unless user.tasks[req.params?.id]
      _.merge user.tasks[req.params.id], req.body
      user.tasks[req.params.id].markModified? 'tags'
      cb? null, req

    deleteTask: (req, cb) ->
      task = user.tasks[req.params?.id]
      return cb({code:404,message:'Task not found'}) unless task
      i = user[task.type + "s"].indexOf(task)
      user[task.type + "s"].splice(i, 1) if ~i
      cb null, req

    addTask: (req, cb) ->
      task = api.taskDefaults(req.body)
      user["#{task.type}s"].unshift(task)
      cb? null, req
      task

    # ------
    # Tags
    # ------

    addTag: (req, cb) ->
      {name} = req.body
      user.tags ?= []
      user.tags.push({name})
      cb? null, req

    updateTag: (req, cb) ->
      tid = req.params.id
      i = _.findIndex user.tags, {id: tid}
      return cb('Tag not found', req) if !~i
      user.tags[i].name = req.body.name
      cb? null, req

    deleteTag: (req, cb) ->
      tid = req.params.id
      i = _.findIndex user.tags, {id: tid}
      return cb('Tag not found', req) if !~i
      tag = user.tags[i]
      delete user.filters[tag.id]
      user.tags.splice i, 1

      # remove tag from all tasks
      _.each user.tasks, (task) ->
        delete task.tags[tag.id]

      _.each ['habits','dailys','todos','rewards'], (type) ->
        user.markModified? type
      cb null, req

    # ------
    # Inventory
    # ------

    feed: (req, cb) ->
      {pet,food} = req.params
      food = content.food[food]
      [egg, potion] = pet.split('-')
      userPets = user.items.pets

      return cb({code:404, message:":pet not found in user.items.pets"}) unless userPets[pet]
      return cb({code:404, message:":food not found in user.items.food"}) unless user.items.food?[food.name]
      return cb({code:401, message:"Can't feed this pet."}) if content.specialPets[pet]
      return cb({code:401, message:"You already have that mount"}) if user.items.mounts[pet] and (userPets[pet] >= 50 or food.name is 'Saddle')

      message = ''
      evolve = ->
        userPets[pet] = 0
        user.items.mounts[pet] = true
        user.items.currentPet = "" if pet is user.items.currentPet
        message = "You have tamed #{egg}, let's go for a ride!"

      if food.name is 'Saddle'
        evolve()
      else
        if food.target is potion
          userPets[pet] += 5
          message = "#{egg} really likes the #{food.name}!"
        else
          userPets[pet] += 2
          message = "#{egg} eats the #{food.name} but doesn't seem to enjoy it."
        if userPets[pet] >= 50 and !user.items.mounts[pet]
          evolve()
      user.items.food[food.name]--
      cb {code:200, message}, req

    # buy is for gear, purchase is for gem-purchaseables (i know, I know...)
    purchase: (req, cb) ->
      {type,key}  = req.params
      return cb({code:404,message:":type must be in [hatchingPotions,eggs,food,special]"},req) unless type in ['eggs','hatchingPotions', 'food', 'special']
      item = content[type][key]
      return cb({code:404,message:":key not found for Content.#{type}"},req) unless item
      user.items[type][key] = 0  unless user.items[type][key]
      user.items[type][key]++
      user.balance -= (item.value / 4)
      cb null, req

    # buy is for gear, purchase is for gem-purchaseables (i know, I know...)
    buy: (req, cb) ->
      {key} = req.params
      item = if key is 'potion' then content.potion else content.gear.flat[key]
      return cb?({code:404, message:"Item '#{key} not found (see https://github.com/HabitRPG/habitrpg-shared/blob/develop/script/content.coffee)"}) unless item
      return cb?({code:401, message:'Not enough gold.'}) if user.stats.gp < item.value
      if item.key is 'potion'
        user.stats.hp += 15
        user.stats.hp = 50 if user.stats.hp > 50
      else
        user.items.gear.equipped[item.type] = item.key
        user.items.gear.owned[item.key] = true
        message = user.fns.handleTwoHanded(item)
        message ?= "Bought #{item.text}."
        if item.klass in ['warrior','wizard','healer','rogue'] and user.fns.getItem('weapon').last and user.fns.getItem('armor').last and user.fns.getItem('head').last and user.fns.getItem('shield').last
          user.achievements.ultimateGear = true
      user.stats.gp -= item.value
      cb? {code:200, message}, req

    sell: (req, cb) ->
      {key, type} = req.params
      return cb({code:404,message:":type not found. Must bes in [eggs, hatchingPotions, food]"}) unless type in ['eggs','hatchingPotions', 'food']
      return cb({code:404,message:":key not found for user.items.#{type}"}) unless user.items[type][key]
      user.items[type][key]--
      user.stats.gp += content[type][key].value
      cb? null, req

    equip: (req, cb) ->
      [type, key] = [req.params.type || 'equipped', req.params.key]
      switch type
        when 'mount'
          user.items.currentMount = if user.items.currentMount is key then '' else key
        when 'pet'
          user.items.currentPet = if user.items.currentPet is key then '' else key
        when 'costume','equipped'
          item = content.gear.flat[key]
          user.items.gear[type][item.type] = item.key
          message = user.fns.handleTwoHanded(item,type)
      cb {code:200,message}, req

    hatch: (req, cb) ->
      {egg, hatchingPotion} = req.params
      return cb({code:404,message:"Please specify query.egg & query.hatchingPotion"}) unless egg and hatchingPotion
      return cb({code:401,message:"You're missing either that egg or that potion"}) unless user.items.eggs[egg] > 0 and user.items.hatchingPotions[hatchingPotion] > 0
      pet = "#{egg}-#{hatchingPotion}"
      return cb("You already have that pet. Try hatching a different combination!")  if user.items.pets[pet]
      user.items.pets[pet] = 5
      user.items.eggs[egg]--
      user.items.hatchingPotions[hatchingPotion]--
      cb? {code:200, message:"Your egg hatched! Visit your stable to equip your pet."}, req

    unlock: (req, cb) ->
      {path} = req.query
      fullSet = ~path.indexOf(",")
      cost = if fullSet then 1.25 else 0.5 # 5G per set, 2G per individual
      alreadyOwns = !fullSet and user.fns.dotGet("purchased." + path) is true
      return cb?({code:401, message: "Not enough gems"}) if user.balance < cost and !alreadyOwns
      if fullSet
        _.each path.split(","), (p) ->
          user.fns.dotSet("purchased.#{p}", true);true
      else
        if alreadyOwns
          split = path.split('.');v=split.pop();k=split.join('.')
          user.fns.dotSet("preferences.#{k}",v)
          return cb? null, req
        user.fns.dotSet "purchased." + path, true
      user.balance -= cost
      user.markModified? 'purchased'
      cb? null, req

    # ------
    # Classes
    # ------

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
            return foundKey = k if ~k.indexOf(type + "_" + klass) and v is true
          # restore progress from when they last rolled this class
          # weapon_0 is significant, don't reset to base_0
          # rogues start with an off-hand weapon
          user.items.gear.equipped[type] =
            if foundKey then foundKey
            else if type is "weapon" then "weapon_#{klass}_0"
            else if type is "shield" and klass is "rogue" then "shield_rogue_0"
            else "#{type}_base_0" # naked for the rest!

          # Grant them their new class's gear
          user.items.gear.owned["#{type}_#{klass}_0"] = true if type is "weapon" or (type is "shield" and klass is "rogue")
          true
      else
        # Null ?class value means "reset class"
        if user.preferences.disableClasses
          user.preferences.disableClasses = false
          user.autoAllocate = false
        else
          return cb({code:401,message:"Not enough gems"}) unless user.balance >= .75
          user.balance -= .75
        _.merge user.stats, {str: 0, con: 0, per: 0, int: 0, points: user.stats.lvl}
        user.flags.classSelected = false
        #'stats.points': this is handled on the server
      cb? null, req

    disableClasses: (req, cb) ->
      user.stats.class = 'warrior'
      user.flags.classSelected = true
      user.preferences.disableClasses = true
      user.preferences.autoAllocate = true
      user.stats.str = user.stats.lvl
      user.stats.points = 0
      cb null, req

    allocate: (req, cb) ->
      stat = req.query.stat or 'str'
      if user.stats.points > 0
        user.stats[stat]++
        user.stats.points--
        user.stats.mp++ if stat is 'int' #increase their MP along with their max MP
      cb? null, req

    # ------
    # Score
    # ------

    score: (req, cb) ->
      {id, direction} = req.params # up or down
      task = user.tasks[id]
      options = req.query or {}; _.defaults(options, {times:1, cron:false})

      # This is for setting one-time temporary flags, such as streakBonus or itemDropped. Useful for notifying
      # the API consumer, then cleared afterwards
      user._tmp = {}

      # TODO do we need this fail-safe casting anymore? Are we safe now we're off Derby?
      stats = {gp: +user.stats.gp, hp: +user.stats.hp, exp: +user.stats.exp}
      task.value = +task.value; task.streak = ~~task.streak; task.priority ?= 1

      # If they're trying to purhcase a too-expensive reward, don't allow them to do that.
      if task.value > stats.gp and task.type is 'reward'
        return cb('Not enough Gold');

      delta = 0

      calculateDelta = (adjustvalue=true) ->
        # If multiple days have passed, multiply times days missed
        _.times options.times, ->
          # Each iteration calculate the nextDelta, which is then accumulated in the total delta.
          # Calculates the next task.value based on direction
          # Uses a capped inverse log y=.95^x, y>= -5

          # Min/max on task redness
          currVal =
            if task.value < -47.27 then -47.27
            else if task.value > 21.27 then 21.27
            else task.value
          nextDelta = Math.pow(0.9747, currVal) * (if direction is 'down' then -1 else 1)
          if adjustvalue
            task.value += nextDelta
            # ===== STRENGTH =====
            # (Only for up-scoring, ignore up-onlies and rewards)
            if direction is 'up' and task.type != 'reward' and !(task.type is 'habit' and !task.down)
              # TODO STR Improves the amount by which Dailies and +/- Habits decrease in threat when scored, by .25% per point.
              task.value += nextDelta * user._statsComputed.str * .004
          delta += nextDelta

      addPoints = ->
        # ===== CRITICAL HITS =====
        _crit = user.fns.crit()

        # Exp Modifier
        # ===== Intelligence =====
        # TODO Increases Experience gain by .2% per point.
        intBonus = 1 + (user._statsComputed.int * .025)
        stats.exp += Math.round (delta * intBonus * task.priority * _crit * 6)

        # GP modifier
        # ===== PERCEPTION =====
        # TODO Increases Gold gained from tasks by .3% per point.
        perBonus = (1 + user._statsComputed.per *.02)
        gpMod = (delta * task.priority * _crit * perBonus)
        gpMod *=
        stats.gp +=
          if task.streak
            streakBonus = task.streak / 100 + 1 # eg, 1-day streak is 1.1, 2-day is 1.2, etc
            afterStreak = gpMod * streakBonus
            user._tmp.streakBonus = afterStreak - gpMod if (gpMod > 0) # keep this on-hand for later, so we can notify streak-bonus
            afterStreak
          else gpMod

      # HP modifier
      subtractPoints = ->
        # ===== CONSTITUTION =====
        # TODO Decreases HP loss from bad habits / missed dailies by 0.5% per point.
        conBonus = 1 - (user._statsComputed.con / 250)
        conBonus = 0.1 if conBonus < .1
        hpMod = delta * conBonus * task.priority * 2 # constant 2 multiplier for better results
        stats.hp += Math.round(hpMod * 10) / 10 # round to 1dp

      switch task.type
        when 'habit'
          calculateDelta()
          # Add habit value to habit-history (if different)
          if (delta > 0) then addPoints() else subtractPoints()

          # History
          th = (task.history ?= [])
          if th[th.length-1] and moment(th[th.length-1].date).isSame(new Date, 'day')
            th[th.length-1].value = task.value
          else
            th.push {date: +new Date, value: task.value}
          user.markModified? "habits.#{_.findIndex(user.habits, {id:task.id})}.history"

        when 'daily'
          if options.cron
            calculateDelta()
            subtractPoints()
            task.streak = 0 unless user.stats.buffs.streaks
          else
            calculateDelta()
            addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes
            if direction is 'up'
              task.streak = if task.streak then task.streak + 1 else 1
              # Give a streak achievement when the streak is a multiple of 21
              if (task.streak % 21) is 0
                user.achievements.streak = if user.achievements.streak then user.achievements.streak + 1 else 1
            else
              # Remove a streak achievement if streak was a multiple of 21 and the daily was undone
              if (task.streak % 21) is 0
                user.achievements.streak = if user.achievements.streak then user.achievements.streak - 1 else 0
              task.streak = if task.streak then task.streak - 1 else 0

        when 'todo'
          if options.cron
            calculateDelta()
            #don't touch stats on cron
          else
            calculateDelta()
            addPoints() # obviously for delta>0, but also a trick to undo accidental checkboxes

        when 'reward'
        # Don't adjust values for rewards
          calculateDelta(false)
          # purchase item
          stats.gp -= Math.abs(task.value)
          num = parseFloat(task.value).toFixed(2)
          # if too expensive, reduce health & zero gp
          if stats.gp < 0
            # hp - gp difference
            stats.hp += stats.gp
            stats.gp = 0

      user.fns.updateStats stats

      # Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
      if typeof window is 'undefined'
        user.fns.randomDrop({task, delta}) if direction is 'up'

      cb? null, req
      return delta

  # ----------------------------------------------------------------------
  # user.fns helpers
  # ----------------------------------------------------------------------

  user.fns =

    getItem: (type) ->
      item = content.gear.flat[user.items.gear.equipped[type]]
      return content.gear.flat["#{type}_base_0"] unless item
      item

    handleTwoHanded: (item, type='equipped') ->
      # If they're buying a shield and wearing a staff, dequip the staff
      if item.type is "shield" and (weapon = content.gear.flat[user.items.gear[type].weapon])?.twoHanded
        user.items.gear[type].weapon = 'weapon_base_0'
        message = "#{weapon.text} is two-handed"
      # If they're buying a staff and wearing a shield, dequip the shield
      if item.twoHanded
        user.items.gear[type].shield = "shield_base_0"
        message = "#{item.text} is two-handed"
      message

    ###
    Because the same op needs to be performed on the client and the server (critical hits, item drops, etc),
    we need things to be "random", but technically predictable so that they don't go out-of-sync
    ###
    predictableRandom: (seed) ->
      # Default seed is all user stats combined. Fairly safe, meh - pass in a good seed for situations where that doesn't work
      seed = _.reduce(user.stats, ((m,v)->if _.isNumber(v) then m+v else m), 0) if !seed or seed is Math.PI
      x = Math.sin(seed++) * 10000
      x - Math.floor(x)

    crit: (stat='str', chance=.03) ->
      if user.fns.predictableRandom() <= chance then 1.5 + (.02*user._statsComputed[stat])
      else 1

    ###
      Get a random property from an object
      http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
      returns random property (the value)
    ###
    randomVal: (obj, options) ->
      result = undefined
      count = 0
      for key, val of obj
        result = (if options?.key then key else val) if user.fns.predictableRandom(options?.seed) < (1 / ++count)
      result

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



    # ----------------------------------------------------------------------
    # Scoring
    # ----------------------------------------------------------------------

    randomDrop: (modifiers) ->
      {delta} = modifiers
      {priority, streak} = modifiers.task
      streak ?= 0
      # limit drops to 2 / day
      user.items.lastDrop ?=
        date: +moment().subtract('d', 1) # trick - set it to yesterday on first run, that way they can get drops today
        count: 0

      reachedDropLimit = (api.daysSince(user.items.lastDrop.date, user.preferences) is 0) and (user.items.lastDrop.count >= 5)
      return if reachedDropLimit

      # % chance of getting a pet or meat
      chanceMultiplier = Math.abs(delta)
      chanceMultiplier *= priority # multiply chance by reddness
      chanceMultiplier += streak # streak bonus
      chanceMultiplier += user._statsComputed.per*.3

      # Temporary solution to lower the maximum drop chance to 75 percent. More thorough
      # overhaul of drop changes is needed. See HabitRPG/habitrpg#1922 for details.
      # Old drop chance:
      # if user.flags?.dropsEnabled and Math.random() < (.05 * chanceMultiplier)
      max = 0.75 # Max probability of drop
      a = 0.1 # rate of increase
      alpha = a*max*chanceMultiplier/(a*chanceMultiplier+max) # current probability of drop

      if user.flags?.dropsEnabled and user.fns.predictableRandom(user.stats.exp) < alpha
        # current breakdown - 1% (adjustable) chance on drop
        # If they got a drop: 50% chance of egg, 50% Hatching Potion. If hatchingPotion, broken down further even further
        rarity = user.fns.predictableRandom(user.stats.gp)

        # Food: 40% chance
        if rarity > .6
          drop = user.fns.randomVal _.omit(content.food, 'Saddle')
          user.items.food[drop.name] ?= 0
          user.items.food[drop.name]+= 1
          drop.type = 'Food'
          drop.dialog = "You've found a #{drop.text} Food! #{drop.notes}"

          # Eggs: 30% chance
        else if rarity > .3
          drop = user.fns.randomVal content.eggs
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
          drop = user.fns.randomVal _.pick(content.hatchingPotions, ((v,k) -> k in acceptableDrops))

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
      Updates user stats with new stats. Handles death, leveling up, etc
      {stats} new stats
      {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
    ###
    updateStats: (stats) ->
      # Game Over
      return user.stats.hp=0 if stats.hp <= 0

      user.stats.hp = stats.hp
      user.stats.gp = if stats.gp >= 0 then stats.gp else 0

      tnl = api.tnl(user.stats.lvl)
      # if we're at level 100, turn xp to gold
      if user.stats.lvl >= 100
        stats.gp += stats.exp / 15
        stats.exp = 0
        user.stats.lvl = 100
      else
        # level up & carry-over exp
        if stats.exp >= tnl
          #silent = true # push through the negative xp silently
          user.stats.exp = stats.exp # push normal + notification
          while stats.exp >= tnl and user.stats.lvl < 100 # keep levelling up
            stats.exp -= tnl
            user.stats.lvl++
            tnl = api.tnl(user.stats.lvl)

            # Auto-allocate a point, or give them a new manual point
            if user.preferences.automaticAllocation
              tallies = _.reduce user.tasks, ((m,v)-> m[v.attribute or 'str'] += v.value;m), {str:0,int:0,con:0,per:0}
              suggested = _.reduce tallies, ((m,v,k)-> if v>tallies[m] then k else m), 'str'
              user.stats[suggested]++
            else
              # add new allocatable points. We could do user.stats.points++, but this does a fail-safe just in case
              user.stats.points = user.stats.lvl - (user.stats.con + user.stats.str + user.stats.per + user.stats.int);

          if user.stats.lvl == 100
            stats.exp = 0
          user.stats.hp = 50
      user.stats.exp = stats.exp

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
    cron: (options={}) ->
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

      user.auth.timestamps.loggedin = new Date()

      user.lastCron = now

      # Reset the lastDrop count to zero
      if user.items.lastDrop.count > 0
        user.items.lastDrop.count = 0

      user.stats.mp += 10
      user.stats.mp = user._statsComputed.maxMP if user.stats.mp > user._statsComputed.maxMP

      # User is resting at the inn. Used to be we un-checked each daily without performing calculation (see commits before fb29e35)
      # but to prevent abusing the inn (http://goo.gl/GDb9x) we now do *not* calculate dailies, and simply set lastCron to today
      if user.preferences.sleep is true
        user.stats.buffs = {str:0,int:0,per:0,con:0,stealth:0,streaks:false}
        return

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
          if scheduleMisses > 0
            user.ops.score({params:{id:task.id, direction:'down'}, query:{times:scheduleMisses, cron:true}})

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
      user.fns.preenUserHistory()
      user.markModified? 'history'
      user.markModified? 'dailys' # covers dailys.*.history
      user.stats.buffs = {str:0,int:0,per:0,con:0,stealth:0,streaks:false}
      user

    # Registered users with some history
    preenUserHistory: (minHistLen = 7) ->
      _.each user.habits.concat(user.dailys), (task) ->
        task.history = preenHistory(task.history) if task.history?.length > minHistLen
        true

      _.defaults user.history, {todos:[], exp: []}
      user.history.exp = preenHistory(user.history.exp) if user.history.exp.length > minHistLen
      user.history.todos = preenHistory(user.history.todos) if user.history.todos.length > minHistLen
      #user.markModified? 'history'
      #user.markModified? 'habits'
      #user.markModified? 'dailys'

  # ----------------------------------------------------------------------
  # Virtual Attributes
  # ----------------------------------------------------------------------

  # Aggregate all intrinsic stats, buffs, weapon, & armor into computed stats
  Object.defineProperty user, '_statsComputed',
    get: ->
      computed = _.reduce(['per','con','str','int'], (m,stat) =>
        m[stat] = _.reduce('stats stats.buffs items.gear.equipped.weapon items.gear.equipped.armor items.gear.equipped.head items.gear.equipped.shield'.split(' '), (m2,path) =>
          val = user.fns.dotGet(path)
          m2 +
            if ~path.indexOf('items.gear')
              # get the gear stat, and multiply it by 1.5 if it's class-gear
              (+content.gear.flat[val]?[stat] or 0) * (if ~val?.indexOf(user.stats.class) then 1.5 else 1)
            else
              +val[stat] or 0
        , 0)
        m[stat] += (user.stats.lvl - 1) / 2
        m
      , {})
      computed.maxMP = computed.int*2 + 30
      computed
  Object.defineProperty user, 'tasks',
    get: ->
      tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards)
      _.object(_.pluck(tasks, "id"), tasks)

