moment = require 'moment'
_ = require 'underscore'
relative = require 'relative-date'
algos = require './algos'
items = require('./items').items

# Absolute diff between two dates
daysBetween = (yesterday, now, dayStart) ->
  #sanity-check reset-time (is it 24h time?)
  dayStart = 0 unless (dayStart? and (dayStart = parseInt(dayStart)) and dayStart >= 0 and dayStart <= 24)
  Math.abs moment(yesterday).startOf('day').add('h', dayStart).diff(moment(now), 'days')

dayMapping = dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}

# http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
# obj: object
# returns random property (the value)
randomVal = (obj) ->
  result = undefined
  count = 0
  for key, val of obj
    result = val if Math.random() < (1 / ++count)
  result

removeWhitespace = (str) ->
  return '' unless str
  str.replace /\s/g, ''

username = (auth, override) ->
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

viewHelpers = (view) ->
  view.fn "percent", (x, y) ->
    x=1 if x==0
    Math.round(x/y*100)

  view.fn "round", (num) ->
    Math.round num

  view.fn "floor", (num) ->
    Math.floor num

  view.fn "ceil", (num) ->
    Math.ceil num

  view.fn "lt", (a, b) ->
    a < b
  view.fn 'gt', (a, b) -> a > b

  view.fn "tokens", (gp) ->
    return gp/0.25

  view.fn "mod", (a, b) ->
    parseInt(a) % parseInt(b) == 0

  view.fn "encodeiCalLink", (uid, apiToken) ->
    loc = window?.location.host or process.env.BASE_URL
    encodeURIComponent "http://#{loc}/v1/users/#{uid}/calendar.ics?apiToken=#{apiToken}"

  view.fn 'removeWhitespace', removeWhitespace

  view.fn "notEqual", (a, b) -> (a != b)
  view.fn "and", -> _.reduce arguments, (cumm, curr) -> cumm && curr
  view.fn "or", -> _.reduce arguments, (cumm, curr) -> cumm || curr

  view.fn "truarr", (num) -> num-1

  ###
    User
  ###
  view.fn "username", (auth, override) -> username(auth, override)
  view.fn "tnl", algos.tnl

  ###
    Items
  ###
  view.fn 'equipped', (type, item=0, preferences={gender:'m', armorSet:'v1'}, backerTier=0) ->
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

  view.fn "gold", (num) ->
    if num
      return (num).toFixed(1).split('.')[0]
    else
      return "0"

  view.fn "silver", (num) ->
    if num
      (num).toFixed(2).split('.')[1]
    else
      return "00"

  ###
    Tasks
  ###
  view.fn 'taskClasses', (task, filters, dayStart, lastCron) ->
    return unless task
    {type, completed, value, repeat} = task

    for filter, enabled of filters
      if enabled and not task.tags?[filter]
        # All the other classes don't matter
        return 'hide'

    classes = type

    now = moment().day()

    # calculate the current contextual day (e.g. if it's 12 AM Fri and the user's custom day start is 4 AM, then we should still act like it's Thursday)
    dayStart = 0 unless (dayStart? and (dayStart = parseInt(dayStart)) and dayStart >= 0 and dayStart <= 24)
    hourDiff = Math.abs moment(lastCron).startOf('day').add('h', dayStart).diff(moment(now), 'hours')
    dayStamp = moment(now).add('h', hourDiff)
    day = dayStamp.day()

    # show as completed if completed (naturally) or not required for today
    if type in ['todo', 'daily']
      if completed or (repeat and (repeat[dayMapping[day]] == false))
        classes += " completed"
      else
        classes += " uncompleted"

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

  view.fn 'ownsPet', (pet, userPets) -> !!userPets && userPets.indexOf(pet) != -1

  view.fn 'count', (arr) -> arr?.length or 0

  view.fn 'friendlyTimestamp', (timestamp) -> moment(timestamp).format('MM/DD h:mm:ss a')

  view.fn 'newChatMessages', (messages, lastMessageSeen) ->
    return false unless messages?.length > 0
    messages?[0] and (messages[0].id != lastMessageSeen)

  view.fn 'indexOf', (str1, str2) ->
    return false unless str1 && str2
    str1.indexOf(str2) != -1

  view.fn 'relativeDate', relative

  view.fn 'noTags', (tags) ->
    _.isEmpty(tags) or _.isEmpty(_.filter( tags, (t) -> t ) )

  view.fn 'appliedTags', (userTags, taskTags) ->
    arr = []
    _.each userTags, (t) ->
      arr.push(t.name) if taskTags?[t.id]
    arr.join(', ')

  view.fn 'userStr', (level) ->
    str = (level-1) / 2
  view.fn 'totalStr', (level, weapon=0) ->
    str = (level-1) / 2
    totalStr = (str + items.weapon[weapon].strength)
  view.fn 'userDef', (level) ->
    def = (level-1) / 2
  view.fn 'totalDef', (level, armor=0, helm=0, shield=0) ->
    def = (level-1) / 2
    totalDef = (def + items.armor[armor].defense + items.head[helm].defense + items.shield[shield].defense)
  view.fn 'itemText', (type, item=0) -> items[type][parseInt(item)].text
  view.fn 'itemStat', (type, item=0) -> if type is 'weapon' then items[type][parseInt(item)].strength else items[type][parseInt(item)].defense


#  view.fn 'activeFilters', (filters) ->
#    debugger
#    (_.find filters, (f) -> f)?



module.exports = { viewHelpers, removeWhitespace, randomVal, daysBetween, dayMapping, username }