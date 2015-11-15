var $w, _, id, modes, shared, user;

shared = require('../../../common/script/index.js');

_ = require('lodash');

$w = function(s) {
  return s.split(' ');
};

id = shared.uuid();

user = {
  stats: {
    "class": 'warrior',
    lvl: 1,
    hp: 50,
    gp: 0,
    exp: 10,
    per: 0,
    int: 0,
    con: 0,
    str: 0,
    buffs: {
      per: 0,
      int: 0,
      con: 0,
      str: 0
    },
    training: {
      int: 0,
      con: 0,
      per: 0,
      str: 0
    }
  },
  preferences: {
    automaticAllocation: false
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
  achievements: {},
  items: {
    eggs: {},
    hatchingPotions: {},
    food: {},
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
    {
      id: 'a',
      value: 1,
      type: 'habit',
      attribute: 'str'
    }
  ],
  dailys: [
    {
      id: 'b',
      value: 1,
      type: 'daily',
      attribute: 'str'
    }
  ],
  todos: [
    {
      id: 'c',
      value: 1,
      type: 'todo',
      attribute: 'con'
    }, {
      id: 'd',
      value: 1,
      type: 'todo',
      attribute: 'per'
    }, {
      id: 'e',
      value: 1,
      type: 'todo',
      attribute: 'int'
    }
  ],
  rewards: []
};

modes = {
  flat: _.cloneDeep(user),
  classbased_warrior: _.cloneDeep(user),
  classbased_rogue: _.cloneDeep(user),
  classbased_wizard: _.cloneDeep(user),
  classbased_healer: _.cloneDeep(user),
  taskbased: _.cloneDeep(user)
};

modes.classbased_warrior.stats["class"] = 'warrior';

modes.classbased_rogue.stats["class"] = 'rogue';

modes.classbased_wizard.stats["class"] = 'wizard';

modes.classbased_healer.stats["class"] = 'healer';

_.each($w('flat classbased_warrior classbased_rogue classbased_wizard classbased_healer taskbased'), function(mode) {
  _.merge(modes[mode].preferences, {
    automaticAllocation: true,
    allocationMode: mode.indexOf('classbased') === 0 ? 'classbased' : mode
  });
  return shared.wrap(modes[mode]);
});

console.log("\n\n================================================");

console.log("New Simulation");

console.log("================================================\n\n");

_.times([20], function(lvl) {
  console.log("[lvl " + lvl + "]\n--------------\n");
  return _.each($w('flat classbased_warrior classbased_rogue classbased_wizard classbased_healer taskbased'), function(mode) {
    var str, u;
    u = modes[mode];
    u.stats.exp = shared.tnl(lvl) + 1;
    if (mode === 'taskbased') {
      _.merge(u.stats, {
        per: 0,
        con: 0,
        int: 0,
        str: 0
      });
    }
    u.habits[0].attribute = u.fns.randomVal({
      str: 'str',
      int: 'int',
      per: 'per',
      con: 'con'
    });
    u.ops.score({
      params: {
        id: u.habits[0].id
      },
      direction: 'up'
    });
    u.fns.updateStats(u.stats);
    str = mode + (mode === 'taskbased' ? " (" + u.habits[0].attribute + ")" : "");
    return console.log(str, _.pick(u.stats, $w('per int con str')));
  });
});
