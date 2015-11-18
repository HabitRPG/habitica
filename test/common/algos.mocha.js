var $w, _, beforeAfter, cycle, expect, expectClosePoints, expectDayResetNoDamage, expectGainedPoints, expectLostPoints, expectNoChange, expectStrings, moment, newUser, repeatWithoutLastWeekday, rewrapUser, shared, sinon, test_helper;

_ = require('lodash');

expect = require('expect.js');

sinon = require('sinon');

moment = require('moment');

shared = require('../../common/script/index.js');

shared.i18n.translations = require('../../website/src/libs/api-v2/i18n.js').translations;

test_helper = require('./test_helper');

test_helper.addCustomMatchers();

$w = function(s) {
  return s.split(' ');
};


/* Helper Functions */

newUser = function(addTasks) {
  var buffs, user;
  if (addTasks == null) {
    addTasks = true;
  }
  buffs = {
    per: 0,
    int: 0,
    con: 0,
    str: 0,
    stealth: 0,
    streaks: false
  };
  user = {
    auth: {
      timestamps: {}
    },
    stats: {
      str: 1,
      con: 1,
      per: 1,
      int: 1,
      mp: 32,
      "class": 'warrior',
      buffs: buffs
    },
    items: {
      lastDrop: {
        count: 0
      },
      hatchingPotions: {},
      eggs: {},
      food: {},
      gear: {
        equipped: {},
        costume: {},
        owned: {}
      },
      quests: {}
    },
    party: {
      quest: {
        progress: {
          down: 0
        }
      }
    },
    preferences: {
      autoEquip: true
    },
    dailys: [],
    todos: [],
    rewards: [],
    flags: {},
    achievements: {
      ultimateGearSets: {}
    },
    contributor: {
      level: 2
    },
    _tmp: {}
  };
  shared.wrap(user);
  user.ops.reset(null, function() {});
  if (addTasks) {
    _.each(['habit', 'todo', 'daily'], function(task) {
      return user.ops.addTask({
        body: {
          type: task,
          id: shared.uuid()
        }
      });
    });
  }
  return user;
};

rewrapUser = function(user) {
  user._wrapped = false;
  shared.wrap(user);
  return user;
};

expectStrings = function(obj, paths) {
  return _.each(paths, function(path) {
    return expect(obj[path]).to.be.ok();
  });
};

beforeAfter = function(options) {
  var after, before, lastCron, ref, user;
  if (options == null) {
    options = {};
  }
  user = newUser();
  ref = [user, _.cloneDeep(user)], before = ref[0], after = ref[1];
  rewrapUser(after);
  if (options.dayStart) {
    before.preferences.dayStart = after.preferences.dayStart = options.dayStart;
  }
  before.preferences.timezoneOffset = after.preferences.timezoneOffset = options.timezoneOffset || moment().zone();
  if (options.limitOne) {
    before[options.limitOne + "s"] = [before[options.limitOne + "s"][0]];
    after[options.limitOne + "s"] = [after[options.limitOne + "s"][0]];
  }
  if (options.daysAgo) {
    lastCron = moment(options.now || +(new Date)).subtract({
      days: options.daysAgo
    });
  }
  if (options.daysAgo && options.cronAfterStart) {
    lastCron.add({
      hours: options.dayStart,
      minutes: 1
    });
  }
  if (options.daysAgo) {
    lastCron = +lastCron;
  }
  _.each([before, after], function(obj) {
    if (options.daysAgo) {
      return obj.lastCron = lastCron;
    }
  });
  return {
    before: before,
    after: after
  };
};

expectLostPoints = function(before, after, taskType) {
  if (taskType === 'daily' || taskType === 'habit') {
    expect(after.stats.hp).to.be.lessThan(before.stats.hp);
    expect(after[taskType + "s"][0].history).to.have.length(1);
  } else {
    expect(after.history.todos).to.have.length(1);
  }
  expect(after).toHaveExp(0);
  expect(after).toHaveGP(0);
  return expect(after[taskType + "s"][0].value).to.be.lessThan(before[taskType + "s"][0].value);
};

expectGainedPoints = function(before, after, taskType) {
  expect(after.stats.hp).to.be(50);
  expect(after.stats.exp).to.be.greaterThan(before.stats.exp);
  expect(after.stats.gp).to.be.greaterThan(before.stats.gp);
  expect(after[taskType + "s"][0].value).to.be.greaterThan(before[taskType + "s"][0].value);
  if (taskType === 'habit') {
    return expect(after[taskType + "s"][0].history).to.have.length(1);
  }
};

expectNoChange = function(before, after) {
  return _.each($w('stats items gear dailys todos rewards preferences'), function(attr) {
    return expect(after[attr]).to.eql(before[attr]);
  });
};

expectClosePoints = function(before, after, taskType) {
  expect(Math.abs(after.stats.exp - before.stats.exp)).to.be.lessThan(0.0001);
  expect(Math.abs(after.stats.gp - before.stats.gp)).to.be.lessThan(0.0001);
  return expect(Math.abs(after[taskType + "s"][0].value - before[taskType + "s"][0].value)).to.be.lessThan(0.0001);
};

