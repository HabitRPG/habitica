/* eslint-disable camelcase, func-names, no-shadow */

import {
  generateUser,
  generateDaily,
  generateHabit,
  generateTodo,
} from '../helpers/common.helper';

import {
  DAY_MAPPING,
  startOfWeek,
  startOfDay,
  daysSince,
} from '../../common/script/cron';
import scoreTask from '../../common/script/api-v3/scoreTask';

let expect = require('expect.js');
let sinon = require('sinon');
let moment = require('moment');
let test_helper = require('./test_helper');
let shared = require('../../common/script/index');
let $w = (s) => {
  return s.split(' ');
};

shared.i18n.translations = require('../../website/src/libs/api-v2/i18n').translations;
test_helper.addCustomMatchers();

/* Helper Functions */
let rewrapUser = (user) => {
  user._wrapped = false;
  shared.wrap(user);
  return user;
};

let beforeAfter = (options = {}) => {
  let lastCron;
  let user = generateUser();
  let daily = generateDaily();
  let habit = generateHabit();
  let todo = generateTodo();

  user.dailys.push(daily);
  user.habits.push(habit);
  user.todos.push(todo);

  let ref = [user, _.cloneDeep(user)];
  let before = ref[0];
  let after = ref[1];

  rewrapUser(after);
  if (options.dayStart) {
    before.preferences.dayStart = after.preferences.dayStart = options.dayStart;
  }
  before.preferences.timezoneOffset = after.preferences.timezoneOffset = options.timezoneOffset || moment().zone();
  before.preferences.timezoneOffsetAtLastCron = after.preferences.timezoneOffsetAtLastCron = before.preferences.timezoneOffset;
  if (options.limitOne) {
    before[`${options.limitOne}s`] = [before[`${options.limitOne}s`][0]];
    after[`${options.limitOne}s`] = [after[`${options.limitOne}s`][0]];
  }
  if (options.daysAgo) {
    lastCron = moment(options.now || Number(new Date())).subtract({
      days: options.daysAgo,
    });
  }
  if (options.daysAgo && options.cronAfterStart) {
    lastCron.add({
      hours: options.dayStart,
      minutes: 1,
    });
  }
  if (options.daysAgo) {
    lastCron = Number(lastCron);
  }
  _.each([before, after], (obj) => {
    if (options.daysAgo) {
      obj.lastCron = lastCron;
    }
  });
  return {
    before,
    after,
  };
};

let expectLostPoints = (before, after, taskType) => {
  if (taskType === 'daily' || taskType === 'habit') {
    expect(after.stats.hp).to.be.lessThan(before.stats.hp);
    expect(after[`${taskType}s`][0].history).to.have.length(1);
  } else {
    expect(after.history.todos).to.have.length(1);
  }
  expect(after).toHaveExp(0);
  expect(after).toHaveGP(0);
  expect(after[`${taskType}s`][0].value).to.be.lessThan(before[`${taskType}s`][0].value);
};

let expectGainedPoints = (before, after, taskType) => {
  expect(after.stats.hp).to.be(50);
  expect(after.stats.exp).to.be.greaterThan(before.stats.exp);
  expect(after.stats.gp).to.be.greaterThan(before.stats.gp);
  expect(after[`${taskType}s`][0].value).to.be.greaterThan(before[`${taskType}s`][0].value);
  if (taskType === 'habit') {
    expect(after[`${taskType}s`][0].history).to.have.length(1);
  }
};

let expectNoChange = (before, after) => {
  _.each($w('stats items gear dailys todos rewards preferences'), (attr) => {
    expect(after[attr]).to.eql(before[attr]);
  });
};

let expectClosePoints = (before, after, taskType) => {
  expect(Math.abs(after.stats.exp - before.stats.exp)).to.be.lessThan(0.0001);
  expect(Math.abs(after.stats.gp - before.stats.gp)).to.be.lessThan(0.0001);
  expect(Math.abs(after[taskType + 's'][0].value - before[taskType + 's'][0].value)).to.be.lessThan(0.0001); // eslint-disable-line prefer-template
};

