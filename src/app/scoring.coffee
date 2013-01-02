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
  setupNotifications() unless model.get('_mobileDevice')
  
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
  
# Setter for user.stats: handles death, leveling up, etc
updateStats = (stats) ->
  # if user is dead, dont do anything
  return if user.get('stats.lvl') == 0
    
  if stats.hp?
    # game over
    if stats.hp <= 0
      user.set 'stats.lvl', 0 # this signifies dead
      user.set 'stast.hp', 0
      return
    else
      user.set 'stats.hp', stats.hp
      
  if stats.exp?
    # level up & carry-over exp
    tnl = user.get '_tnl'
    if stats.exp >= tnl
      stats.exp -= tnl
      user.set 'stats.lvl', user.get('stats.lvl') + 1
      user.set 'stats.hp', 50
    if !user.get('items.itemsEnabled') and stats.exp >=15
      user.set 'items.itemsEnabled', true
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

    user.set 'stats.exp', stats.exp
    
  if stats.money?
    money = 0.0 if (!money? or money<0)
    user.set 'stats.money', stats.money
    
# {taskId} task you want to score
# {direction} 'up' or 'down'
# {options} will usually be passed in via cron or tests, safe to ignore this param
score = (taskId, direction, options={cron:false, times:1}) ->
  taskPath = "_user.tasks.#{taskId}"
  [task, taskObj] = [model.at(taskPath), model.get(taskPath)]
  {type, value} = taskObj
  userObj = user.get()

  # up / down was called by itself, probably as REST from 3rd party service
  #FIXME handle this
  if !task
    {money, hp, exp} = userObj.stats
    if (direction == "up")
      modified = expModifier(1)
      money += modified
      exp += modified
    else
      modified = hpModifier(1)
      hp -= modified
    updateStats({hp: hp, exp: exp, money: money})
    return
    
  # Don't adjust values for rewards, or for habits that don't have both + and -
  adjustvalue = (type != 'reward')
  if (type == 'habit') and (taskObj.up==false or taskObj.down==false)
    adjustvalue = false
  
  delta = 0
  # If multiple days have passed, multiply times days missed
  # TODO integrate this multiplier into the formula, so don't have to loop
  _.times options.times, (n) -> 
    # Each iteration calculate the delta (nextDelta), which is then accumulated in delta
    # (aka, the total delta). This weirdness won't be necessary when calculating mathematically
    # rather than iteratively
    nextDelta = taskDeltaFormula(value, direction)
    value += nextDelta if adjustvalue
    delta += nextDelta
  
  if type == 'habit'
    # Add habit value to habit-history (if different)
    task.push 'history', { date: new Date(), value: value } if taskObj.value != value
  task.set('value', value)
  
  if options.cron
    # Will modify the user later as an aggregate, just return the delta
    return if (type == 'daily') then delta else 0

  # Update the user's status
  {money, hp, exp, lvl} = userObj.stats

  if type == 'reward'
    # purchase item
    money -= task.get('value')
    num = parseFloat(task.get('value')).toFixed(2)
    # if too expensive, reduce health & zero money
    if money < 0
      hp += money# hp - money difference
      money = 0
      
  # Add points to exp & money if positive delta
  # Only take away mony if it was a mistake (aka, a checkbox)
  if (delta > 0 or (type in ['daily', 'todo'])) and !options.cron
    modified = expModifier(delta)
    exp += modified
    money += modified
  # Deduct from health (rewards case handled above)
  else unless type in ['reward', 'todo']
    modified = hpModifier(delta)
    hp += modified

  updateStats({hp: hp, exp: exp, money: money})
  
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