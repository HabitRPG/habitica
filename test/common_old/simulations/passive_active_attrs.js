var _, clearUser, id, party, s, shared, task, user;

shared = require('../../../common/script/index.js');

_ = require('lodash');

id = shared.uuid();

user = {
  stats: {
    "class": 'warrior',
    buffs: {
      per: 0,
      int: 0,
      con: 0,
      str: 0
    }
  },
  party: {
    quest: {
      key: 'evilsanta',
      progress: {
        up: 0,
        down: 0
      }
    }
  },
  preferences: {
    automaticAllocation: false
  },
  achievements: {},
  flags: {
    levelDrops: {}
  },
  items: {
    eggs: {},
    hatchingPotions: {},
    food: {},
    quests: {},
    gear: {
      equipped: {
        weapon: 'weapon_warrior_4',
        armor: 'armor_warrior_4',
        shield: 'shield_warrior_4',
        head: 'head_warrior_4'
      }
    }
  },
  habits: [
    shared.taskDefaults({
      id: id,
      value: 0
    })
  ],
  dailys: [
    {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }, {
      "text": "1"
    }
  ],
  todos: [],
  rewards: []
};

shared.wrap(user);

s = user.stats;

task = user.tasks[id];

party = [user];

console.log("\n\n================================================");

console.log("New Simulation");

console.log("================================================\n\n");

clearUser = function(lvl) {
  if (lvl == null) {
    lvl = 1;
  }
  _.merge(user.stats, {
    exp: 0,
    gp: 0,
    hp: 50,
    lvl: lvl,
    str: lvl * 1.5,
    con: lvl * 1.5,
    per: lvl * 1.5,
    int: lvl * 1.5,
    mp: 100
  });
  _.merge(s.buffs, {
    str: 0,
    con: 0,
    int: 0,
    per: 0
  });
  _.merge(user.party.quest.progress, {
    up: 0,
    down: 0
  });
  return user.items.lastDrop = {
    count: 0
  };
};

