/* eslint-disable global-require */
import moment from 'moment';
import nconf from 'nconf';
import Bluebird from 'bluebird';
import requireAgain from 'require-again';
import { recoverCron, cron } from '../../../../../website/server/libs/cron';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import { clone } from 'lodash';
import common from '../../../../../website/common';

// const scoreTask = common.ops.scoreTask;

let pathToCronLib = '../../../../../website/server/libs/cron';

describe('cron', () => {
  let user;
  let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
  let daysMissed = 0;
  let analytics = {
    track: sinon.spy(),
  };

  beforeEach(() => {
    user = new User({
      auth: {
        local: {
          username: 'username',
          lowerCaseUsername: 'username',
          email: 'email@email.email',
          salt: 'salt',
          hashed_password: 'hashed_password', // eslint-disable-line camelcase
        },
      },
    });

    user._statsComputed = {
      mp: 10,
    };
  });

  it('updates user.preferences.timezoneOffsetAtLastCron', () => {
    let timezoneOffsetFromUserPrefs = 1;

    cron({user, tasksByType, daysMissed, analytics, timezoneOffsetFromUserPrefs});

    expect(user.preferences.timezoneOffsetAtLastCron).to.equal(timezoneOffsetFromUserPrefs);
  });

  it('resets user.items.lastDrop.count', () => {
    user.items.lastDrop.count = 4;
    cron({user, tasksByType, daysMissed, analytics});
    expect(user.items.lastDrop.count).to.equal(0);
  });

  it('increments user cron count', () => {
    let cronCountBefore = user.flags.cronCount;
    cron({user, tasksByType, daysMissed, analytics});
    expect(user.flags.cronCount).to.be.greaterThan(cronCountBefore);
  });

  describe('end of the month perks', () => {
    beforeEach(() => {
      user.purchased.plan.customerId = 'subscribedId';
      user.purchased.plan.dateUpdated = moment().subtract(1, 'months').toDate();
    });

    it('resets plan.gemsBought on a new month', () => {
      user.purchased.plan.gemsBought = 10;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.gemsBought).to.equal(0);
    });

    it('resets plan.dateUpdated on a new month', () => {
      let currentMonth = moment().startOf('month');
      cron({user, tasksByType, daysMissed, analytics});
      expect(moment(user.purchased.plan.dateUpdated).startOf('month').isSame(currentMonth)).to.eql(true);
    });

    it('increments plan.consecutive.count', () => {
      user.purchased.plan.consecutive.count = 0;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.count).to.equal(1);
    });

    it('increments plan.consecutive.count by more than 1 if user skipped months between logins', () => {
      user.purchased.plan.dateUpdated = moment().subtract(2, 'months').toDate();
      user.purchased.plan.consecutive.count = 0;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.count).to.equal(2);
    });

    it('decrements plan.consecutive.offset when offset is greater than 0', () => {
      user.purchased.plan.consecutive.offset = 2;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.offset).to.equal(1);
    });

    it('increments plan.consecutive.trinkets when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.trinkets).to.equal(1);
      expect(user.purchased.plan.consecutive.offset).to.equal(0);
    });

    it('increments plan.consecutive.trinkets multiple times if user has been absent with continuous subscription', () => {
      user.purchased.plan.dateUpdated = moment().subtract(6, 'months').toDate();
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.trinkets).to.equal(2);
    });

    it('does not award unearned plan.consecutive.trinkets if subscription ended during an absence', () => {
      user.purchased.plan.dateUpdated = moment().subtract(6, 'months').toDate();
      user.purchased.plan.dateTerminated = moment().subtract(3, 'months').toDate();
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.trinkets).to.equal(1);
    });

    it('increments plan.consecutive.gemCapExtra when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      expect(user.purchased.plan.consecutive.offset).to.equal(0);
    });

    it('increments plan.consecutive.gemCapExtra multiple times if user has been absent with continuous subscription', () => {
      user.purchased.plan.dateUpdated = moment().subtract(6, 'months').toDate();
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(10);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached the gemCap limit', () => {
      user.purchased.plan.consecutive.gemCapExtra = 25;
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(25);
    });

    it('does not reset plan stats if we are before the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).add({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.customerId).to.exist;
    });

    it('does reset plan stats if we are after the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).subtract({days: 1});
      user.purchased.plan.consecutive.gemCapExtra = 20;
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.purchased.plan.customerId).to.not.exist;
      expect(user.purchased.plan.consecutive.gemCapExtra).to.be.empty;
      expect(user.purchased.plan.consecutive.count).to.be.empty;
      expect(user.purchased.plan.consecutive.offset).to.be.empty;
    });
  });

  describe('end of the month perks when user is not subscribed', () => {
    beforeEach(() => {
      user.purchased.plan.dateUpdated = moment().subtract(1, 'months').toDate();
    });

    it('resets plan.gemsBought on a new month', () => {
      user.purchased.plan.gemsBought = 10;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.gemsBought).to.equal(0);
    });

    it('does not reset plan.dateUpdated on a new month', () => {
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.dateUpdated).to.be.empty;
    });

    it('does not increment plan.consecutive.count', () => {
      user.purchased.plan.consecutive.count = 0;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.count).to.equal(0);
    });

    it('does not decrement plan.consecutive.offset when offset is greater than 0', () => {
      user.purchased.plan.consecutive.offset = 1;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.offset).to.equal(1);
    });

    it('does not increment plan.consecutive.trinkets when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.trinkets).to.equal(0);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(0);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached the gemCap limit', () => {
      user.purchased.plan.consecutive.gemCapExtra = 25;
      user.purchased.plan.consecutive.count = 5;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(25);
    });

    it('does nothing to plan stats if we are before the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).add({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.purchased.plan.customerId).to.not.exist;
    });

    xit('does nothing to plan stats when we are after the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).subtract({days: 1});
      user.purchased.plan.consecutive.gemCapExtra = 20;
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.purchased.plan.customerId).to.exist;
      expect(user.purchased.plan.consecutive.gemCapExtra).to.exist;
      expect(user.purchased.plan.consecutive.count).to.exist;
      expect(user.purchased.plan.consecutive.offset).to.exist;
    });
  });

  describe('user is sleeping', () => {
    beforeEach(() => {
      user.preferences.sleep = true;
    });

    it('clears user buffs', () => {
      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 1,
        streaks: true,
      };

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('resets all dailies without damaging user', () => {
      let daily = {
        text: 'test daily',
        type: 'daily',
        frequency: 'daily',
        everyX: 5,
        startDate: new Date(),
      };

      let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line babel/new-cap
      tasksByType.dailys.push(task);
      tasksByType.dailys[0].completed = true;

      let healthBefore = user.stats.hp;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.dailys[0].completed).to.be.false;
      expect(user.stats.hp).to.equal(healthBefore);
    });
  });

  describe('todos', () => {
    beforeEach(() => {
      let todo = {
        text: 'test todo',
        type: 'todo',
        value: 0,
      };

      let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line babel/new-cap
      tasksByType.todos.push(task);
    });

    it('should make uncompleted todos redder', () => {
      let valueBefore = tasksByType.todos[0].value;
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.todos[0].value).to.be.lessThan(valueBefore);
    });

    it('should add history of completed todos to user history', () => {
      tasksByType.todos[0].completed = true;

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.history.todos).to.be.lengthOf(1);
    });
  });

  describe('dailys', () => {
    beforeEach(() => {
      let daily = {
        text: 'test daily',
        type: 'daily',
      };

      let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line babel/new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      user._statsComputed = {
        con: 1,
      };
    });

    it('should add history', () => {
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].history).to.be.lengthOf(1);
    });

    it('should set tasks completed to false', () => {
      tasksByType.dailys[0].completed = true;
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].completed).to.be.false;
    });

    it('should reset task checklist for completed dailys', () => {
      tasksByType.dailys[0].checklist.push({title: 'test', completed: false});
      tasksByType.dailys[0].completed = true;
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should reset task checklist for dailys with scheduled misses', () => {
      daysMissed = 10;
      tasksByType.dailys[0].checklist.push({title: 'test', completed: false});
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should do damage for missing a daily', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.be.lessThan(hpBefore);
    });

    it('should not do damage for missing a daily when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      let cronOverride = requireAgain(pathToCronLib).cron;

      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cronOverride({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should not do damage for missing a daily if user stealth buff is greater than or equal to days missed', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      user.stats.buffs.stealth = 2;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should do less damage for missing a daily with partial completion', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      let hpDifferenceOfFullyIncompleteDaily = hpBefore - user.stats.hp;

      hpBefore = user.stats.hp;
      tasksByType.dailys[0].checklist.push({title: 'test', completed: true});
      tasksByType.dailys[0].checklist.push({title: 'test2', completed: false});
      cron({user, tasksByType, daysMissed, analytics});
      let hpDifferenceOfPartiallyIncompleteDaily = hpBefore - user.stats.hp;

      expect(hpDifferenceOfPartiallyIncompleteDaily).to.be.lessThan(hpDifferenceOfFullyIncompleteDaily);
    });

    it('should decrement quest progress down for missing a daily', () => {
      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      let progress = cron({user, tasksByType, daysMissed, analytics});

      expect(progress.down).to.equal(-1);
    });
  });

  describe('habits', () => {
    beforeEach(() => {
      let habit = {
        text: 'test habit',
        type: 'habit',
      };

      let task = new Tasks.habit(Tasks.Task.sanitize(habit)); // eslint-disable-line babel/new-cap
      tasksByType.habits = [];
      tasksByType.habits.push(task);
    });

    it('should decrement only up value', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].down = false;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].value).to.be.lessThan(1);
    });

    it('should decrement only down value', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].up = false;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].value).to.be.lessThan(1);
    });

    it('should do nothing to habits with both up and down', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].up = true;
      tasksByType.habits[0].down = true;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].value).to.equal(1);
    });
  });

  describe('perfect day', () => {
    beforeEach(() => {
      let daily = {
        text: 'test daily',
        type: 'daily',
      };

      let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line babel/new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      user._statsComputed = {
        con: 1,
      };
    });

    it('stores a new entry in user.history.exp', () => {
      user.stats.lvl = 2;

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.history.exp).to.have.lengthOf(1);
      expect(user.history.exp[0].value).to.equal(150);
    });

    it('increments perfect day achievement if all (at least 1) due dailies were completed', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.achievements.perfect).to.equal(1);
    });

    it('does not increment perfect day achievement if no due dailies', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).add({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.achievements.perfect).to.equal(0);
    });

    it('increments user buffs if all (at least 1) due dailies were completed', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      let previousBuffs = clone(user.stats.buffs);

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });

    it('clears buffs if user does not have a perfect day (no due dailys)', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).add({days: 1});

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('clears buffs if user does not have a perfect day (at least one due daily not completed)', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('still grants a perfect day when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      let cronOverride = requireAgain(pathToCronLib).cron;
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      let previousBuffs = clone(user.stats.buffs);

      cronOverride({user, tasksByType, daysMissed, analytics});

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });
  });

  describe('adding mp', () => {
    it('should add mp to user', () => {
      let mpBefore = user.stats.mp;
      tasksByType.dailys[0].completed = true;
      user._statsComputed.maxMP = 100;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.stats.mp).to.be.greaterThan(mpBefore);
    });

    it('set user\'s mp to user._statsComputed.maxMP when user.stats.mp is greater', () => {
      user.stats.mp = 120;
      user._statsComputed.maxMP = 100;
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.stats.mp).to.equal(user._statsComputed.maxMP);
    });
  });

  describe('quest progress', () => {
    beforeEach(() => {
      let daily = {
        text: 'test daily',
        type: 'daily',
      };

      let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line babel/new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      user._statsComputed = {
        con: 1,
      };

      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});
    });

    it('resets user progress', () => {
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.party.quest.progress.up).to.equal(0);
      expect(user.party.quest.progress.down).to.equal(0);
      expect(user.party.quest.progress.collectedItems).to.be.empty;
    });

    it('applies the user progress', () => {
      let progress = cron({user, tasksByType, daysMissed, analytics});
      expect(progress.down).to.equal(-1);
    });
  });

  describe('notifications', () => {
    it('adds a user notification', () => {
      let mpBefore = user.stats.mp;
      tasksByType.dailys[0].completed = true;
      user._statsComputed.maxMP = 100;

      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.notifications.length).to.equal(1);
      expect(user.notifications[0].type).to.equal('CRON');
      expect(user.notifications[0].data).to.eql({
        hp: user.stats.hp - hpBefore,
        mp: user.stats.mp - mpBefore,
      });
    });

    it('condenses multiple notifications into one', () => {
      let mpBefore1 = user.stats.mp;
      tasksByType.dailys[0].completed = true;
      user._statsComputed.maxMP = 100;

      daysMissed = 1;
      let hpBefore1 = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.notifications.length).to.equal(1);
      expect(user.notifications[0].type).to.equal('CRON');
      expect(user.notifications[0].data).to.eql({
        hp: user.stats.hp - hpBefore1,
        mp: user.stats.mp - mpBefore1,
      });

      let hpBefore2 = user.stats.hp;
      let mpBefore2 = user.stats.mp;

      user.lastCron = moment(new Date()).subtract({days: 2});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.notifications.length).to.equal(1);
      expect(user.notifications[0].type).to.equal('CRON');
      expect(user.notifications[0].data).to.eql({
        hp: user.stats.hp - hpBefore2 - (hpBefore2 - hpBefore1),
        mp: user.stats.mp - mpBefore2 - (mpBefore2 - mpBefore1),
      });
    });
  });

  describe('private messages', () => {
    let lastMessageId;

    beforeEach(() => {
      let maxPMs = 200;
      for (let index = 0; index < maxPMs - 1; index += 1) {
        let messageId = common.uuid();
        user.inbox.messages[messageId] = {
          id: messageId,
          text: `test ${index}`,
          timestamp: Number(new Date()),
          likes: {},
          flags: {},
          flagCount: 0,
        };
      }

      lastMessageId = common.uuid();
      user.inbox.messages[lastMessageId] = {
        id: lastMessageId,
        text: `test ${lastMessageId}`,
        timestamp: Number(new Date()),
        likes: {},
        flags: {},
        flagCount: 0,
      };
    });

    xit('does not clear pms under 200', () => {
      cron({user, tasksByType, daysMissed, analytics});
      expect(user.inbox.messages[lastMessageId]).to.exist;
    });

    xit('clears pms over 200', () => {
      let messageId = common.uuid();
      user.inbox.messages[messageId] = {
        id: messageId,
        text: `test ${messageId}`,
        timestamp: Number(new Date()),
        likes: {},
        flags: {},
        flagCount: 0,
      };

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.inbox.messages[messageId]).to.not.exist;
    });
  });
});

