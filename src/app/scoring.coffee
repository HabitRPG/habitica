async = require 'async'
moment = require 'moment'
_ = require 'lodash'
content = require './content'
helpers = require './helpers'
MODIFIER = .03 # each new level, armor, weapon add 3% modifier (this number may change) 
user = undefined
model = undefined

# This is required by all the functions, make sure it's set before anythign else is called
setModel = (m) ->
  model = m
  user = model.at('_user')
  setupNotifications() unless model.get('_view.mobileDevice')
  
setupNotifications = ->
  return unless jQuery? # Only run this in the browser 
  
  statsNotification = (html, type) ->
    #don't show notifications if user dead
    return if user.get('stats.lvl') == 0
    $.bootstrapGrowl html, {
      type: type # (null, 'info', 'error', 'success')
      top_offset: 20
      align: 'right' # ('left', 'right', or 'center')
      width: 250 # (integer, or 'auto')
      delay: 3000
      allow_dismiss: true
      stackup_spacing: 10 # spacing between consecutive stacecked growls.
    }
    
  # Setup listeners which trigger notifications
  user.on 'set', 'stats.hp', (captures, args) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    if num < 0
      statsNotification "<i class='icon-heart'></i>HP -#{rounded}", 'error' # lost hp from purchase
    
  user.on 'set', 'stats.money', (captures, args) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    # made purchase
    if num < 0
      # FIXME use 'warning' when unchecking an accidently completed daily/todo, and notify of exp too
      statsNotification "<i class='icon-star'></i>GP -#{rounded}", 'success'
    # gained money (and thereby exp)
    else if num > 0
      num = Math.abs(num)
      statsNotification "<i class='icon-star'></i>Exp,GP +#{rounded}", 'success'
    
  user.on 'set', 'stats.lvl', (captures, args) ->
    if captures > args
      statsNotification('<i class="icon-chevron-up"></i> Level Up!', 'info')
  
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
      userSet 'stats.hp', newStats.hp
      
  if newStats.exp?
    # level up & carry-over exp
    tnl = user.get '_tnl'
    if newStats.exp >= tnl
      newStats.exp -= tnl
      userSet 'stats.lvl', userObj.stats.lvl + 1, update
      userSet 'stats.hp', 50, update
    if !userObj.items.itemsEnabled and newStats.exp >=15
      userSet 'items.itemsEnabled', true, update
      $('ul.items').popover
        title: content.items.unlockedMessage.title
        placement: 'left'
        trigger: 'manual'
        html: true
        content: "<div class='item-store-popover'>\
          <img src='/img/BrowserQuest/chest.png' />\
          #{content.items.unlockedMessage.content} <a href='#' onClick=\"$('ul.items').popover('hide');return false;\">[Close]</a>\
          </div>"
      $('ul.items').popover 'show'

    userSet 'stats.exp', newStats.exp, update
    
  if newStats.money?
    money = 0.0 if (!money? or money<0)
    userSet 'stats.money', newStats.money, update
    
# {taskId} task you want to score
# {direction} 'up' or 'down'
# {times} # times to call score on this task (1 unless cron, usually)
# {update} if we're running updates en-mass (eg, cron on server) pass in userObj
score = (taskId, direction, times, update) ->
  times ||= 1
  taskPath = "tasks.#{taskId}"
  [task, taskObj] = [model.at("_user.#{taskPath}"), model.get("_user.#{taskPath}")]
  {type, value} = taskObj
  userObj = update || user.get()

  # Don't adjust values for rewards, or for habits that don't have both + and -
  adjustvalue = (type != 'reward')
  if (type == 'habit') and (taskObj.up==false or taskObj.down==false)
    adjustvalue = false
  
  delta = 0
  # If multiple days have passed, multiply times days missed
  # TODO integrate this multiplier into the formula, so don't have to loop
  _.times times, (n) ->
    # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
    # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
    # rather than iteratively
    nextDelta = taskDeltaFormula(value, direction)
    value += nextDelta if adjustvalue
    delta += nextDelta
  
  if type == 'habit'
    # Add habit value to habit-history (if different)
    historyEntry = { date: new Date(), value: value } if taskObj.value != value
    if update
      taskObj.history.push historyEntry
    else
      task.push 'history', historyEntry
  userSet "#{taskPath}.value", value, update
  
  if update
    # Will modify the user later as an aggregate, just return the delta
    return if (type == 'daily') then delta else 0

  # Update the user's status
  {money, hp, exp, lvl} = userObj.stats

  if type == 'reward'
    # purchase item
    money -= taskObj.value
    num = parseFloat(taskObj.value).toFixed(2)
    # if too expensive, reduce health & zero money
    if money < 0
      hp += money # hp - money difference
      money = 0
      
  # Add points to exp & money if positive delta
  # Only take away mony if it was a mistake (aka, a checkbox)
  if (delta > 0 or (type in ['daily', 'todo'])) and !update? # update==cron
    modified = expModifier(delta)
    exp += modified
    money += modified
  # Deduct from health (rewards case handled above)
  else unless type in ['reward', 'todo']
    modified = hpModifier(delta)
    hp += modified

  updateStats {hp: hp, exp: exp, money: money}, update
  
  return delta 
  
# At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
# For incomplete Dailys, deduct experience
cron = ->
  today = new Date()
  user.setNull 'lastCron', today
  lastCron = user.get('lastCron')
  daysPassed = helpers.daysBetween(today, lastCron)
  if daysPassed > 0
    # Tally function, which is called asyncronously below - but function is defined here. 
    # We need access to some closure variables above
    todoTally = 0
    hpTally = 0
    tallyTask = (taskObj, callback) ->
      # setTimeout {THIS_FUNCTION}, 1 # strange hack that seems necessary when using async
      {id, type, completed, repeat} = taskObj
      #don't know why this happens, but it does. need to investigate
      unless id?
        return callback('a task had a null id during cron, this should not be happening')
      task = user.at("tasks.#{id}")
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
          hpTally += score(id, 'down', {cron:true, times:daysFailed})

        value = task.get('value') #get updated value
        if type == 'daily'
          task.push "history", { date: today, value: value }
        else
          absVal = if (completed) then Math.abs(value) else value
          todoTally += absVal
        task.pass({cron:true}).set('completed', false) if type == 'daily'
      callback()
    
    # Tally each task
    # _.each user.get('tasks'), (taskObj) -> tallyTask(taskObj, ->) 
    # Asyncronous version: 
    tasks = _.toArray(user.get('tasks'))
    async.forEach tasks, tallyTask, (err) ->  
      # Finished tallying, this is the 'completed' callback
      user.push 'history.todos', { date: today, value: todoTally }
      # tally experience
      expTally = user.get 'stats.exp'
      lvl = 0 #iterator
      while lvl < (user.get('stats.lvl')-1)
        lvl++
        expTally += (lvl*100)/5
      user.push 'history.exp',  { date: today, value: expTally }
      updateStats({hp:user.get('stats.hp')+hpTally}) # finally, the user if they've failed the last few days
      user.set('lastCron', today) # reset cron
  

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