expectDayResetNoDamage = function(b, a) {
  var after, before, ref;
  ref = [_.cloneDeep(b), _.cloneDeep(a)], before = ref[0], after = ref[1];
  _.each(after.dailys, function(task, i) {
    expect(task.completed).to.be(false);
    expect(before.dailys[i].value).to.be(task.value);
    expect(before.dailys[i].streak).to.be(task.streak);
    return expect(task.history).to.have.length(1);
  });
  _.each(after.todos, function(task, i) {
    expect(task.completed).to.be(false);
    return expect(before.todos[i].value).to.be.greaterThan(task.value);
  });
  expect(after.history.todos).to.have.length(1);
  _.each([before, after], function(obj) {
    delete obj.stats.buffs;
    return _.each($w('dailys todos history lastCron'), function(path) {
      return delete obj[path];
    });
  });
  delete after._tmp;
  return expectNoChange(before, after);
};

cycle = function(array) {
  var n;
  n = -1;
  return function(seed) {
    if (seed == null) {
      seed = 0;
    }
    n++;
    return array[n % array.length];
  };
};

repeatWithoutLastWeekday = function() {
  var repeat;
  repeat = {
    su: true,
    m: true,
    t: true,
    w: true,
    th: true,
    f: true,
    s: true
  };
  if (shared.startOfWeek(moment().zone(0)).isoWeekday() === 1) {
    repeat.su = false;
  } else {
    repeat.s = false;
  }
  return {
    repeat: repeat
  };
};

