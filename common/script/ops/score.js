import moment from 'moment';
import _ from 'lodash';
import i18n from '../i18n';

module.exports = function(user, req, cb) {
  var addPoints, calculateDelta, calculateReverseDelta, changeTaskValue, delta, direction, gainMP, id, multiplier, num, options, ref, stats, subtractPoints, task, th;
  ref = req.params, id = ref.id, direction = ref.direction;
  task = user.tasks[id];
  options = req.query || {};
  _.defaults(options, {
    times: 1,
    cron: false
  });
  user._tmp = {};
  stats = {
    gp: +user.stats.gp,
    hp: +user.stats.hp,
    exp: +user.stats.exp
  };
  task.value = +task.value;
  task.streak = ~~task.streak;
  if (task.priority == null) {
    task.priority = 1;
  }
  if (task.value > stats.gp && task.type === 'reward') {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageNotEnoughGold', req.language)
    }) : void 0;
  }
  delta = 0;
  calculateDelta = function() {
    var currVal, nextDelta, ref1;
    currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
    nextDelta = Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
    if (((ref1 = task.checklist) != null ? ref1.length : void 0) > 0) {
      if (direction === 'down' && task.type === 'daily' && options.cron) {
        nextDelta *= 1 - _.reduce(task.checklist, (function(m, i) {
          return m + (i.completed ? 1 : 0);
        }), 0) / task.checklist.length;
      }
      if (task.type === 'todo') {
        nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
          return m + (i.completed ? 1 : 0);
        }), 0);
      }
    }
    return nextDelta;
  };
  calculateReverseDelta = function() {
    var calc, closeEnough, currVal, diff, nextDelta, ref1, testVal;
    currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
    testVal = currVal + Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
    closeEnough = 0.00001;
    while (true) {
      calc = testVal + Math.pow(0.9747, testVal);
      diff = currVal - calc;
      if (Math.abs(diff) < closeEnough) {
        break;
      }
      if (diff > 0) {
        testVal -= diff;
      } else {
        testVal += diff;
      }
    }
    nextDelta = testVal - currVal;
    if (((ref1 = task.checklist) != null ? ref1.length : void 0) > 0) {
      if (task.type === 'todo') {
        nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
          return m + (i.completed ? 1 : 0);
        }), 0);
      }
    }
    return nextDelta;
  };
  changeTaskValue = function() {
    return _.times(options.times, function() {
      var nextDelta, ref1;
      nextDelta = !options.cron && direction === 'down' ? calculateReverseDelta() : calculateDelta();
      if (task.type !== 'reward') {
        if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased' && !(task.type === 'todo' && direction === 'down')) {
          user.stats.training[task.attribute] += nextDelta;
        }
        if (direction === 'up') {
          user.party.quest.progress.up = user.party.quest.progress.up || 0;
          if ((ref1 = task.type) === 'daily' || ref1 === 'todo') {
            user.party.quest.progress.up += nextDelta * (1 + (user._statsComputed.str / 200));
          }
          if (task.type === 'habit') {
            user.party.quest.progress.up += nextDelta * (0.5 + (user._statsComputed.str / 400));
          }
        }
        task.value += nextDelta;
      }
      return delta += nextDelta;
    });
  };
  addPoints = function() {
    var _crit, afterStreak, currStreak, gpMod, intBonus, perBonus, streakBonus;
    _crit = (delta > 0 ? user.fns.crit() : 1);
    if (_crit > 1) {
      user._tmp.crit = _crit;
    }
    intBonus = 1 + (user._statsComputed.int * .025);
    stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);
    perBonus = 1 + user._statsComputed.per * .02;
    gpMod = delta * task.priority * _crit * perBonus;
    return stats.gp += task.streak ? (currStreak = direction === 'down' ? task.streak - 1 : task.streak, streakBonus = currStreak / 100 + 1, afterStreak = gpMod * streakBonus, currStreak > 0 ? gpMod > 0 ? user._tmp.streakBonus = afterStreak - gpMod : void 0 : void 0, afterStreak) : gpMod;
  };
  subtractPoints = function() {
    var conBonus, hpMod;
    conBonus = 1 - (user._statsComputed.con / 250);
    if (conBonus < .1) {
      conBonus = 0.1;
    }
    hpMod = delta * conBonus * task.priority * 2;
    return stats.hp += Math.round(hpMod * 10) / 10;
  };
  gainMP = function(delta) {
    delta *= user._tmp.crit || 1;
    user.stats.mp += delta;
    if (user.stats.mp >= user._statsComputed.maxMP) {
      user.stats.mp = user._statsComputed.maxMP;
    }
    if (user.stats.mp < 0) {
      return user.stats.mp = 0;
    }
  };
  switch (task.type) {
    case 'habit':
      changeTaskValue();
      if (delta > 0) {
        addPoints();
      } else {
        subtractPoints();
      }
      gainMP(_.max([0.25, .0025 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
      th = (task.history != null ? task.history : task.history = []);
      if (th[th.length - 1] && moment(th[th.length - 1].date).isSame(new Date, 'day')) {
        th[th.length - 1].value = task.value;
      } else {
        th.push({
          date: +(new Date),
          value: task.value
        });
      }
      if (typeof user.markModified === "function") {
        user.markModified("habits." + (_.findIndex(user.habits, {
          id: task.id
        })) + ".history");
      }
      break;
    case 'daily':
      if (options.cron) {
        changeTaskValue();
        subtractPoints();
        if (!user.stats.buffs.streaks) {
          task.streak = 0;
        }
      } else {
        changeTaskValue();
        if (direction === 'down') {
          delta = calculateDelta();
        }
        addPoints();
        gainMP(_.max([1, .01 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
        if (direction === 'up') {
          task.streak = task.streak ? task.streak + 1 : 1;
          if ((task.streak % 21) === 0) {
            user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
          }
        } else {
          if ((task.streak % 21) === 0) {
            user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
          }
          task.streak = task.streak ? task.streak - 1 : 0;
        }
      }
      break;
    case 'todo':
      if (options.cron) {
        changeTaskValue();
      } else {
        task.dateCompleted = direction === 'up' ? new Date : void 0;
        changeTaskValue();
        if (direction === 'down') {
          delta = calculateDelta();
        }
        addPoints();
        multiplier = _.max([
          _.reduce(task.checklist, (function(m, i) {
            return m + (i.completed ? 1 : 0);
          }), 1), 1
        ]);
        gainMP(_.max([multiplier, .01 * user._statsComputed.maxMP * multiplier]) * (direction === 'down' ? -1 : 1));
      }
      break;
    case 'reward':
      changeTaskValue();
      stats.gp -= Math.abs(task.value);
      num = parseFloat(task.value).toFixed(2);
      if (stats.gp < 0) {
        stats.hp += stats.gp;
        stats.gp = 0;
      }
  }
  user.fns.updateStats(stats, req);
  if (typeof window === 'undefined') {
    if (direction === 'up') {
      user.fns.randomDrop({
        task: task,
        delta: delta
      }, req);
    }
  }
  if (typeof cb === "function") {
    cb(null, user);
  }
  return delta;
};
