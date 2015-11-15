(function() {
  var _, cron, expect, moment, newUser, repeatWithoutLastWeekday, shared, sinon;

  _ = require('lodash');

  expect = require('expect.js');

  sinon = require('sinon');

  moment = require('moment');

  shared = require('../../common/script/index.js');

  shared.i18n.translations = require('../../website/src/libs/i18n.js').translations;

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
          costume: {}
        }
      },
      party: {
        quest: {
          progress: {
            down: 0
          }
        }
      },
      preferences: {},
      dailys: [],
      todos: [],
      rewards: [],
      flags: {},
      achievements: {},
      contributor: {
        level: 2
      }
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

  cron = function(usr, missedDays) {
    if (missedDays == null) {
      missedDays = 1;
    }
    usr.lastCron = moment().subtract(missedDays, 'days');
    return usr.fns.cron();
  };

  describe('daily/weekly that repeats everyday (default)', function() {
    var daily, user, weekly;
    user = null;
    daily = null;
    weekly = null;
    describe('when startDate is in the future', function() {
      beforeEach(function() {
        user = newUser();
        user.dailys = [
          shared.taskDefaults({
            type: 'daily',
            startDate: moment().add(7, 'days'),
            frequency: 'daily'
          }), shared.taskDefaults({
            type: 'daily',
            startDate: moment().add(7, 'days'),
            frequency: 'weekly',
            repeat: {
              su: true,
              m: true,
              t: true,
              w: true,
              th: true,
              f: true,
              s: true
            }
          })
        ];
        daily = user.dailys[0];
        return weekly = user.dailys[1];
      });
      it('does not damage user for not completing it', function() {
        cron(user);
        return expect(user.stats.hp).to.be(50);
      });
      it('does not change value on cron if daily is incomplete', function() {
        cron(user);
        expect(daily.value).to.be(0);
        return expect(weekly.value).to.be(0);
      });
      it('does not reset checklists if daily is not marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        weekly.checklist = checklist;
        cron(user);
        expect(daily.checklist[0].completed).to.be(true);
        expect(daily.checklist[1].completed).to.be(true);
        expect(daily.checklist[2].completed).to.be(false);
        expect(weekly.checklist[0].completed).to.be(true);
        expect(weekly.checklist[1].completed).to.be(true);
        return expect(weekly.checklist[2].completed).to.be(false);
      });
      it('resets checklists if daily is marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        weekly.checklist = checklist;
        daily.completed = true;
        weekly.completed = true;
        cron(user);
        _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
        return _.each(weekly.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
      return it('is due on startDate', function() {
        var daily_due_on_start_date, daily_due_today, weekly_due_on_start_date, weekly_due_today;
        daily_due_today = shared.shouldDo(moment(), daily);
        daily_due_on_start_date = shared.shouldDo(moment().add(7, 'days'), daily);
        expect(daily_due_today).to.be(false);
        expect(daily_due_on_start_date).to.be(true);
        weekly_due_today = shared.shouldDo(moment(), weekly);
        weekly_due_on_start_date = shared.shouldDo(moment().add(7, 'days'), weekly);
        expect(weekly_due_today).to.be(false);
        return expect(weekly_due_on_start_date).to.be(true);
      });
    });
    describe('when startDate is in the past', function() {
      beforeEach(function() {
        user = newUser();
        user.dailys = [
          shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(7, 'days'),
            frequency: 'daily'
          }), shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(7, 'days'),
            frequency: 'weekly'
          })
        ];
        daily = user.dailys[0];
        return weekly = user.dailys[1];
      });
      it('does damage user for not completing it', function() {
        cron(user);
        return expect(user.stats.hp).to.be.lessThan(50);
      });
      it('decreases value on cron if daily is incomplete', function() {
        cron(user, 1);
        expect(daily.value).to.be(-1);
        return expect(weekly.value).to.be(-1);
      });
      it('decreases value on cron once only if daily is incomplete and multiple days are missed', function() {
        cron(user, 7);
        expect(daily.value).to.be(-1);
        return expect(weekly.value).to.be(-1);
      });
      it('resets checklists if daily is not marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        weekly.checklist = checklist;
        cron(user);
        _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
        return _.each(weekly.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
      return it('resets checklists if daily is marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        daily.completed = true;
        weekly.checklist = checklist;
        weekly.completed = true;
        cron(user);
        _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
        return _.each(weekly.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
    });
    return describe('when startDate is today', function() {
      beforeEach(function() {
        user = newUser();
        user.dailys = [
          shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(1, 'days'),
            frequency: 'daily'
          }), shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(1, 'days'),
            frequency: 'weekly'
          })
        ];
        daily = user.dailys[0];
        return weekly = user.dailys[1];
      });
      it('does damage user for not completing it', function() {
        cron(user);
        return expect(user.stats.hp).to.be.lessThan(50);
      });
      it('decreases value on cron if daily is incomplete', function() {
        cron(user);
        expect(daily.value).to.be.lessThan(0);
        return expect(weekly.value).to.be.lessThan(0);
      });
      it('resets checklists if daily is not marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        weekly.checklist = checklist;
        cron(user);
        _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
        return _.each(weekly.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
      return it('resets checklists if daily is marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }, {
            'text': '2',
            'id': 'checklist-two',
            'completed': true
          }, {
            'text': '3',
            'id': 'checklist-three',
            'completed': false
          }
        ];
        daily.checklist = checklist;
        daily.completed = true;
        weekly.checklist = checklist;
        weekly.completed = true;
        cron(user);
        _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
        return _.each(weekly.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
    });
  });

  describe('daily that repeats every x days', function() {
    var daily, user;
    user = null;
    daily = null;
    beforeEach(function() {
      user = newUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment(),
          frequency: 'daily'
        })
      ];
      return daily = user.dailys[0];
    });
    return _.times(11, function(due) {
      return it('where x equals ' + due, function() {
        daily.everyX = due;
        return _.times(30, function(day) {
          var isDue;
          isDue = shared.shouldDo(moment().add(day, 'days'), daily);
          if (day % due === 0) {
            expect(isDue).to.be(true);
          }
          if (day % due !== 0) {
            return expect(isDue).to.be(false);
          }
        });
      });
    });
  });

  describe('daily that repeats every X days when multiple days are missed', function() {
    var daily, everyX, startDateDaysAgo, user;
    everyX = 3;
    startDateDaysAgo = everyX * 3;
    user = null;
    daily = null;
    describe('including missing a due date', function() {
      var missedDays;
      missedDays = everyX * 2 + 1;
      beforeEach(function() {
        user = newUser();
        user.dailys = [
          shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(startDateDaysAgo, 'days'),
            frequency: 'daily',
            everyX: everyX
          })
        ];
        return daily = user.dailys[0];
      });
      it('decreases value on cron once only if daily is incomplete', function() {
        cron(user, missedDays);
        return expect(daily.value).to.be(-1);
      });
      it('resets checklists if daily is incomplete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }
        ];
        daily.checklist = checklist;
        cron(user, missedDays);
        return _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
      return it('resets checklists if daily is marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }
        ];
        daily.checklist = checklist;
        daily.completed = true;
        cron(user, missedDays);
        return _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
    });
    return describe('but not missing a due date', function() {
      var missedDays;
      missedDays = everyX - 1;
      beforeEach(function() {
        user = newUser();
        user.dailys = [
          shared.taskDefaults({
            type: 'daily',
            startDate: moment().subtract(startDateDaysAgo, 'days'),
            frequency: 'daily',
            everyX: everyX
          })
        ];
        return daily = user.dailys[0];
      });
      it('does not decrease value on cron', function() {
        cron(user, missedDays);
        return expect(daily.value).to.be(0);
      });
      it('does not reset checklists if daily is incomplete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }
        ];
        daily.checklist = checklist;
        cron(user, missedDays);
        return _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(true);
        });
      });
      return it('resets checklists if daily is marked as complete', function() {
        var checklist;
        checklist = [
          {
            'text': '1',
            'id': 'checklist-one',
            'completed': true
          }
        ];
        daily.checklist = checklist;
        daily.completed = true;
        cron(user, missedDays);
        return _.each(daily.checklist, function(box) {
          return expect(box.completed).to.be(false);
        });
      });
    });
  });

}).call(this);
