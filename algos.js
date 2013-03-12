var HP, XP, priorityValue;

XP = 15;

HP = 2;

priorityValue = function(priority) {
    if (priority == null) {
        priority = '!';
    }
    switch (priority) {
        case '!':
            return 1;
        case '!!':
            return 1.5;
        case '!!!':
            return 2;
        default:
            return 1;
    }
};

exports.tnl = function(level) {
    var value;
    if (level >= 100) {
        value = 0;
    } else {
        value = Math.round(((Math.pow(level, 2) * 0.25) + (10 * level) + 139.75) / 10) * 10;
    }
    return value;
};

/*
 Calculates Exp modificaiton based on level and weapon strength
 {value} task.value for exp gain
 {weaponStrength) weapon strength
 {level} current user level
 {priority} user-defined priority multiplier
 */


exports.expModifier = function(value, weaponStr, level, priority) {
    var exp, str, strMod, totalStr;
    if (priority == null) {
        priority = '!';
    }
    str = (level - 1) / 2;
    totalStr = (str + weaponStr) / 100;
    strMod = 1 + totalStr;
    exp = value * XP * strMod * priorityValue(priority);
    return Math.round(exp);
};

/*
 Calculates HP modification based on level and armor defence
 {value} task.value for hp loss
 {armorDefense} defense from armor
 {helmDefense} defense from helm
 {level} current user level
 {priority} user-defined priority multiplier
 */


exports.hpModifier = function(value, armorDef, helmDef, shieldDef, level, priority) {
    var def, defMod, hp, totalDef;
    if (priority == null) {
        priority = '!';
    }
    def = (level - 1) / 2;
    totalDef = (def + armorDef + helmDef + shieldDef) / 100;
    defMod = 1 - totalDef;
    hp = value * HP * defMod * priorityValue(priority);
    return Math.round(hp * 10) / 10;
};

/*
 Future use
 {priority} user-defined priority multiplier
 */


exports.gpModifier = function(value, modifier, priority) {
    if (priority == null) {
        priority = '!';
    }
    return value * modifier * priorityValue(priority);
};

/*
 Calculates the next task.value based on direction
 Uses a capped inverse log y=.95^x, y>= -5
 {currentValue} the current value of the task
 {direction} up or down
 */


exports.taskDeltaFormula = function(currentValue, direction) {
    var delta;
    if (currentValue < -47.27) {
        currentValue = -47.27;
    } else if (currentValue > 21.27) {
        currentValue = 21.27;
    }
    delta = Math.pow(0.9747, currentValue);
    if (direction === 'up') {
        return delta;
    }
    return -delta;
};
