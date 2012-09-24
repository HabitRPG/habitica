async = require 'async'
moment = require 'moment'
content = require './content'
helpers = require './helpers'
MODIFIER = .03 # each new level, armor, weapon add 3% modifier (this number may change) 
user = undefined
model = undefined

# This is required by all the functions, make sure it's set before anythign else is called
setModel = (m) ->
  model = m
  user = model.at('_user')
  setupNotifications()
  
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
  user.on 'set', 'stats.hp', (captures, args, out, isLocal, passed) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    if num < 0
      statsNotification "<i class='icon-heart'></i>HP -#{rounded}", 'error' # lost hp from purchase
    
  user.on 'set', 'stats.money', (captures, args, out, isLocal, passed) ->
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
    
  user.on 'set', 'stats.lvl', (captures, args, out, isLocal, passed) ->
    if captures > args
      statsNotification('<i class="icon-chevron-up"></i> Level Up!', 'info')
  
# Calculates Exp modification based on weapon & lvl
expModifier = (value) ->
  dmg = user.get('items.weapon') * MODIFIER # each new weapon increases exp gain
  dmg += user.get('stats.lvl') * MODIFIER # same for lvls
  modified = value + (value * dmg)
  return modified

# Calculates HP-loss modification based on armor & lvl
hpModifier = (value) ->
  ac = user.get('items.armor') * MODIFIER # each new armor decreases HP loss
  ac += user.get('stats.lvl') * MODIFIER # same for lvls
  modified = value - (value * ac)
  return modified
  
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
# {cron} is this function being called by cron? (this will usually be false)
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
    
  
  # For negative values, use a line: something like y=-.1x+1
  # For positibe values, taper off with inverse log: y=.9^x
  # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
  sign = if (direction == "up") then 1 else -1
  delta = if (value < 0) then (( -0.1 * value + 1 ) * sign) else (( Math.pow(0.9,value) ) * sign)

  # Don't adjust values for rewards, or for habits that don't have both + and -
  adjustvalue = (type != 'reward')
  if (type == 'habit') and (taskObj.up==false or taskObj.down==false)
    adjustvalue = false
  value += delta if adjustvalue
  
  # If multiple days have passed, multiply times days missed
  value *= options.times

  if type == 'habit'
    # Add habit value to habit-history (if different)
    task.push 'history', { date: moment().sod().toDate(), value: value } if taskObj.value != value
  task.set('value', value)

  # Update the user's status
  [money, hp, exp, lvl] = [userObj.stats.money, userObj.stats.hp, userObj.stats.exp, userObj.stats.lvl]

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
  today = moment().sod() # start of day
  user.setNull 'lastCron', today.toDate()
  lastCron = moment(user.get('lastCron'))
  daysPassed = today.diff(lastCron, 'days')
  if daysPassed > 0
    # Tally function, which is called asyncronously below - but function is defined here. 
    # We need access to some closure variables above
    todoTally = 0
    tallyTask = (taskObj, next) ->
      {id, type, completed, repeat} = taskObj
      return unless id? #this shouldn't be happening, some tasks seem to be corrupted
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
            dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}
            dueToday = (repeat && repeat[dayMapping[momentDate.day()]]==true) 
          score(taskId, 'down', {cron:true, times: daysFailed})

        value = task.get('value') #get updated value
        if type == 'daily'
          task.push "history", { date: today.toDate(), value: value }
        else
          absVal = if (completed) then Math.abs(value) else value
          todoTally += absVal
        task.pass({cron:true}).set('completed', false) if type == 'daily'
      next()
    
    # Tally each task
    tasks = _.toArray(user.get('tasks'))    
    async.forEach tasks, tallyTask, (err) ->
      # Finished tallying, this is the 'completed' callback
      user.push 'history.todos', { date: today.toDate(), value: todoTally }
      # tally experience
      expTally = user.get 'stats.exp'
      lvl = 0 #iterator
      while lvl < (user.get('stats.lvl')-1)
        lvl++
        expTally += (lvl*100)/5
      user.push 'history.exp',  { date: today.toDate(), value: expTally }
      user.set('lastCron', today.toDate()) # reset cron 
  

module.exports = {
  MODIFIER: MODIFIER
  setModel: setModel
  score: score
  cron: cron
}