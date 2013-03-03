
MODIFIER = .02

module.exports.tnl = (level) ->
	return (Math.pow(level,2)*10)+(level*10)+80

###
  Calculates Exp modificaiton based on level and weapon strength
  {value} task.value for exp gain
  {weaponStrength) weapon strength 
  {level} current user level
###
module.exports.expModifier = (value, weaponStrength, level, multiplier=1) ->
  levelModifier = (level-1) * MODIFIER
  weaponModifier = weaponStrength / 100
  strength = 1 + weaponModifier + levelModifier
  return value * strength * multiplier

###
  Calculates HP modification based on level and armor defence
  {value} task.value for hp loss
  {armorDefense} defense from armor
  {helmDefense} defense from helm 
  {level} current user level
###
module.exports.hpModifier = (value, armorDefense, helmDefense, shieldDefense, level, multiplier=1) ->
  levelModifier = (level-1) * MODIFIER
  armorModifier = (armorDefense + helmDefense + shieldDefense) / 100
  defense = 1 - levelModifier + armorModifier
  return value * defense * multiplier

###
  Future use
###
module.exports.gpModifier = (value, modifier, multiplier=1) ->
  return value * modifier * multiplier

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
	#sign = if (direction is 'up') then 1 else -1
	#delta = Math.pow(0.95,currentValue) * sign
	#if delta < -5 then delta = -5
	#console.log("CurrentValue: " + currentValue + " delta: " + delta)
	#delta = if (currentValue < 0) then (( -0.1 * currentValue + 1 ) * sign) else (( Math.pow(0.9,currentValue) ) * sign)
	return delta