describe('User', function() {
  it('sets correct user defaults', function() {
    var base_gear, buffs, user;
    user = newUser();
    base_gear = {
      armor: 'armor_base_0',
      weapon: 'weapon_base_0',
      head: 'head_base_0',
      shield: 'shield_base_0'
    };
    buffs = {
      per: 0,
      int: 0,
      con: 0,
      str: 0,
      stealth: 0,
      streaks: false
    };
    expect(user.stats).to.eql({
      str: 1,
      con: 1,
      per: 1,
      int: 1,
      hp: 50,
      mp: 32,
      lvl: 1,
      exp: 0,
      gp: 0,
      "class": 'warrior',
      buffs: buffs
    });
    expect(user.items.gear).to.eql({
      equipped: base_gear,
      costume: base_gear,
      owned: {
        weapon_warrior_0: true
      }
    });
    return expect(user.preferences).to.eql({
      autoEquip: true,
      costume: false
    });
  });
  it('calculates max MP', function() {
    var user;
    user = newUser();
    expect(user).toHaveMaxMP(32);
    user.stats.int = 10;
    expect(user).toHaveMaxMP(50);
    user.stats.lvl = 5;
    expect(user).toHaveMaxMP(54);
    user.stats["class"] = 'wizard';
    user.items.gear.equipped.weapon = 'weapon_wizard_1';
    return expect(user).toHaveMaxMP(63);
  });
  it('handles perfect days', function() {
    var cron, user, yesterday;
    user = newUser();
    user.dailys = [];
    _.times(3, function() {
      return user.dailys.push(shared.taskDefaults({
        type: 'daily',
        startDate: moment().subtract(7, 'days')
      }));
    });
    cron = function() {
      user.lastCron = moment().subtract(1, 'days');
      return user.fns.cron();
    };
    cron();
    expect(user.stats.buffs.str).to.be(0);
    expect(user.achievements.perfect).to.not.be.ok();
    user.dailys[0].completed = true;
    cron();
    expect(user.stats.buffs.str).to.be(0);
    expect(user.achievements.perfect).to.not.be.ok();
    _.each(user.dailys, function(d) {
      return d.completed = true;
    });
    cron();
    expect(user.stats.buffs.str).to.be(1);
    expect(user.achievements.perfect).to.be(1);
    yesterday = moment().subtract(1, 'days');
    user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false;
    _.each(user.dailys.slice(1), function(d) {
      return d.completed = true;
    });
    cron();
    expect(user.stats.buffs.str).to.be(1);
    return expect(user.achievements.perfect).to.be(2);
  });
  describe('Resting in the Inn', function() {
    var cron, user;
    user = null;
    cron = null;
    beforeEach(function() {
      user = newUser();
      user.preferences.sleep = true;
      cron = function() {
        user.lastCron = moment().subtract(1, 'days');
        return user.fns.cron();
      };
      user.dailys = [];
      return _.times(2, function() {
        return user.dailys.push(shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(7, 'days')
        }));
      });
    });
    it('remains in the inn on cron', function() {
      cron();
      return expect(user.preferences.sleep).to.be(true);
    });
    it('resets dailies', function() {
      user.dailys[0].completed = true;
      cron();
      return expect(user.dailys[0].completed).to.be(false);
    });
    it('resets checklist on incomplete dailies', function() {
      user.dailys[0].checklist = [
        {
          "text": "1",
          "id": "checklist-one",
          "completed": true
        }, {
          "text": "2",
          "id": "checklist-two",
          "completed": true
        }, {
          "text": "3",
          "id": "checklist-three",
          "completed": false
        }
      ];
      cron();
      return _.each(user.dailys[0].checklist, function(box) {
        return expect(box.completed).to.be(false);
      });
    });
    it('resets checklist on complete dailies', function() {
      user.dailys[0].checklist = [
        {
          "text": "1",
          "id": "checklist-one",
          "completed": true
        }, {
          "text": "2",
          "id": "checklist-two",
          "completed": true
        }, {
          "text": "3",
          "id": "checklist-three",
          "completed": false
        }
      ];
      user.dailys[0].completed = true;
      cron();
      return _.each(user.dailys[0].checklist, function(box) {
        return expect(box.completed).to.be(false);
      });
    });
    it('does not reset checklist on grey incomplete dailies', function() {
      var yesterday;
      yesterday = moment().subtract(1, 'days');
      user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false;
      user.dailys[0].checklist = [
        {
          "text": "1",
          "id": "checklist-one",
          "completed": true
        }, {
          "text": "2",
          "id": "checklist-two",
          "completed": true
        }, {
          "text": "3",
          "id": "checklist-three",
          "completed": true
        }
      ];
      cron();
      return _.each(user.dailys[0].checklist, function(box) {
        return expect(box.completed).to.be(true);
      });
    });
    it('resets checklist on complete grey complete dailies', function() {
      var yesterday;
      yesterday = moment().subtract(1, 'days');
      user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false;
      user.dailys[0].checklist = [
        {
          "text": "1",
          "id": "checklist-one",
          "completed": true
        }, {
          "text": "2",
          "id": "checklist-two",
          "completed": true
        }, {
          "text": "3",
          "id": "checklist-three",
          "completed": true
        }
      ];
      user.dailys[0].completed = true;
      cron();
      return _.each(user.dailys[0].checklist, function(box) {
        return expect(box.completed).to.be(false);
      });
    });
    it('does not damage user for incomplete dailies', function() {
      expect(user).toHaveHP(50);
      user.dailys[0].completed = true;
      user.dailys[1].completed = false;
      cron();
      return expect(user).toHaveHP(50);
    });
    it('gives credit for complete dailies', function() {
      user.dailys[0].completed = true;
      expect(user.dailys[0].history).to.be.empty;
      cron();
      return expect(user.dailys[0].history).to.not.be.empty;
    });
    return it('damages user for incomplete dailies after checkout', function() {
      expect(user).toHaveHP(50);
      user.dailys[0].completed = true;
      user.dailys[1].completed = false;
      user.preferences.sleep = false;
      cron();
      return expect(user.stats.hp).to.be.lessThan(50);
    });
  });
  describe('Death', function() {
    var user;
    user = void 0;
    it('revives correctly', function() {
      user = newUser();
      user.stats = {
        gp: 10,
        exp: 100,
        lvl: 2,
        hp: 0,
        "class": 'warrior'
      };
      user.ops.revive();
      expect(user).toHaveGP(0);
      expect(user).toHaveExp(0);
      expect(user).toHaveLevel(1);
      expect(user).toHaveHP(50);
      return expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: false
      });
    });
    it("doesn't break unbreakables", function() {
      var ce;
      ce = shared.countExists;
      user = newUser();
      user.items.gear.owned['shield_warrior_1'] = true;
      user.items.gear.owned['shield_rogue_1'] = true;
      user.items.gear.owned['head_special_nye'] = true;
      expect(ce(user.items.gear.owned)).to.be(4);
      user.stats.hp = 0;
      user.ops.revive();
      expect(ce(user.items.gear.owned)).to.be(3);
      user.stats.hp = 0;
      user.ops.revive();
      expect(ce(user.items.gear.owned)).to.be(2);
      user.stats.hp = 0;
      user.ops.revive();
      expect(ce(user.items.gear.owned)).to.be(2);
      return expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: false,
        shield_warrior_1: false,
        shield_rogue_1: true,
        head_special_nye: true
      });
    });
    return it("handles event items", function() {
      shared.content.gear.flat.head_special_nye.event.start = '2012-01-01';
      shared.content.gear.flat.head_special_nye.event.end = '2012-02-01';
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(true);
      delete user.items.gear.owned['head_special_nye'];
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(false);
      shared.content.gear.flat.head_special_nye.event.start = moment().subtract(5, 'days');
      shared.content.gear.flat.head_special_nye.event.end = moment().add(5, 'days');
      return expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(true);
    });
  });
  describe('Rebirth', function() {
    var user;
    user = void 0;
    return it('removes correct gear', function() {
      user = newUser();
      user.stats.lvl = 100;
      user.items.gear.owned = {
        "weapon_warrior_0": true,
        "weapon_warrior_1": true,
        "armor_warrior_1": false,
        "armor_mystery_201402": true,
        "back_mystery_201402": false,
        "head_mystery_201402": true,
        "weapon_armoire_basicCrossbow": true
      };
      user.ops.rebirth();
      return expect(user.items.gear.owned).to.eql({
        "weapon_warrior_0": true,
        "weapon_warrior_1": false,
        "armor_warrior_1": false,
        "armor_mystery_201402": true,
        "back_mystery_201402": false,
        "head_mystery_201402": true,
        "weapon_armoire_basicCrossbow": false
      });
    });
  });
  describe('store', function() {
    it('buys a Quest scroll', function() {
      var user;
      user = newUser();
      user.stats.gp = 205;
      user.ops.buyQuest({
        params: {
          key: 'dilatoryDistress1'
        }
      });
      expect(user.items.quests).to.eql({
        dilatoryDistress1: 1
      });
      return expect(user).toHaveGP(5);
    });
    it('does not buy Quests without enough Gold', function() {
      var user;
      user = newUser();
      user.stats.gp = 1;
      user.ops.buyQuest({
        params: {
          key: 'dilatoryDistress1'
        }
      });
      expect(user.items.quests).to.eql({});
      return expect(user).toHaveGP(1);
    });
    it('does not buy nonexistent Quests', function() {
      var user;
      user = newUser();
      user.stats.gp = 9999;
      user.ops.buyQuest({
        params: {
          key: 'snarfblatter'
        }
      });
      expect(user.items.quests).to.eql({});
      return expect(user).toHaveGP(9999);
    });
    return it('does not buy Gem-premium Quests', function() {
      var user;
      user = newUser();
      user.stats.gp = 9999;
      user.ops.buyQuest({
        params: {
          key: 'kraken'
        }
      });
      expect(user.items.quests).to.eql({});
      return expect(user).toHaveGP(9999);
    });
  });
  describe('Gem purchases', function() {
    it('does not purchase items without enough Gems', function() {
      var user;
      user = newUser();
      user.ops.purchase({
        params: {
          type: 'eggs',
          key: 'Cactus'
        }
      });
      user.ops.purchase({
        params: {
          type: 'gear',
          key: 'headAccessory_special_foxEars'
        }
      });
      user.ops.unlock({
        query: {
          path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars'
        }
      });
      expect(user.items.eggs).to.eql({});
      return expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true
      });
    });
    it('purchases an egg', function() {
      var user;
      user = newUser();
      user.balance = 1;
      user.ops.purchase({
        params: {
          type: 'eggs',
          key: 'Cactus'
        }
      });
      expect(user.items.eggs).to.eql({
        Cactus: 1
      });
      return expect(user.balance).to.eql(0.25);
    });
    it('purchases fox ears', function() {
      var user;
      user = newUser();
      user.balance = 1;
      user.ops.purchase({
        params: {
          type: 'gear',
          key: 'headAccessory_special_foxEars'
        }
      });
      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        headAccessory_special_foxEars: true
      });
      return expect(user.balance).to.eql(0.5);
    });
    return it('unlocks all the animal ears at once', function() {
      var user;
      user = newUser();
      user.balance = 2;
      user.ops.unlock({
        query: {
          path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars'
        }
      });
      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        headAccessory_special_bearEars: true,
        headAccessory_special_cactusEars: true,
        headAccessory_special_foxEars: true,
        headAccessory_special_lionEars: true,
        headAccessory_special_pandaEars: true,
        headAccessory_special_pigEars: true,
        headAccessory_special_tigerEars: true,
        headAccessory_special_wolfEars: true
      });
      return expect(user.balance).to.eql(0.75);
    });
  });
  describe('spells', function() {
    return _.each(shared.content.spells, function(spellClass) {
      return _.each(spellClass, function(spell) {
        return it(spell.text + " has valid values", function() {
          expect(spell.target).to.match(/^(task|self|party|user)$/);
          expect(spell.mana).to.be.an('number');
          if (spell.lvl) {
            expect(spell.lvl).to.be.an('number');
            expect(spell.lvl).to.be.above(0);
          }
          return expect(spell.cast).to.be.a('function');
        });
      });
    });
  });
  describe('drop system', function() {
    var MAX_RANGE_FOR_EGG, MAX_RANGE_FOR_FOOD, MAX_RANGE_FOR_POTION, MIN_RANGE_FOR_EGG, MIN_RANGE_FOR_FOOD, MIN_RANGE_FOR_POTION, user;
    user = null;
    MIN_RANGE_FOR_POTION = 0;
    MAX_RANGE_FOR_POTION = .3;
    MIN_RANGE_FOR_EGG = .4;
    MAX_RANGE_FOR_EGG = .6;
    MIN_RANGE_FOR_FOOD = .7;
    MAX_RANGE_FOR_FOOD = 1;
    beforeEach(function() {
      user = newUser();
      user.flags.dropsEnabled = true;
      this.task_id = shared.uuid();
      return user.ops.addTask({
        body: {
          type: 'daily',
          id: this.task_id
        }
      });
    });
    it('drops a hatching potion', function() {
      var j, random, ref, ref1, results;
      results = [];
      for (random = j = ref = MIN_RANGE_FOR_POTION, ref1 = MAX_RANGE_FOR_POTION; j <= ref1; random = j += .1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);
        user.ops.score({
          params: {
            id: this.task_id,
            direction: 'up'
          }
        });
        expect(user.items.eggs).to.be.empty;
        expect(user.items.hatchingPotions).to.not.be.empty;
        expect(user.items.food).to.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });
    it('drops a pet egg', function() {
      var j, random, ref, ref1, results;
      results = [];
      for (random = j = ref = MIN_RANGE_FOR_EGG, ref1 = MAX_RANGE_FOR_EGG; j <= ref1; random = j += .1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);
        user.ops.score({
          params: {
            id: this.task_id,
            direction: 'up'
          }
        });
        expect(user.items.eggs).to.not.be.empty;
        expect(user.items.hatchingPotions).to.be.empty;
        expect(user.items.food).to.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });
    it('drops food', function() {
      var j, random, ref, ref1, results;
      results = [];
      for (random = j = ref = MIN_RANGE_FOR_FOOD, ref1 = MAX_RANGE_FOR_FOOD; j <= ref1; random = j += .1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);
        user.ops.score({
          params: {
            id: this.task_id,
            direction: 'up'
          }
        });
        expect(user.items.eggs).to.be.empty;
        expect(user.items.hatchingPotions).to.be.empty;
        expect(user.items.food).to.not.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });
    return it('does not get a drop', function() {
      sinon.stub(user.fns, 'predictableRandom').returns(0.5);
      user.ops.score({
        params: {
          id: this.task_id,
          direction: 'up'
        }
      });
      expect(user.items.eggs).to.eql({});
      expect(user.items.hatchingPotions).to.eql({});
      expect(user.items.food).to.eql({});
      return user.fns.predictableRandom.restore();
    });
  });
  describe('Quests', function() {
    return _.each(shared.content.quests, function(quest) {
      return it((quest.text()) + " has valid values", function() {
        expect(quest.notes()).to.be.an('string');
        if (quest.completion) {
          expect(quest.completion()).to.be.an('string');
        }
        if (quest.previous) {
          expect(quest.previous).to.be.an('string');
        }
        if (quest.canBuy()) {
          expect(quest.value).to.be.greaterThan(0);
        }
        expect(quest.drop.gp).to.not.be.lessThan(0);
        expect(quest.drop.exp).to.not.be.lessThan(0);
        expect(quest.category).to.match(/pet|unlockable|gold|world/);
        if (quest.drop.items) {
          expect(quest.drop.items).to.be.an(Array);
        }
        if (quest.boss) {
          expect(quest.boss.name()).to.be.an('string');
          expect(quest.boss.hp).to.be.greaterThan(0);
          return expect(quest.boss.str).to.be.greaterThan(0);
        } else if (quest.collect) {
          return _.each(quest.collect, function(collect) {
            expect(collect.text()).to.be.an('string');
            return expect(collect.count).to.be.greaterThan(0);
          });
        }
      });
    });
  });
  describe('Achievements', function() {
    _.each(shared.content.classes, function(klass) {
      var user;
      user = newUser();
      user.stats.gp = 10000;
      _.each(shared.content.gearTypes, function(type) {
        return _.each([1, 2, 3, 4, 5], function(i) {
          return user.ops.buy({
            params: '#{type}_#{klass}_#{i}'
          });
        });
      });
      it('does not get ultimateGear ' + klass, function() {
        return expect(user.achievements.ultimateGearSets[klass]).to.not.be.ok();
      });
      _.each(shared.content.gearTypes, function(type) {
        return user.ops.buy({
          params: '#{type}_#{klass}_6'
        });
      });
      return xit('gets ultimateGear ' + klass, function() {
        return expect(user.achievements.ultimateGearSets[klass]).to.be.ok();
      });
    });
    return it('does not remove existing Ultimate Gear achievements', function() {
      var user;
      user = newUser();
      user.achievements.ultimateGearSets = {
        'healer': true,
        'wizard': true,
        'rogue': true,
        'warrior': true
      };
      user.items.gear.owned.shield_warrior_5 = false;
      user.items.gear.owned.weapon_rogue_6 = false;
      user.ops.buy({
        params: 'shield_warrior_5'
      });
      return expect(user.achievements.ultimateGearSets).to.eql({
        'healer': true,
        'wizard': true,
        'rogue': true,
        'warrior': true
      });
    });
  });
  return describe('unlocking features', function() {
    it('unlocks drops at level 3', function() {
      var user;
      user = newUser();
      user.stats.lvl = 3;
      user.fns.updateStats(user.stats);
      return expect(user.flags.dropsEnabled).to.be.ok();
    });
    it('unlocks Rebirth at level 50', function() {
      var user;
      user = newUser();
      user.stats.lvl = 50;
      user.fns.updateStats(user.stats);
      return expect(user.flags.rebirthEnabled).to.be.ok();
    });
    return describe('level-awarded Quests', function() {
      it('gets Attack of the Mundane at level 15', function() {
        var user;
        user = newUser();
        user.stats.lvl = 15;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.atom1).to.be.ok();
        return expect(user.items.quests.atom1).to.eql(1);
      });
      it('gets Vice at level 30', function() {
        var user;
        user = newUser();
        user.stats.lvl = 30;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.vice1).to.be.ok();
        return expect(user.items.quests.vice1).to.eql(1);
      });
      it('gets Golden Knight at level 40', function() {
        var user;
        user = newUser();
        user.stats.lvl = 40;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.goldenknight1).to.be.ok();
        return expect(user.items.quests.goldenknight1).to.eql(1);
      });
      return it('gets Moonstone Chain at level 60', function() {
        var user;
        user = newUser();
        user.stats.lvl = 60;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.moonstone1).to.be.ok();
        return expect(user.items.quests.moonstone1).to.eql(1);
      });
    });
  });
});

