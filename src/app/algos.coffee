
MODIFIER = .02

priorityValue = (priority='!') ->
  switch priority
    when '!' then 1
    when '!!' then 1.5
    when '!!!' then 2
    else 1

module.exports.tnl = (level) ->
	return (Math.pow(level,2)*10)+(level*10)+80

###
  Calculates Exp modificaiton based on level and weapon strength
  {value} task.value for exp gain
  {weaponStrength) weapon strength 
  {level} current user level
  {priority} user-defined priority multiplier
###
module.exports.expModifier = (value, weaponStrength, level, priority='!') ->
  levelModifier = (level-1) * MODIFIER
  weaponModifier = weaponStrength / 100
  strength = 1 + weaponModifier + levelModifier
  return value * strength * priorityValue(priority)

###
  Calculates HP modification based on level and armor defence
  {value} task.value for hp loss
  {armorDefense} defense from armor
  {helmDefense} defense from helm 
  {level} current user level
  {priority} user-defined priority multiplier
###
module.exports.hpModifier = (value, armorDefense, helmDefense, shieldDefense, level, priority='!') ->
  levelModifier = (level-1) * MODIFIER
  armorModifier = (armorDefense + helmDefense + shieldDefense) / 100
  defense = 1 - levelModifier + armorModifier
  return value * defense * priorityValue(priority)

###
  Future use
  {priority} user-defined priority multiplier
###
module.exports.gpModifier = (value, modifier, priority='!') ->
  return value * modifier * priorityValue(priority)

###
  Calculates the next task.value based on direction
  Uses a capped inverse log y=.95^x, y>= -5
  {currentValue} the current value of the task
  {direction} up or down
###
module.exports.taskDeltaFormula = (currentValue, direction) ->
	if direction is 'up'
		delta = Math.max(Math.pow(0.95,currentValue),0.25)
	else
		delta = -Math.min(Math.pow(0.95,currentValue),5)
	console.log("CV = " + currentValue + " Dir = " + direction + " delta = " + delta)
	return delta