moment = require 'moment'
_ = require 'lodash'
algos = require './algos'
items = require('./items').items

sod = (timestamp, dayStart=0) ->
  #sanity-check reset-time (is it 24h time?)
  dayStart = 0 unless (dayStart = parseInt(dayStart)) and (0 <= dayStart <= 24)
  moment(timestamp).startOf('day').add('h', dayStart)

dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s'}

###
  Absolute diff between two dates
###
daysBetween = (yesterday, now, dayStart) -> Math.abs sod(yesterday, dayStart).diff(now, 'days')

###
  Should the user do this taks on this date, given the task's repeat options and user.preferences.dayStart?
###
shouldDo = (day, repeat, dayStart=0) ->
  return false unless repeat
  now = +new Date
  selected = repeat[dayMapping[sod(day, dayStart).day()]]
  return selected unless moment(day).isSame(now,'d')
  if dayStart <= moment(now).hour() # we're past the dayStart mark, is it due today?
    return selected
  else # we're not past dayStart mark, check if it was due "yesterday"
    yesterday = moment(now).subtract(1,'d').day()
    return repeat[dayMapping[yesterday]]

module.exports =

  ###
    This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
    user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
    so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
    Angular sets object properties directly - in which case, this function will be used.
  ###
  pathSet: (path, val, obj) ->
    arr = path.split('.')
    arr.reduce (curr, next, index) ->
      if (arr.length - 1) == index
        curr[next] = val
      curr[next]
    , obj

  daysBetween: daysBetween

  shouldDo: shouldDo

  ###
    Get a random property from an object
    http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
    returns random property (the value)
  ###
  randomVal: (obj) ->
    result = undefined
    count = 0
    for key, val of obj
      result = val if Math.random() < (1 / ++count)
    result

  ###
    Remove whitespace #FIXME are we using this anywwhere? Should we be?
  ###
  removeWhitespace: (str) ->
    return '' unless str
    str.replace /\s/g, ''

  ###
    Generate the username, since it can be one of many things: their username, their facebook fullname, their manually-set profile name
  ###
  username: (auth, override) ->
    #some people define custom profile name in Avatar -> Profile
    return override if override

    if auth?.facebook?.displayName?
      auth.facebook.displayName
    else if auth?.facebook?
      fb = auth.facebook
      if fb._raw then "#{fb.name.givenName} #{fb.name.familyName}" else fb.name
    else if auth?.local?
      auth.local.username
    else
      'Anonymous'

  ###
    Encode the download link for .ics iCal file
  ###
  encodeiCalLink: (uid, apiToken) ->
    loc = window?.location.host or process?.env?.BASE_URL or ''
    encodeURIComponent "http://#{loc}/v1/users/#{uid}/calendar.ics?apiToken=#{apiToken}"

  ###
    User's currently equiped item
  ###
  equipped: (type, item=0, preferences={gender:'m', armorSet:'v1'}, backerTier=0) ->
    {gender, armorSet} = preferences
    item = parseInt(item)
    backerTier = parseInt(backerTier)

    switch type
      when'armor'
        if item > 5
          return 'armor_6' if backerTier >= 45
          item = 5 # set them back if they're trying to cheat
        if gender is 'f'
          return if (item is 0) then "f_armor_#{item}_#{armorSet}" else "f_armor_#{item}"
        else
          return "m_armor_#{item}"

      when 'head'
        if item > 5
          return 'head_6' if backerTier >= 45
          item = 5
        if gender is 'f'
          return if (item > 1) then "f_head_#{item}_#{armorSet}" else "f_head_#{item}"
        else
          return "m_head_#{item}"

      when 'shield'
        if item > 5
          return 'shield_6' if backerTier >= 45
          item = 5
        return "#{preferences.gender}_shield_#{item}"

      when 'weapon'
        if item > 6
          return 'weapon_7' if backerTier >= 70
          item = 6
        return "#{preferences.gender}_weapon_#{item}"

  ###
    Gold amount from their money
  ###
  gold: (num) ->
    if num
      return (num).toFixed(1).split('.')[0]
    else
      return "0"

  ###
    Silver amount from their money
  ###
  silver: (num) ->
    if num
      (num).toFixed(2).split('.')[1]
    else
      return "00"

  ###
    Task classes given everything about the class
  ###
  taskClasses: (task, filters, dayStart, lastCron, showCompleted=false) ->
    return unless task
    {type, completed, value, repeat} = task

    # completed / remaining toggle
    return 'hidden' if (type is 'todo') and (completed != showCompleted)

    for filter, enabled of filters
      if enabled and not task.tags?[filter]
        # All the other classes don't matter
        return 'hidden'

    classes = type

    # show as completed if completed (naturally) or not required for today
    if type in ['todo', 'daily']
      if completed or (type is 'daily' and !shouldDo(+new Date, task.repeat, dayStart))
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
    Does the user own this pet?
  ###
  ownsPet: (pet, userPets) -> _.isArray(userPets) and userPets.indexOf(pet) != -1

  ###
    Friendly timestamp
  ###
  friendlyTimestamp: (timestamp) -> moment(timestamp).format('MM/DD h:mm:ss a')

  ###
    Does user have new chat messages?
  ###
  newChatMessages: (messages, lastMessageSeen) ->
    return false unless messages?.length > 0
    messages?[0] and (messages[0].id != lastMessageSeen)

  ###
    Relative Date
  ###
  relativeDate: require('relative-date')

  ###
    are any tags active?
  ###
  noTags: (tags) -> _.isEmpty(tags) or _.isEmpty(_.filter( tags, (t) -> t ) )

  ###
    Are there tags applied?
  ###
  appliedTags: (userTags, taskTags) ->
    arr = []
    _.each userTags, (t) ->
      return unless t?
      arr.push(t.name) if taskTags?[t.id]
    arr.join(', ')

  ###
    User stats
  ###

  userStr: (level) -> str = (level-1) / 2
  totalStr: (level, weapon=0) ->
    str = (level-1) / 2
    totalStr = (str + items.weapon[weapon].strength)
  userDef: (level) -> def = (level-1) / 2
  totalDef: (level, armor=0, helm=0, shield=0) ->
    def = (level-1) / 2
    totalDef = (def + items.armor[armor].defense + items.head[helm].defense + items.shield[shield].defense)
  itemText: (type, item=0) -> items[type][parseInt(item)].text
  itemStat: (type, item=0) -> if type is 'weapon' then items[type][parseInt(item)].strength else items[type][parseInt(item)].defense