let expectDayResetNoDamage = (b, a) => {
  let ref = [_.cloneDeep(b), _.cloneDeep(a)];
  let before = ref[0];
  let after = ref[1];

  _.each(after.dailys, (task, i) => {
    expect(task.completed).to.be(false);
    expect(before.dailys[i].value).to.be(task.value);
    expect(before.dailys[i].streak).to.be(task.streak);
    expect(task.history).to.have.length(1);
  });
  _.each(after.todos, (task, i) => {
    expect(task.completed).to.be(false);
    expect(before.todos[i].value).to.be.greaterThan(task.value);
  });
  expect(after.history.todos).to.have.length(1);
  _.each([before, after], (obj) => {
    delete obj.stats.buffs;
    _.each($w('dailys todos history lastCron'), (path) => {
      return delete obj[path];
    });
  });
  delete after._tmp;
  expectNoChange(before, after);
};

let repeatWithoutLastWeekday = () => {
  let repeat = {
    su: true,
    m: true,
    t: true,
    w: true,
    th: true,
    f: true,
    s: true,
  };

  if (startOfWeek(moment().zone(0)).isoWeekday() === 1) {
    repeat.su = false;
  } else {
    repeat.s = false;
  }
  return {
    repeat,
  };
};

describe('User', () => {
  it('calculates max MP', () => {
    let user = generateUser();

    expect(user).toHaveMaxMP(30);
    user.stats.int = 10;
    expect(user).toHaveMaxMP(50);
    user.stats.lvl = 5;
    expect(user).toHaveMaxMP(54);
    user.stats.class = 'wizard';
    user.items.gear.equipped.weapon = 'weapon_wizard_1';
    expect(user).toHaveMaxMP(63);
  });

  it('handles perfect days', () => {
    let user = generateUser();

    user.dailys = [];
    _.times(3, () => {
      return user.dailys.push(shared.taskDefaults({
        type: 'daily',
        startDate: moment().subtract(7, 'days'),
      }));
    });
    let cron = () => {
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
    _.each(user.dailys, (d) => {
      d.completed = true;
    });
    cron();
    expect(user.stats.buffs.str).to.be(1);
    expect(user.achievements.perfect).to.be(1);

    let yesterday = moment().subtract(1, 'days');

    user.dailys[0].repeat[DAY_MAPPING[yesterday.day()]] = false;
    _.each(user.dailys.slice(1), (d) => {
      d.completed = true;
    });
    cron();
    expect(user.stats.buffs.str).to.be(1);
    expect(user.achievements.perfect).to.be(2);
  });

  describe('Resting in the Inn', () => {
    let user = null;
    let cron = null;

    beforeEach(() => {
      user = generateUser();
      user.preferences.sleep = true;
      cron = () => {
        user.lastCron = moment().subtract(1, 'days');
        return user.fns.cron();
      };
      user.dailys = [];
      _.times(2, () => {
        return user.dailys.push(shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(7, 'days'),
        }));
      });
    });

    it('remains in the inn on cron', () => {
      cron();
      expect(user.preferences.sleep).to.be(true);
    });

    it('resets dailies', () => {
      user.dailys[0].completed = true;
      cron();
      expect(user.dailys[0].completed).to.be(false);
    });

    it('resets checklist on incomplete dailies', () => {
      user.dailys[0].checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];
      cron();
      _.each(user.dailys[0].checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('resets checklist on complete dailies', () => {
      user.dailys[0].checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];
      user.dailys[0].completed = true;
      cron();
      _.each(user.dailys[0].checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('does not reset checklist on grey incomplete dailies', () => {
      let yesterday = moment().subtract(1, 'days');

      user.dailys[0].repeat[DAY_MAPPING[yesterday.day()]] = false;
      user.dailys[0].checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: true,
        },
      ];
      cron();
      _.each(user.dailys[0].checklist, (box) => {
        expect(box.completed).to.be(true);
      });
    });

    it('resets checklist on complete grey complete dailies', () => {
      let yesterday = moment().subtract(1, 'days');

      user.dailys[0].repeat[DAY_MAPPING[yesterday.day()]] = false;
      user.dailys[0].checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: true,
        },
      ];
      user.dailys[0].completed = true;
      cron();
      _.each(user.dailys[0].checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('does not damage user for incomplete dailies', () => {
      expect(user).toHaveHP(50);
      user.dailys[0].completed = true;
      user.dailys[1].completed = false;
      cron();
      expect(user).toHaveHP(50);
    });

    it('gives credit for complete dailies', () => {
      user.dailys[0].completed = true;
      expect(user.dailys[0].history).to.be.empty;
      cron();
      expect(user.dailys[0].history).to.not.be.empty;
    });

    it('damages user for incomplete dailies after checkout', () => {
      expect(user).toHaveHP(50);
      user.dailys[0].completed = true;
      user.dailys[1].completed = false;
      user.preferences.sleep = false;
      cron();
      expect(user.stats.hp).to.be.lessThan(50);
    });
  });

  describe('Death', () => {
    let user;

    beforeEach(() => {
      user = generateUser();
    });

    it('revives correctly', () => {
      user.stats = {
        gp: 10,
        exp: 100,
        lvl: 2,
        hp: 0,
        class: 'warrior',
      };
      user.items.gear.owned.weapon_warrior_0 = true;
      user.ops.revive();

      expect(user).toHaveGP(0);
      expect(user).toHaveExp(0);
      expect(user).toHaveLevel(1);
      expect(user).toHaveHP(50);
      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: false,
        eyewear_special_blackTopFrame: true,
        eyewear_special_blueTopFrame: true,
        eyewear_special_greenTopFrame: true,
        eyewear_special_pinkTopFrame: true,
        eyewear_special_redTopFrame: true,
        eyewear_special_yellowTopFrame: true,
        eyewear_special_whiteTopFrame: true,
      });
    });

    it('doesn\'t break unbreakables', () => {
      let ce = shared.countExists;

      user.items.gear.owned = {
        weapon_warrior_0: true,
        shield_warrior_1: true,
        shield_rogue_1: true,
        head_special_nye: true,
      };

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
      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: false,
        shield_warrior_1: false,
        shield_rogue_1: true,
        head_special_nye: true,
      });
    });

    it('handles event items', () => {
      user.items.gear.owned.head_special_nye = true;

      shared.content.gear.flat.head_special_nye.event.start = '2012-01-01';
      shared.content.gear.flat.head_special_nye.event.end = '2012-02-01';
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(true);
      delete user.items.gear.owned.head_special_nye;
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(false);
      shared.content.gear.flat.head_special_nye.event.start = moment().subtract(5, 'days');
      shared.content.gear.flat.head_special_nye.event.end = moment().add(5, 'days');
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be(true);
    });
  });

  describe('Rebirth', () => {
    it('removes correct gear', () => {
      let user = generateUser();

      user.stats.lvl = 100;
      user.items.gear.owned = {
        weapon_warrior_0: true,
        weapon_warrior_1: true,
        armor_warrior_1: false,
        armor_mystery_201402: true,
        back_mystery_201402: false,
        head_mystery_201402: true,
        weapon_armoire_basicCrossbow: true,
      };
      user.ops.rebirth();
      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        weapon_warrior_1: false,
        armor_warrior_1: false,
        armor_mystery_201402: true,
        back_mystery_201402: false,
        head_mystery_201402: true,
        weapon_armoire_basicCrossbow: false,
      });
    });
  });

  describe('Gem purchases', () => {
    it('does not purchase items without enough Gems', () => {
      let user = generateUser();

      user.items.eggs = {};
      user.items.gear.owned = {};

      user.ops.purchase({
        params: {
          type: 'eggs',
          key: 'Cactus',
        },
      });
      user.ops.purchase({
        params: {
          type: 'gear',
          key: 'headAccessory_special_foxEars',
        },
      });
      user.ops.unlock({
        query: {
          path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars',
        },
      });
      expect(user.items.eggs).to.eql({});
      expect(user.items.gear.owned).to.eql({});
    });

    it('purchases an egg', () => {
      let user = generateUser();

      user.balance = 1;
      user.ops.purchase({
        params: {
          type: 'eggs',
          key: 'Cactus',
        },
      });
      expect(user.items.eggs).to.eql({
        Cactus: 1,
      });
      expect(user.balance).to.eql(0.25);
    });

    it('purchases fox ears', () => {
      let user = generateUser();

      user.balance = 1;
      user.ops.purchase({
        params: {
          type: 'gear',
          key: 'headAccessory_special_foxEars',
        },
      });

      expect(user.items.gear.owned.headAccessory_special_foxEars).to.eql(true);
      expect(user.balance).to.eql(0.5);
    });

    it('unlocks all the animal ears at once', () => {
      let user = generateUser();

      user.balance = 2;
      user.ops.unlock({
        query: {
          path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars',
        },
      });

      expect(user.items.gear.owned.headAccessory_special_bearEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_cactusEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_foxEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_lionEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_pandaEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_pigEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_tigerEars).to.eql(true);
      expect(user.items.gear.owned.headAccessory_special_wolfEars).to.eql(true);
      expect(user.balance).to.eql(0.75);
    });
  });

  describe('spells', () => {
    _.each(shared.content.spells, (spellClass) => {
      _.each(spellClass, (spell) => {
        it(`${spell.text} has valid values`, () => {
          expect(spell.target).to.match(/^(task|self|party|user)$/);
          expect(spell.mana).to.be.an('number');
          if (spell.lvl) {
            expect(spell.lvl).to.be.an('number');
            expect(spell.lvl).to.be.above(0);
          }
          expect(spell.cast).to.be.a('function');
        });
      });
    });
  });

  describe('drop system', () => {
    let user = null;
    const MIN_RANGE_FOR_POTION = 0;
    const MAX_RANGE_FOR_POTION = 0.3;
    const MIN_RANGE_FOR_EGG = 0.4;
    const MAX_RANGE_FOR_EGG = 0.6;
    const MIN_RANGE_FOR_FOOD = 0.7;
    const MAX_RANGE_FOR_FOOD = 1;

    beforeEach(function () {
      user = generateUser();
      user.flags.dropsEnabled = true;
      this.task_id = shared.uuid();
      return user.ops.addTask({
        body: {
          type: 'daily',
          id: this.task_id,
        },
      });
    });

    it('drops a hatching potion', function () {
      let results = [];

      for (let random = MIN_RANGE_FOR_POTION; random <= MAX_RANGE_FOR_POTION; random += 0.1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);

        let delta = scoreTask({task: user.dailys[user.dailys.length - 1], user, direction: 'up'});
        user.fns.randomDrop({task: user.dailys[user.dailys.length - 1], delta}, {});
        expect(user.items.eggs).to.be.empty;
        expect(user.items.hatchingPotions).to.not.be.empty;
        expect(user.items.food).to.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });

    it('drops a pet egg', function () {
      let results = [];

      for (let random = MIN_RANGE_FOR_EGG; random <= MAX_RANGE_FOR_EGG; random += 0.1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);
        let delta = scoreTask({task: user.dailys[user.dailys.length - 1], user, direction: 'up'});
        user.fns.randomDrop({task: user.dailys[user.dailys.length - 1], delta}, {});
        expect(user.items.eggs).to.not.be.empty;
        expect(user.items.hatchingPotions).to.be.empty;
        expect(user.items.food).to.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });

    it('drops food', function () {
      let results = [];

      for (let random = MIN_RANGE_FOR_FOOD; random <= MAX_RANGE_FOR_FOOD; random += 0.1) {
        sinon.stub(user.fns, 'predictableRandom').returns(random);
        let delta = scoreTask({task: user.dailys[user.dailys.length - 1], user, direction: 'up'});
        user.fns.randomDrop({task: user.dailys[user.dailys.length - 1], delta}, {});
        expect(user.items.eggs).to.be.empty;
        expect(user.items.hatchingPotions).to.be.empty;
        expect(user.items.food).to.not.be.empty;
        results.push(user.fns.predictableRandom.restore());
      }
      return results;
    });

    it('does not get a drop', function () {
      sinon.stub(user.fns, 'predictableRandom').returns(0.5);
      let delta = scoreTask({task: user.dailys[user.dailys.length - 1], user, direction: 'up'});
      user.fns.randomDrop({task: user.dailys[user.dailys.length - 1], delta}, {});
      expect(user.items.eggs).to.eql({});
      expect(user.items.hatchingPotions).to.eql({});
      expect(user.items.food).to.eql({});

      user.fns.predictableRandom.restore();
    });
  });

  describe('Quests', () => {
    _.each(shared.content.quests, (quest) => {
      it(`${ quest.text() } has valid values`, () => {
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
          expect(quest.boss.str).to.be.greaterThan(0);
        } else if (quest.collect) {
          _.each(quest.collect, (collect) => {
            expect(collect.text()).to.be.an('string');
            expect(collect.count).to.be.greaterThan(0);
          });
        }
      });
    });
  });

  describe('Achievements', () => {
    _.each(shared.content.classes, (klass) => {
      let user = generateUser();

      user.achievements.ultimateGearSets = {};

      user.stats.gp = 10000;
      _.each(shared.content.gearTypes, (type) => {
        _.each([1, 2, 3, 4, 5], (i) => {
          return user.ops.buy({
            params: `${type}_${klass}_${i}`,
          });
        });
      });

      it(`does not get ultimateGear ${klass}`, () => {
        expect(user.achievements.ultimateGearSets[klass]).to.not.be.ok();
      });
      _.each(shared.content.gearTypes, (type) => {
        return user.ops.buy({
          params: `${type}_${klass}_6`,
        });
      });

      xit(`gets ultimateGear ${klass}`, () => {
        expect(user.achievements.ultimateGearSets[klass]).to.be.ok();
      });
    });

    it('does not remove existing Ultimate Gear achievements', () => {
      let user = generateUser();

      user.achievements.ultimateGearSets = {
        healer: true,
        wizard: true,
        rogue: true,
        warrior: true,
      };
      user.items.gear.owned.shield_warrior_5 = false;
      user.items.gear.owned.weapon_rogue_6 = false;
      user.ops.buy({
        params: 'shield_warrior_5',
      });
      expect(user.achievements.ultimateGearSets).to.eql({
        healer: true,
        wizard: true,
        rogue: true,
        warrior: true,
      });
    });
  });

  describe('unlocking features', () => {
    it('unlocks drops at level 3', () => {
      let user = generateUser();

      user.stats.lvl = 3;
      user.fns.updateStats(user.stats);
      expect(user.flags.dropsEnabled).to.be.ok();
    });

    it('unlocks Rebirth at level 50', () => {
      let user = generateUser();

      user.stats.lvl = 50;
      user.fns.updateStats(user.stats);
      expect(user.flags.rebirthEnabled).to.be.ok();
    });

    describe('level-awarded Quests', () => {
      it('gets Attack of the Mundane at level 15', () => {
        let user = generateUser();

        user.stats.lvl = 15;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.atom1).to.be.ok();
        expect(user.items.quests.atom1).to.eql(1);
      });

      it('gets Vice at level 30', () => {
        let user = generateUser();

        user.stats.lvl = 30;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.vice1).to.be.ok();
        expect(user.items.quests.vice1).to.eql(1);
      });

      it('gets Golden Knight at level 40', () => {
        let user = generateUser();

        user.stats.lvl = 40;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.goldenknight1).to.be.ok();
        expect(user.items.quests.goldenknight1).to.eql(1);
      });

      it('gets Moonstone Chain at level 60', () => {
        let user = generateUser();

        user.stats.lvl = 60;
        user.fns.updateStats(user.stats);
        expect(user.flags.levelDrops.moonstone1).to.be.ok();
        expect(user.items.quests.moonstone1).to.eql(1);
      });
    });
  });
});

