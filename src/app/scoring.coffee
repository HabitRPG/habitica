content = require('./content')
helpers = require('./helpers')
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
    
score = (spec = {task:null, direction:null, cron:null}) ->
  [task, direction, cron] = [spec.task, spec.direction, spec.cron]
  
  # up / down was called by itself, probably as REST from 3rd party service
  if !task
    [money, hp, exp] = [user.get('stats.money'), user.get('stats.hp'), user.get('stats.exp')]
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
  value = task.get('value')
  delta = if (value < 0) then (( -0.1 * value + 1 ) * sign) else (( Math.pow(0.9,value) ) * sign)
  
  type = task.get('type')

  # Don't adjust values for rewards, or for habits that don't have both + and -
  adjustvalue = (type != 'reward')
  if (type == 'habit') and (task.get("up")==false or task.get("down")==false)
    adjustvalue = false
  value += delta if adjustvalue

  if type == 'habit'
    # Add habit value to habit-history (if different)
    task.push 'history', { date: new Date(), value: value } if task.get('value') != value
  task.set('value', value)

  # Update the user's status
  [money, hp, exp, lvl] = [user.get('stats.money'), user.get('stats.hp'), user.get('stats.exp'), user.get('stats.lvl')]

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
  if (delta > 0 or ( type in ['daily', 'todo'])) and !cron
    modified = expModifier(delta)
    exp += modified
    money += modified
  # Deduct from health (rewards case handled above)
  else unless type in ['reward', 'todo']
    modified = hpModifier(delta)
    hp += modified

  updateStats({hp: hp, exp: exp, money: money})
  
  return delta 

cron = ->  
  today = moment().sod() # start of day
  user.setNull 'lastCron', today.toDate()
  lastCron = moment(user.get('lastCron'))
  daysPassed = today.diff(lastCron, 'days')
  if daysPassed > 0
    user.set('lastCron', today.toDate()) # reset cron
    _.times daysPassed, (n) ->
      tallyFor = lastCron.add('d',n)
      tally(tallyFor)   

# At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
# For incomplete Dailys, deduct experience
tally = (momentDate) ->
  todoTally = 0
  _.each user.get('tasks'), (taskObj, taskId, list) ->
    #FIXME is it hiccuping here? taskId == "$_65255f4e-3728-4d50-bade-3b05633639af_2", & taskObj.id = undefined
    return unless taskObj.id? #this shouldn't be happening, some tasks seem to be corrupted
    [type, value, completed, repeat] = [taskObj.type, taskObj.value, taskObj.completed, taskObj.repeat]
    task = user.at("tasks.#{taskId}")
    if type in ['todo', 'daily']
      # Deduct experience for missed Daily tasks, 
      # but not for Todos (just increase todo's value)
      unless completed
        dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}
        dueToday = (repeat && repeat[dayMapping[momentDate.day()]]==true) 
        if dueToday or type=='todo'
          score({task:task, direction:'down', cron:true})
      if type == 'daily'
        task.push "history", { date: new Date(momentDate), value: value }
      else
        absVal = if (completed) then Math.abs(value) else value
        todoTally += absVal
      task.pass({cron:true}).set('completed', false) if type == 'daily'
  user.push 'history.todos', { date: new Date(momentDate), value: todoTally }
  
  # tally experience
  expTally = user.get 'stats.exp'
  lvl = 0 #iterator
  while lvl < (user.get('stats.lvl')-1)
    lvl++
    expTally += (lvl*100)/5
  user.push 'history.exp',  { date: new Date(), value: expTally } 
  

module.exports = {
  MODIFIER: MODIFIER
  setModel: setModel
  score: score
  cron: cron
}