describe('Simple Scoring', function() {
  beforeEach(function() {
    var ref;
    return ref = beforeAfter(), this.before = ref.before, this.after = ref.after, ref;
  });
  it('Habits : Up', function() {
    this.after.ops.score({
      params: {
        id: this.after.habits[0].id,
        direction: 'down'
      },
      query: {
        times: 5
      }
    });
    return expectLostPoints(this.before, this.after, 'habit');
  });
  it('Habits : Down', function() {
    this.after.ops.score({
      params: {
        id: this.after.habits[0].id,
        direction: 'up'
      },
      query: {
        times: 5
      }
    });
    return expectGainedPoints(this.before, this.after, 'habit');
  });
  it('Dailys : Up', function() {
    this.after.ops.score({
      params: {
        id: this.after.dailys[0].id,
        direction: 'up'
      }
    });
    return expectGainedPoints(this.before, this.after, 'daily');
  });
  it('Dailys : Up, Down', function() {
    this.after.ops.score({
      params: {
        id: this.after.dailys[0].id,
        direction: 'up'
      }
    });
    this.after.ops.score({
      params: {
        id: this.after.dailys[0].id,
        direction: 'down'
      }
    });
    return expectClosePoints(this.before, this.after, 'daily');
  });
  it('Todos : Up', function() {
    this.after.ops.score({
      params: {
        id: this.after.todos[0].id,
        direction: 'up'
      }
    });
    return expectGainedPoints(this.before, this.after, 'todo');
  });
  return it('Todos : Up, Down', function() {
    this.after.ops.score({
      params: {
        id: this.after.todos[0].id,
        direction: 'up'
      }
    });
    this.after.ops.score({
      params: {
        id: this.after.todos[0].id,
        direction: 'down'
      }
    });
    return expectClosePoints(this.before, this.after, 'todo');
  });
});