describe('Simple Scoring', () => {
  beforeEach(function () {
    let ref = beforeAfter();

    this.before = ref.before;
    this.after = ref.after;
  });

  it('Habits : Up', function () {
    let delta = scoreTask({task: this.after.habits[0], user: this.after, direction: 'down', times: 5});
    this.after.fns.randomDrop({task: this.after.habits[0], delta}, {});
    expectLostPoints(this.before, this.after, 'habit');
  });

  it('Habits : Down', function () {
    let delta = scoreTask({task: this.after.habits[0], user: this.after, direction: 'up', times: 5});
    this.after.fns.randomDrop({task: this.after.habits[0], delta}, {});
    expectGainedPoints(this.before, this.after, 'habit');
  });

  it('Dailys : Up', function () {
    let delta = scoreTask({task: this.after.dailys[0], user: this.after, direction: 'up'});
    this.after.fns.randomDrop({task: this.after.dailys[0], delta}, {});
    expectGainedPoints(this.before, this.after, 'daily');
  });

  it('Dailys : Up, Down', function () {
    let delta = scoreTask({task: this.after.dailys[0], user: this.after, direction: 'up'});
    this.after.fns.randomDrop({task: this.after.dailys[0], delta}, {});
    let delta2 = scoreTask({task: this.after.dailys[0], user: this.after, direction: 'down'});
    this.after.fns.randomDrop({task: this.after.dailys[0], delta2}, {});
    expectClosePoints(this.before, this.after, 'daily');
  });

  it('Todos : Up', function () {
    let delta = scoreTask({task: this.after.todos[0], user: this.after, direction: 'up'});
    this.after.fns.randomDrop({task: this.after.todos[0], delta}, {});
    expectGainedPoints(this.before, this.after, 'todo');
  });

  it('Todos : Up, Down', function () {
    let delta = scoreTask({task: this.after.todos[0], user: this.after, direction: 'up'});
    this.after.fns.randomDrop({task: this.after.todos[0], delta}, {});
    let delta2 = scoreTask({task: this.after.todos[0], user: this.after, direction: 'down'});
    this.after.fns.randomDrop({task: this.after.todos[0], delta2}, {});
    expectClosePoints(this.before, this.after, 'todo');
  });
});