describe('recoverCron', () => {
  let locals, status, execStub;

  beforeEach(() => {
    execStub = sandbox.stub();
    sandbox.stub(User, 'findOne').returns({ exec: execStub });

    status = { times: 0 };
    locals = {
      user: new User({
        auth: {
          local: {
            username: 'username',
            lowerCaseUsername: 'username',
            email: 'email@email.email',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      }),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('throws an error if user cannot be found', async (done) => {
    execStub.returns(Bluebird.resolve(null));

    try {
      await recoverCron(status, locals);
    } catch (err) {
      expect(err.message).to.eql(`User ${locals.user._id} not found while recovering.`);

      done();
    }
  });

  it('increases status.times count and reruns up to 4 times', async (done) => {
    execStub.returns(Bluebird.resolve({_cronSignature: 'RUNNING_CRON'}));
    execStub.onCall(4).returns(Bluebird.resolve({_cronSignature: 'NOT_RUNNING'}));

    await recoverCron(status, locals);

    expect(status.times).to.eql(4);
    expect(locals.user).to.eql({_cronSignature: 'NOT_RUNNING'});

    done();
  });

  it('throws an error if recoverCron runs 5 times', async (done) => {
    execStub.returns(Bluebird.resolve({_cronSignature: 'RUNNING_CRON'}));

    try {
      await recoverCron(status, locals);
    } catch (err) {
      expect(status.times).to.eql(5);
      expect(err.message).to.eql(`Impossible to recover from cron for user ${locals.user._id}.`);

      done();
    }
  });
});