describe('Cron', function() {
  it('computes shouldCron', function() {
    var paths, user;
    user = newUser();
    paths = {};
    user.fns.cron({
      paths: paths
    });
    expect(user.lastCron).to.not.be.ok;
    user.lastCron = +moment().subtract(1, 'days');
    paths = {};
    user.fns.cron({
      paths: paths
    });
    return expect(user.lastCron).to.be.greaterThan(0);
  });
  it('only dailies & todos are affected', function() {
    var after, afterTasks, before, beforeTasks, ref;
    ref = beforeAfter({
      daysAgo: 1
    }), before = ref.before, after = ref.after;
    before.dailys = before.todos = after.dailys = after.todos = [];
    after.fns.cron();
    before.stats.mp = after.stats.mp;
    expect(after.lastCron).to.not.be(before.lastCron);
    delete after.stats.buffs;
    delete before.stats.buffs;
    expect(before.stats).to.eql(after.stats);
    beforeTasks = before.habits.concat(before.dailys).concat(before.todos).concat(before.rewards);
    afterTasks = after.habits.concat(after.dailys).concat(after.todos).concat(after.rewards);
    return expect(beforeTasks).to.eql(afterTasks);
  });
  describe('preening', function() {
    beforeEach(function() {
      return this.clock = sinon.useFakeTimers(Date.parse("2013-11-20"), "Date");
    });
    afterEach(function() {
      return this.clock.restore();
    });
    return it('should preen user history', function() {
      var after, before, history, ref;
      ref = beforeAfter({
        daysAgo: 1
      }), before = ref.before, after = ref.after;
      history = [
        {
          date: '09/01/2012',
          value: 0
        }, {
          date: '10/01/2012',
          value: 0
        }, {
          date: '11/01/2012',
          value: 2
        }, {
          date: '12/01/2012',
          value: 2
        }, {
          date: '01/01/2013',
          value: 1
        }, {
          date: '01/15/2013',
          value: 3
        }, {
          date: '02/01/2013',
          value: 2
        }, {
          date: '02/15/2013',
          value: 4
        }, {
          date: '03/01/2013',
          value: 3
        }, {
          date: '03/15/2013',
          value: 5
        }, {
          date: '04/01/2013',
          value: 4
        }, {
          date: '04/15/2013',
          value: 6
        }, {
          date: '05/01/2013',
          value: 5
        }, {
          date: '05/15/2013',
          value: 7
        }, {
          date: '06/01/2013',
          value: 6
        }, {
          date: '06/15/2013',
          value: 8
        }, {
          date: '07/01/2013',
          value: 7
        }, {
          date: '07/15/2013',
          value: 9
        }, {
          date: '08/01/2013',
          value: 8
        }, {
          date: '08/15/2013',
          value: 10
        }, {
          date: '09/01/2013',
          value: 9
        }, {
          date: '09/15/2013',
          value: 11
        }, {
          date: '010/01/2013',
          value: 10
        }, {
          date: '010/15/2013',
          value: 12
        }, {
          date: '011/01/2013',
          value: 12
        }, {
          date: '011/02/2013',
          value: 13
        }, {
          date: '011/03/2013',
          value: 14
        }, {
          date: '011/04/2013',
          value: 15
        }
      ];
      after.history = {
        exp: _.cloneDeep(history),
        todos: _.cloneDeep(history)
      };
      after.habits[0].history = _.cloneDeep(history);
      after.fns.cron();
      after.history.exp.pop();
      after.history.todos.pop();
      return _.each([after.history.exp, after.history.todos, after.habits[0].history], function(arr) {
        return expect(_.map(arr, function(x) {
          return x.value;
        })).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      });
    });
  });
  describe('Todos', function() {
    it('1 day missed', function() {
      var after, before, ref;
      ref = beforeAfter({
        daysAgo: 1
      }), before = ref.before, after = ref.after;
      before.dailys = after.dailys = [];
      after.fns.cron();
      expect(after).toHaveHP(50);
      expect(after).toHaveExp(0);
      expect(after).toHaveGP(0);
      expect(before.todos[0].value).to.be(0);
      expect(after.todos[0].value).to.be(-1);
      return expect(after.history.todos).to.have.length(1);
    });
    return it('2 days missed', function() {
      var after, before, ref;
      ref = beforeAfter({
        daysAgo: 2
      }), before = ref.before, after = ref.after;
      before.dailys = after.dailys = [];
      after.fns.cron();
      expect(before.todos[0].value).to.be(0);
      return expect(after.todos[0].value).to.be(-1);
    });
  });
  describe('cron day calculations', function() {
    var dayStart, fstr;
    dayStart = 4;
    fstr = "YYYY-MM-DD HH:mm:ss";
    it('startOfDay before dayStart', function() {
      var start;
      start = shared.startOfDay({
        now: moment('2014-10-09 02:30:00'),
        dayStart: dayStart
      });
      return expect(start.format(fstr)).to.eql('2014-10-08 04:00:00');
    });
    it('startOfDay after dayStart', function() {
      var start;
      start = shared.startOfDay({
        now: moment('2014-10-09 05:30:00'),
        dayStart: dayStart
      });
      return expect(start.format(fstr)).to.eql('2014-10-09 04:00:00');
    });
    it('daysSince cron before, now after', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 02:30:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-09 11:30:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(1);
    });
    it('daysSince cron before, now before', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 02:30:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-09 03:30:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(0);
    });
    it('daysSince cron after, now after', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 05:30:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-09 06:30:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(0);
    });
    it('daysSince cron after, now tomorrow before', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 12:30:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-10 01:30:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(0);
    });
    it('daysSince cron after, now tomorrow after', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 12:30:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-10 10:30:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(1);
    });
    return xit('daysSince, last cron before new dayStart', function() {
      var days, lastCron;
      lastCron = moment('2014-10-09 01:00:00');
      days = shared.daysSince(lastCron, {
        now: moment('2014-10-09 05:00:00'),
        dayStart: dayStart
      });
      return expect(days).to.eql(0);
    });
  });
  return describe('dailies', function() {
    return describe('new day', function() {

      /*
      This section runs through a "cron matrix" of all permutations (that I can easily account for). It sets
      task due days, user custom day start, timezoneOffset, etc - then runs cron, jumps to tomorrow and runs cron,
      and so on - testing each possible outcome along the way
       */
      var cronMatrix, recurseCronMatrix, runCron;
      runCron = function(options) {
        return _.each([480, 240, 0, -120], function(timezoneOffset) {
          var after, before, now, ref;
          now = shared.startOfWeek({
            timezoneOffset: timezoneOffset
          }).add(options.currentHour || 0, 'hours');
          ref = beforeAfter({
            now: now,
            timezoneOffset: timezoneOffset,
            daysAgo: 1,
            cronAfterStart: options.cronAfterStart || true,
            dayStart: options.dayStart || 0,
            limitOne: 'daily'
          }), before = ref.before, after = ref.after;
          if (options.repeat) {
            before.dailys[0].repeat = after.dailys[0].repeat = options.repeat;
          }
          before.dailys[0].streak = after.dailys[0].streak = 10;
          if (options.checked) {
            before.dailys[0].completed = after.dailys[0].completed = true;
          }
          before.dailys[0].startDate = after.dailys[0].startDate = moment().subtract(30, 'days');
          if (options.shouldDo) {
            expect(shared.shouldDo(now.toDate(), after.dailys[0], {
              timezoneOffset: timezoneOffset,
              dayStart: options.dayStart,
              now: now
            })).to.be.ok();
          }
          after.fns.cron({
            now: now
          });
          before.stats.mp = after.stats.mp;
          switch (options.expect) {
            case 'losePoints':
              expectLostPoints(before, after, 'daily');
              break;
            case 'noChange':
              expectNoChange(before, after);
              break;
            case 'noDamage':
              expectDayResetNoDamage(before, after);
          }
          return {
            before: before,
            after: after
          };
        });
      };
      cronMatrix = {
        steps: {
          'due yesterday': {
            defaults: {
              daysAgo: 1,
              cronAfterStart: true,
              limitOne: 'daily'
            },
            steps: {
              '(simple)': {
                expect: 'losePoints'
              },
              'due today': {
                defaults: {
                  repeat: {
                    su: true,
                    m: true,
                    t: true,
                    w: true,
                    th: true,
                    f: true,
                    s: true
                  }
                },
                steps: {
                  'pre-dayStart': {
                    defaults: {
                      currentHour: 3,
                      dayStart: 4,
                      shouldDo: true
                    },
                    steps: {
                      'checked': {
                        checked: true,
                        expect: 'noChange'
                      },
                      'un-checked': {
                        checked: false,
                        expect: 'noChange'
                      }
                    }
                  },
                  'post-dayStart': {
                    defaults: {
                      currentHour: 5,
                      dayStart: 4,
                      shouldDo: true
                    },
                    steps: {
                      'checked': {
                        checked: true,
                        expect: 'noDamage'
                      },
                      'unchecked': {
                        checked: false,
                        expect: 'losePoints'
                      }
                    }
                  }
                }
              },
              'NOT due today': {
                defaults: {
                  repeat: {
                    su: true,
                    m: false,
                    t: true,
                    w: true,
                    th: true,
                    f: true,
                    s: true
                  }
                },
                steps: {
                  'pre-dayStart': {
                    defaults: {
                      currentHour: 3,
                      dayStart: 4,
                      shouldDo: true
                    },
                    steps: {
                      'checked': {
                        checked: true,
                        expect: 'noChange'
                      },
                      'un-checked': {
                        checked: false,
                        expect: 'noChange'
                      }
                    }
                  },
                  'post-dayStart': {
                    defaults: {
                      currentHour: 5,
                      dayStart: 4,
                      shouldDo: false
                    },
                    steps: {
                      'checked': {
                        checked: true,
                        expect: 'noDamage'
                      },
                      'unchecked': {
                        checked: false,
                        expect: 'losePoints'
                      }
                    }
                  }
                }
              }
            }
          },
          'not due yesterday': {
            defaults: repeatWithoutLastWeekday(),
            steps: {
              '(simple)': {
                expect: 'noDamage'
              },
              'post-dayStart': {
                currentHour: 5,
                dayStart: 4,
                expect: 'noDamage'
              },
              'pre-dayStart': {
                currentHour: 3,
                dayStart: 4,
                expect: 'noChange'
              }
            }
          }
        }
      };
      recurseCronMatrix = function(obj, options) {
        if (options == null) {
          options = {};
        }
        if (obj.steps) {
          return _.each(obj.steps, function(step, text) {
            var o;
            o = _.cloneDeep(options);
            if (o.text == null) {
              o.text = '';
            }
            o.text += " " + text + " ";
            return recurseCronMatrix(step, _.defaults(o, obj.defaults));
          });
        } else {
          return it("" + options.text, function() {
            return runCron(_.defaults(obj, options));
          });
        }
      };
      return recurseCronMatrix(cronMatrix);
    });
  });
});

