var HP = 15
    , XP = 2
    , Items = require('./items');

function priorityValue(priority) {
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

function tnl(level) {
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


function expModifier(value, weaponStr, level, priority) {
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


function hpModifier(value, armorDef, helmDef, shieldDef, level, priority) {
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


function gpModifier(value, modifier, priority) {
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


function taskDeltaFormula(currentValue, direction) {
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

function score(user, taskId, direction, times, cron) {
    var task = _.findWhere(user.tasks, {id: taskId})
        , type = task.type
        , value = task.value
        , priority = task.priority || '!'
        , delta = 0
        , times = times? times: 1;


    if (task.value > user.stats.gp && task.type === 'reward') {
        r = confirm("Not enough GP to purchase this reward, buy anyway and lose HP? (Punishment for taking a reward you didn't earn).");
        if (!r) return;
    }

    function calculateDelta(adjustvalue) {
        adjustvalue = adjustvalue? adjustvalue: true;
        _.times(times, function(n) {
            var nextDelta;
            nextDelta = taskDeltaFormula(value, direction);
            if (adjustvalue) {
                value += nextDelta;
            }
            delta += nextDelta;
        });
    };

    function addPoints() {
        var level, weaponStrength;
        level = user.stats.lvl;
        weaponStrength = Items.items.weapon[user.items.weapon].strength;
        user.stats.exp += expModifier(delta, weaponStrength, level, priority);
        user.stats.gp += gpModifier(delta, 1, priority);
    };

    function subtractPoints() {
        var armorDefense, helmDefense, level, shieldDefense;
        level = user.stats.lvl;
        armorDefense = Items.items.armor[user.items.armor].defense;
        helmDefense = Items.items.head[user.items.head].defense;
        shieldDefense = Items.items.shield[user.items.shield].defense;
        user.stats.hp += hpModifier(delta, armorDefense, helmDefense, shieldDefense, level, priority);
    };
    switch (type) {
        case 'habit':
            calculateDelta();
            if (delta > 0) {
                addPoints();
            } else {
                subtractPoints();
            }
            task.history = task.history? task.history: [];
            if (task.value !== value) {
                task.history.push({
                    date: +(new Date),
                    value: value
                });
            }
            break;
        case 'daily':
            if (cron != null) {
                calculateDelta();
                subtractPoints();
            } else {
                calculateDelta(false);
                if (delta !== 0) {
                    addPoints();
                }
            }
            break;
        case 'todo':
            if (cron != null) {
                calculateDelta();
            } else {
                calculateDelta();
                addPoints();
            }
            break;
        case 'reward':
            calculateDelta(false);
            user.stats.gp -= Math.abs(task.value);
            var num = parseFloat(task.value).toFixed(2);
            if (user.stats.gp < 0) {
                user.stats.hp += user.stats.gp;
                user.stats.gp = 0;
            }
    }
    task.value = value;
    updateStats(user);
    return delta;
};

/*
 Updates user stats with new stats. Handles death, leveling up, etc
 {stats} new stats
 {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
 */


function updateStats(user) {
    if (user.stats.lvl === 0) return;
    if (user.stats.hp <= 0) {
        user.stats.lvl = 0; // signifies dead
        user.stats.hp = 0;
        return;
    }
    if (user.stats.lvl >= 100) {
        user.stats.gp += user.stats.exp / 15;
        user.stats.exp = 0;
        user.stats.lvl = 100;
    } else {
        var currTnl = user.stats.tnl = tnl(user.stats.lvl);
        if (user.stats.exp >= currTnl) {
            while (user.stats.exp >= currTnl && user.stats.lvl < 100) {
                user.stats.exp -= currTnl;
                user.stats.lvl++;
                user.stats.tnl = tnl(user.stats.lvl);
            }
            if (user.stats.lvl === 100) {
                user.stats.exp = 0;
            }
            user.stats.hp = 50;
        }
    }
    if (!user.flags.customizationsNotification && (user.stats.exp > 10 || user.stats.lvl > 1)) {
        user.flags.customizationsNotification = true;
        user.flags.customizationsNotification = true;
    }
    if (!user.flags.itemsEnabled && user.stats.lvl >= 2) {
        user.flags.itemsEnabled = true;
        user.flags.itemsEnabled = true;
    }
    if (!user.flags.partyEnabled && user.stats.lvl >= 3) {
        user.flags.partyEnabled = true;
        user.flags.partyEnabled = true;
    }
    if (!user.flags.petsEnabled && user.stats.lvl >= 4) {
        user.flags.petsEnabled = true;
        user.flags.petsEnabled = true;
    }

    if (user.stats.gp < 0) user.stats.gp = 0.0;
};


module.exports = {
    tnl: tnl,
    score: score
}