_.each([1, 25, 50, 75, 100], function(lvl) {
  console.log("[LEVEL " + lvl + "] (" + (lvl * 2) + " points total in every attr)\n\n");
  _.each({
    red: -25,
    yellow: 0,
    green: 35
  }, function(taskVal, color) {
    var _party, b4, str;
    console.log("[task.value = " + taskVal + " (" + color + ")]");
    console.log("direction\texpΔ\t\thpΔ\tgpΔ\ttask.valΔ\ttask.valΔ bonus\t\tboss-hit");
    _.each(['up', 'down'], function(direction) {
      var b4, delta;
      clearUser(lvl);
      b4 = {
        hp: s.hp,
        taskVal: taskVal
      };
      task.value = taskVal;
      if (direction === 'up') {
        task.type = 'daily';
      }
      delta = user.ops.score({
        params: {
          id: id,
          direction: direction
        }
      });
      return console.log((direction === 'up' ? '↑' : '↓') + "\t\t" + s.exp + "/" + (shared.tnl(s.lvl)) + "\t\t" + ((b4.hp - s.hp).toFixed(1)) + "\t" + (s.gp.toFixed(1)) + "\t" + (delta.toFixed(1)) + "\t\t" + ((task.value - b4.taskVal - delta).toFixed(1)) + "\t\t\t" + (user.party.quest.progress.up.toFixed(1)));
    });
    str = '- [Wizard]';
    task.value = taskVal;
    clearUser(lvl);
    b4 = {
      taskVal: taskVal
    };
    shared.content.spells.wizard.fireball.cast(user, task);
    str += "\tfireball(task.valΔ:" + ((task.value - taskVal).toFixed(1)) + " exp:" + (s.exp.toFixed(1)) + " bossHit:" + (user.party.quest.progress.up.toFixed(2)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    _party = [
      user, {
        stats: {
          mp: 0
        }
      }
    ];
    shared.content.spells.wizard.mpheal.cast(user, _party);
    str += "\t| mpheal(mp:" + _party[1].stats.mp + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.wizard.earth.cast(user, party);
    str += "\t\t\t\t| earth(buffs.int:" + s.buffs.int + ")";
    s.buffs.int = 0;
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.wizard.frost.cast(user, {});
    str += "\t\t\t| frost(N/A)";
    console.log(str);
    str = '- [Warrior]';
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.warrior.smash.cast(user, task);
    b4 = {
      taskVal: taskVal
    };
    str += "\tsmash(task.valΔ:" + ((task.value - taskVal).toFixed(1)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.warrior.defensiveStance.cast(user, {});
    str += "\t\t| defensiveStance(buffs.con:" + s.buffs.con + ")";
    s.buffs.con = 0;
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.warrior.valorousPresence.cast(user, party);
    str += "\t\t\t| valorousPresence(buffs.str:" + s.buffs.str + ")";
    s.buffs.str = 0;
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.warrior.intimidate.cast(user, party);
    str += "\t\t| intimidate(buffs.con:" + s.buffs.con + ")";
    s.buffs.con = 0;
    console.log(str);
    str = '- [Rogue]';
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.rogue.pickPocket.cast(user, task);
    str += "\tpickPocket(gp:" + (s.gp.toFixed(1)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.rogue.backStab.cast(user, task);
    b4 = {
      taskVal: taskVal
    };
    str += "\t\t| backStab(task.valΔ:" + ((task.value - b4.taskVal).toFixed(1)) + " exp:" + (s.exp.toFixed(1)) + " gp:" + (s.gp.toFixed(1)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.rogue.toolsOfTrade.cast(user, party);
    str += "\t| toolsOfTrade(buffs.per:" + s.buffs.per + ")";
    s.buffs.per = 0;
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.rogue.stealth.cast(user, {});
    str += "\t\t| stealth(avoiding " + user.stats.buffs.stealth + " tasks)";
    user.stats.buffs.stealth = 0;
    console.log(str);
    str = '- [Healer]';
    task.value = taskVal;
    clearUser(lvl);
    s.hp = 0;
    shared.content.spells.healer.heal.cast(user, {});
    str += "\theal(hp:" + (s.hp.toFixed(1)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.healer.brightness.cast(user, {});
    b4 = {
      taskVal: taskVal
    };
    str += "\t\t\t| brightness(task.valΔ:" + ((task.value - b4.taskVal).toFixed(1)) + ")";
    task.value = taskVal;
    clearUser(lvl);
    shared.content.spells.healer.protectAura.cast(user, party);
    str += "\t\t\t| protectAura(buffs.con:" + s.buffs.con + ")";
    s.buffs.con = 0;
    task.value = taskVal;
    clearUser(lvl);
    s.hp = 0;
    shared.content.spells.healer.heallAll.cast(user, party);
    str += "\t\t| heallAll(hp:" + (s.hp.toFixed(1)) + ")";
    console.log(str);
    return console.log('\n');
  });
  return console.log('------------------------------------------------------------');
});


/*
_.each [1,25,50,75,100,125], (lvl) ->
  console.log "[LEVEL #{lvl}] (#{lvl*2} points in every attr)\n\n"
  _.each {red:-25,yellow:0,green:35}, (taskVal, color) ->
    console.log "[task.value = #{taskVal} (#{color})]"
    console.log "direction\texpΔ\t\thpΔ\tgpΔ\ttask.valΔ\ttask.valΔ bonus\t\tboss-hit"
    _.each ['up','down'], (direction) ->
      clearUser(lvl)
      b4 = {hp:s.hp, taskVal}
      task.value = taskVal
      task.type = 'daily' if direction is 'up'
      delta = user.ops.score params:{id, direction}
      console.log "#{if direction is 'up' then '↑' else '↓'}\t\t#{s.exp}/#{shared.tnl(s.lvl)}\t\t#{(b4.hp-s.hp).toFixed(1)}\t#{s.gp.toFixed(1)}\t#{delta.toFixed(1)}\t\t#{(task.value-b4.taskVal-delta).toFixed(1)}\t\t\t#{user.party.quest.progress.up.toFixed(1)}"

    task.value = taskVal;clearUser(lvl)
    shared.content.spells.rogue.stealth.cast(user,{})
    console.log "\t\t| stealth(avoiding #{user.stats.buffs.stealth} tasks)"
    user.stats.buffs.stealth = 0

    console.log user.dailys.length
 */
