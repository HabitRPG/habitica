angular.module('habitRPG').factory 'Algos', ->

  XP = 15
  HP = 2

  priorityValue: (priority='!') ->
    switch priority
      when '!' then 1
      when '!!' then 1.5
      when '!!!' then 2
      else 1

  tnl: (level) ->
    if level >= 100
      value = 0
    else
      value = Math.round(((Math.pow(level,2)*0.25)+(10 * level) + 139.75)/10)*10 # round to nearest 10
    return value

  ###
    Calculates Exp modificaiton based on level and weapon strength
    {value} task.value for exp gain
    {weaponStrength) weapon strength
    {level} current user level
    {priority} user-defined priority multiplier
  ###
  expModifier: (value, weaponStr, level, priority='!') ->
    str = (level-1) / 2 # ultimately get this from user
    totalStr = (str + weaponStr) / 100
    strMod = 1 + totalStr
    exp = value * XP * strMod * priorityValue(priority)
    return Math.round(exp)

  ###
    Calculates HP modification based on level and armor defence
    {value} task.value for hp loss
    {armorDefense} defense from armor
    {helmDefense} defense from helm
    {level} current user level
    {priority} user-defined priority multiplier
  ###
  hpModifier: (value, armorDef, helmDef, shieldDef, level, priority='!') ->
    def = (level-1) / 2 # ultimately get this from user?
    totalDef = (def + armorDef + helmDef + shieldDef) / 100 #ultimate get this from user
    defMod = 1 - totalDef
    hp = value * HP * defMod * priorityValue(priority)
    return Math.round(hp * 10)/10 # round to 1dp

  ###
    Future use
    {priority} user-defined priority multiplier
  ###
  gpModifier: (value, modifier, priority='!') ->
    return value * modifier * priorityValue(priority)

  ###
    Calculates the next task.value based on direction
    Uses a capped inverse log y=.95^x, y>= -5
    {currentValue} the current value of the task
    {direction} up or down
  ###
  taskDeltaFormula: (currentValue, direction) ->
    if currentValue < -47.27 then currentValue = -47.27
    else if currentValue > 21.27 then currentValue = 21.27
    delta = Math.pow(0.9747,currentValue)
    return delta if direction is 'up'
    return -delta


