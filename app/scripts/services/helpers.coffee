
angular.module('habitRPG').factory 'Helpers', (Algos) ->

  return {
    uuid: ->
      d = new Date().getTime()
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
        r = (d + Math.random()*16)%16 | 0
        d = Math.floor(d/16)
        if c=='x'
          return r
        else
          return (r&0x7|0x8)).toString(16)
    # Absolute diff between two dates
    daysBetween: (yesterday, now, dayStart) ->
      #sanity-check reset-time (is it 24h time?)
      dayStart = 0 unless (dayStart? and (dayStart = parseInt(dayStart)) and dayStart >= 0 and dayStart <= 24)
      Math.abs moment(yesterday).startOf('day').add('h', dayStart).diff(moment(now), 'days')

    dayMapping: {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}

    # http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
    # obj: object
    # returns random property (the value)
    randomVal: (obj) ->
      result = undefined
      count = 0
      for key, val of obj
        result = val if Math.random() < (1 / ++count)
      result

    removeWhitespace: (str) ->
      return '' unless str
      str.replace /\s/g, ''

    username: (auth, override) ->
      #some people define custom profile name in Avatar -> Profile
      return override if override?

      if auth?.facebook?.displayName?
        auth.facebook.displayName
      else if auth?.facebook?
        fb = auth.facebook
        if fb._raw then "#{fb.name.givenName} #{fb.name.familyName}" else fb.name
      else if auth?.local?
        auth.local.username
      else
        'Anonymous'

    percent: (x, y) ->
      x=1 if x==0
      Math.round(x/y*100)

    round: (num) ->
      Math.round num

    floor: (num) ->
      Math.floor num

    ceil: (num) ->
      Math.ceil num

    lt: (a, b) ->
      a < b

    gt: (a, b) -> a > b

    tokens: (gp) ->
      return gp/0.25

    mod: (a, b) ->
      parseInt(a) % parseInt(b) == 0

    encodeiCalLink: (uid, apiToken) ->
      loc = window?.location.host or process.env.BASE_URL
      encodeURIComponent "http://#{loc}/v1/users/#{uid}/calendar.ics?apiToken=#{apiToken}"

    truarr: (num) -> num-1

    ###
      User
    ###
    tnl: Algos.tnl

    ###
      Items
    ###
    equipped: (user, type) ->
      {gender, armorSet} = user?.preferences || {'m', 'v1'}

      if type=='armor'
        armor = user?.items?.armor || 0
        if gender == 'f'
          return if (parseInt(armor) == 0) then "f_armor_#{armor}_#{armorSet}" else "f_armor_#{armor}"
        else
          return "m_armor_#{armor}"

      else if type=='head'
        head = user?.items?.head || 0
        if gender == 'f'
          return if (parseInt(head) > 1) then "f_head_#{head}_#{armorSet}" else "f_head_#{head}"
        else
          return "m_head_#{head}"

    gold: (num) ->
      if num
        return (num).toFixed(1).split('.')[0]
      else
        return "0"

    silver: (num) ->
      if num
        (num).toFixed(2).split('.')[1]
      else
        return "00"

    ###
      Tasks
    ###
    taskClasses: (task, dayStart, lastCron) ->
      return unless task
      {type, completed, value, repeat} = task

      classes = type

      now = moment().day()

      # calculate the current contextual day (e.g. if it's 12 AM Fri and the user's custom day start is 4 AM, then we should still act like it's Thursday)
      dayStart = 0 unless (dayStart? and (dayStart = parseInt(dayStart)) and dayStart >= 0 and dayStart <= 24)
      hourDiff = Math.abs moment(lastCron).startOf('day').add('h', dayStart).diff(moment(now), 'hours')
      dayStamp = moment(now).add('h', hourDiff)
      day = dayStamp.day()

      # show as completed if completed (naturally) or not required for today
      if type in ['todo', 'daily']
        if completed or (repeat and (repeat[@dayMapping[day]] == false))
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

      classes += ' habit-wide' if task.up and task.down
      return classes

    ownsPet: (pet, userPets) -> userPets?.indexOf(pet) != -1

    count: (arr) -> arr?.length or 0
  }