describe('Helper', function() {
  it('calculates gold coins', function() {
    expect(shared.gold(10)).to.eql(10);
    expect(shared.gold(1.957)).to.eql(1);
    return expect(shared.gold()).to.eql(0);
  });
  it('calculates silver coins', function() {
    expect(shared.silver(10)).to.eql(0);
    expect(shared.silver(1.957)).to.eql(95);
    expect(shared.silver(0.01)).to.eql("01");
    return expect(shared.silver()).to.eql("00");
  });
  it('calculates experience to next level', function() {
    expect(shared.tnl(1)).to.eql(150);
    expect(shared.tnl(2)).to.eql(160);
    expect(shared.tnl(10)).to.eql(260);
    return expect(shared.tnl(99)).to.eql(3580);
  });
  return it('calculates the start of the day', function() {
    var fstr, today, zone;
    fstr = 'YYYY-MM-DD HH:mm:ss';
    today = '2013-01-01 00:00:00';
    zone = moment(today).zone();
    expect(shared.startOfDay({
      now: new Date(2013, 0, 1, 0)
    }, {
      timezoneOffset: zone
    }).format(fstr)).to.eql(today);
    expect(shared.startOfDay({
      now: new Date(2013, 0, 1, 5)
    }, {
      timezoneOffset: zone
    }).format(fstr)).to.eql(today);
    return expect(shared.startOfDay({
      now: new Date(2013, 0, 1, 23, 59, 59),
      timezoneOffset: zone
    }).format(fstr)).to.eql(today);
  });
});