describe('Cron', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('computes shouldCron', () => {
    let paths = {};

    user.fns.cron({
      paths,
    });
    expect(user.lastCron).to.not.be.ok;
    user.lastCron = Number(moment().subtract(1, 'days'));
    paths = {};
    user.fns.cron({
      paths,
    });
    expect(user.lastCron).to.be.greaterThan(0);
  });

  it('only dailies & todos are affected', () => {
    let ref = beforeAfter({
      daysAgo: 1,
    });
    let before = ref.before;
    let after = ref.after;

    before.dailys = before.todos = after.dailys = after.todos = [];
    after.fns.cron();
    before.stats.mp = after.stats.mp;
    expect(after.lastCron).to.not.be(before.lastCron);
    delete after.stats.buffs;
    delete before.stats.buffs;
    expect(before.stats).to.eql(after.stats);

    let beforeTasks = before.habits.concat(before.dailys).concat(before.todos).concat(before.rewards);
    let afterTasks = after.habits.concat(after.dailys).concat(after.todos).concat(after.rewards);

    expect(beforeTasks).to.eql(afterTasks);
  });

  describe('Todos', () => {
    it('1 day missed', () => {
      let ref = beforeAfter({
        daysAgo: 1,
      });
      let  before = ref.before;
      let after = ref.after;

      before.dailys = after.dailys = [];
      after.fns.cron();
      expect(after).toHaveHP(50);
      expect(after).toHaveExp(0);
      expect(after).toHaveGP(0);
      expect(before.todos[0].value).to.be(0);
      expect(after.todos[0].value).to.be(-1);
      expect(after.history.todos).to.have.length(1);
    });

    it('2 days missed', () => {
      let ref = beforeAfter({
        daysAgo: 2,
      });
      let before = ref.before;
      let after = ref.after;

      before.dailys = after.dailys = [];
      after.fns.cron();
      expect(before.todos[0].value).to.be(0);
      expect(after.todos[0].value).to.be(-1);
    });
  });

  describe('cron day calculations', () => {
    let dayStart = 4;
    let fstr = 'YYYY-MM-DD HH: mm: ss';

    it('startOfDay before dayStart', () => {
      let start = startOfDay({
        now: moment('2014-10-09 02: 30: 00'),
        dayStart,
      });

      expect(start.format(fstr)).to.eql('2014-10-08 04: 00: 00');
    });

    it('startOfDay after dayStart', () => {
      let start = startOfDay({
        now: moment('2014-10-09 05: 30: 00'),
        dayStart,
      });

      expect(start.format(fstr)).to.eql('2014-10-09 04: 00: 00');
    });

    it('daysSince cron before, now after', () => {
      let lastCron = moment('2014-10-09 02: 30: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-09 11: 30: 00'),
        dayStart,
      });

      expect(days).to.eql(1);
    });

    it('daysSince cron before, now before', () => {
      let lastCron = moment('2014-10-09 02: 30: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-09 03: 30: 00'),
        dayStart,
      });

      expect(days).to.eql(0);
    });

    it('daysSince cron after, now after', () => {
      let lastCron = moment('2014-10-09 05: 30: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-09 06: 30: 00'),
        dayStart,
      });

      expect(days).to.eql(0);
    });

    it('daysSince cron after, now tomorrow before', () => {
      let lastCron = moment('2014-10-09 12: 30: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-10 01: 30: 00'),
        dayStart,
      });

      expect(days).to.eql(0);
    });

    it('daysSince cron after, now tomorrow after', () => {
      let lastCron = moment('2014-10-09 12: 30: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-10 10: 30: 00'),
        dayStart,
      });

      expect(days).to.eql(1);
    });
    xit('daysSince, last cron before new dayStart', () => {
      let lastCron = moment('2014-10-09 01: 00: 00');
      let days = daysSince(lastCron, {
        now: moment('2014-10-09 05: 00: 00'),
        dayStart,
      });

      expect(days).to.eql(0);
    });
  });

  describe('dailies', () => {
    describe('new day', () => {
      /*
      This section runs through a 'cron matrix' of all permutations (that I can easily account for). It sets
      task due days, user custom day start, timezoneOffset, etc - then runs cron, jumps to tomorrow and runs cron,
      and so on - testing each possible outcome along the way
       */

      function runCron (options) {
        _.each([480, 240, 0, -120], function (timezoneOffset) {
          let now = startOfWeek({
            timezoneOffset,
          }).add(options.currentHour || 0, 'hours');

          let ref = beforeAfter({
            now,
            timezoneOffset,
            daysAgo: 1,
            cronAfterStart: options.cronAfterStart || true,
            dayStart: options.dayStart || 0,
            limitOne: 'daily',
          });

          let before = ref.before;
          let after = ref.after;

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
              timezoneOffset,
              dayStart: options.dayStart,
              now,
            })).to.be.ok();
          }
          after.fns.cron({
            now,
          });
          before.stats.mp = after.stats.mp;

          if (options.expect === 'losePoints') {
            expectLostPoints(before, after, 'daily');
          } else if (options.expect === 'noChange') {
            expectNoChange(before, after);
          } else if (options.expect === 'noDamage') {
            expectDayResetNoDamage(before, after);
          }

          return {
            before,
            after,
          };
        });
      }

      let cronMatrix = {
        steps: {
          'due yesterday': {
            defaults: {
              daysAgo: 1,
              cronAfterStart: true,
              limitOne: 'daily',
            },
            steps: {
              '(simple)': {
                expect: 'losePoints',
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
                    s: true,
                  },
                },
                steps: {
                  'pre-dayStart': {
                    defaults: {
                      currentHour: 3,
                      dayStart: 4,
                      shouldDo: true,
                    },
                    steps: {
                      checked: {
                        checked: true,
                        expect: 'noChange',
                      },
                      'un-checked': {
                        checked: false,
                        expect: 'noChange',
                      },
                    },
                  },
                  'post-dayStart': {
                    defaults: {
                      currentHour: 5,
                      dayStart: 4,
                      shouldDo: true,
                    },
                    steps: {
                      checked: {
                        checked: true,
                        expect: 'noDamage',
                      },
                      unchecked: {
                        checked: false,
                        expect: 'losePoints',
                      },
                    },
                  },
                },
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
                    s: true,
                  },
                },
                steps: {
                  'pre-dayStart': {
                    defaults: {
                      currentHour: 3,
                      dayStart: 4,
                      shouldDo: true,
                    },
                    steps: {
                      checked: {
                        checked: true,
                        expect: 'noChange',
                      },
                      'un-checked': {
                        checked: false,
                        expect: 'noChange',
                      },
                    },
                  },
                  'post-dayStart': {
                    defaults: {
                      currentHour: 5,
                      dayStart: 4,
                      shouldDo: false,
                    },
                    steps: {
                      checked: {
                        checked: true,
                        expect: 'noDamage',
                      },
                      unchecked: {
                        checked: false,
                        expect: 'losePoints',
                      },
                    },
                  },
                },
              },
            },
          },
          'not due yesterday': {
            defaults: repeatWithoutLastWeekday(),
            steps: {
              '(simple)': {
                expect: 'noDamage',
              },
              'post-dayStart': {
                currentHour: 5,
                dayStart: 4,
                expect: 'noDamage',
              },
              'pre-dayStart': {
                currentHour: 3,
                dayStart: 4,
                expect: 'noChange',
              },
            },
          },
        },
      };

      let recurseCronMatrix = (obj, options = {}) => {
        if (obj.steps) {
          _.each(obj.steps, (step, text) => {
            let o = _.cloneDeep(options);

            if (!o.text) {
              o.text = '';
            }
            o.text += `${text}`;
            return recurseCronMatrix(step, _.defaults(o, obj.defaults));
          });
        } else {
          it(`${options.text}`, () => {
            return runCron(_.defaults(obj, options));
          });
        }
      };

      return recurseCronMatrix(cronMatrix);
    });
  });
});

describe('Helper', () => {
  it('calculates gold coins', () => {
    expect(shared.gold(10)).to.eql(10);
    expect(shared.gold(1.957)).to.eql(1);
    expect(shared.gold()).to.eql(0);
  });

  it('calculates silver coins', () => {
    expect(shared.silver(10)).to.eql(0);
    expect(shared.silver(1.957)).to.eql(95);
    expect(shared.silver(0.01)).to.eql('01');
    expect(shared.silver()).to.eql('00');
  });

  it('calculates experience to next level', () => {
    expect(shared.tnl(1)).to.eql(150);
    expect(shared.tnl(2)).to.eql(160);
    expect(shared.tnl(10)).to.eql(260);
    expect(shared.tnl(99)).to.eql(3580);
  });

  it('calculates the start of the day', () => {
    let fstr = 'YYYY-MM-DD HH: mm: ss';
    let today = '2013-01-01 00: 00: 00';
    let zone = moment(today).zone();

    expect(startOfDay({
      now: new Date(2013, 0, 1, 0),
    }, {
      timezoneOffset: zone,
    }).format(fstr)).to.eql(today);
    expect(startOfDay({
      now: new Date(2013, 0, 1, 5),
    }, {
      timezoneOffset: zone,
    }).format(fstr)).to.eql(today);
    expect(startOfDay({
      now: new Date(2013, 0, 1, 23, 59, 59),
      timezoneOffset: zone,
    }).format(fstr)).to.eql(today);
  });
});
