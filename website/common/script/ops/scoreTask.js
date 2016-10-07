import _ from 'lodash';
import {
  NotAuthorized,
} from '../libs/errors';
import i18n from '../i18n';
import updateStats from '../fns/updateStats';
import crit from '../fns/crit';

const MAX_TASK_VALUE = 21.27;
const MIN_TASK_VALUE = -47.27;
const CLOSE_ENOUGH = 0.00001;

function _getTaskValue (taskValue) {
  if (taskValue < MIN_TASK_VALUE) {
    return MIN_TASK_VALUE;
  } else if (taskValue > MAX_TASK_VALUE) {
    return MAX_TASK_VALUE;
  } else {
    return taskValue;
  }
}

// Calculates the next task.value based on direction
// Uses a capped inverse log y=.95^x, y>= -5
function _calculateDelta (task, direction, cron) {
  // Min/max on task redness
  let currVal = _getTaskValue(task.value);
  let nextDelta = Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);

  // Checklists
  if (task.checklist && task.checklist.length > 0) {
    // If the Daily, only dock them a portion based on their checklist completion
    if (direction === 'down' && task.type === 'daily' && cron) {
      nextDelta *= 1 - _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0) / task.checklist.length;
    }

    // If To-Do, point-match the TD per checklist item completed
    if (task.type === 'todo') {
      nextDelta *= 1 + _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
    }
  }

  return nextDelta;
}

// Approximates the reverse delta for the task value
// This is meant to return the task value to its original value when unchecking a task.
// First, calculate the value using the normal way for our first guess although
// it will be a bit off
function _calculateReverseDelta (task, direction) {
  let currVal = _getTaskValue(task.value);
  let testVal = currVal + Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);

  // Now keep moving closer to the original value until we get "close enough"
  // Check how close we are to the original value by computing the delta off our guess
  // and looking at the difference between that and our current value.
  while (true) { // eslint-disable-line no-constant-condition
    let calc = testVal + Math.pow(0.9747, testVal);
    let diff = currVal - calc;

    if (Math.abs(diff) < CLOSE_ENOUGH) break;

    if (diff > 0) {
      testVal -= diff;
    } else {
      testVal += diff;
    }
  }

  // When we get close enough, return the difference between our approximated value
  // and the current value.  This will be the delta calculated from the original value
  // before the task was checked.
  let nextDelta = testVal - currVal;

  // Checklists - If To-Do, point-match the TD per checklist item completed
  if (task.checklist && task.checklist.length > 0 && task.type === 'todo') {
    nextDelta *= 1 + _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
  }

  return nextDelta;
}

function _gainMP (user, val) {
  val *= user._tmp.crit || 1;
  user.stats.mp += val;

  if (user.stats.mp >= user._statsComputed.maxMP) user.stats.mp = user._statsComputed.maxMP;
  if (user.stats.mp < 0) {
    user.stats.mp = 0;
  }
}

// HP modifier
// ===== CONSTITUTION =====
// TODO Decreases HP loss from bad habits / missed dailies by 0.5% per point.
function _subtractPoints (user, task, stats, delta) {
  let conBonus = 1 - user._statsComputed.con / 250;
  if (conBonus < 0.1) conBonus = 0.1;

  let hpMod = delta * conBonus * task.priority * 2; // constant 2 multiplier for better results
  stats.hp += Math.round(hpMod * 10) / 10; // round to 1dp
  return stats.hp;
}

function _addPoints (user, task, stats, direction, delta) {
  // ===== CRITICAL HITS =====
  // allow critical hit only when checking off a task, not when unchecking it:
  let _crit = delta > 0 ? crit(user) : 1;
  // if there was a crit, alert the user via notification
  if (_crit > 1) user._tmp.crit = _crit;

  // Exp Modifier
  // ===== Intelligence =====
  // TODO Increases Experience gain by .2% per point.
  let intBonus = 1 + user._statsComputed.int * 0.025;
  stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);

  // GP modifier
  // ===== PERCEPTION =====
  // TODO Increases Gold gained from tasks by .3% per point.
  let perBonus = 1 + user._statsComputed.per * 0.02;
  let gpMod = delta * task.priority * _crit * perBonus;

  if (task.streak) {
    let currStreak = direction === 'down' ? task.streak - 1 : task.streak;
    let streakBonus = currStreak / 100 + 1; // eg, 1-day streak is 1.01, 2-day is 1.02, etc
    let afterStreak = gpMod * streakBonus;
    if (currStreak > 0 && gpMod > 0) {
      user._tmp.streakBonus = afterStreak - gpMod; // keep this on-hand for later, so we can notify streak-bonus
    }

    stats.gp += afterStreak;
  } else {
    stats.gp += gpMod;
  }
}

function _changeTaskValue (user, task, direction, times, cron) {
  let addToDelta = 0;

  // If multiple days have passed, multiply times days missed
  _.times(times, () => {
    // Each iteration calculate the nextDelta, which is then accumulated in the total delta.
    let nextDelta = !cron && direction === 'down' ? _calculateReverseDelta(task, direction) : _calculateDelta(task, direction, cron);

    if (task.type !== 'reward') {
      if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased' && !(task.type === 'todo' && direction === 'down')) {
        user.stats.training[task.attribute] += nextDelta;
      }

      if (direction === 'up') { // Make progress on quest based on STR
        user.party.quest.progress.up = user.party.quest.progress.up || 0;
        let prevProgress = user.party.quest.progress.up;

        if (task.type === 'todo' || task.type === 'daily') {
          user.party.quest.progress.up += nextDelta * (1 + user._statsComputed.str / 200);
        } else if (task.type === 'habit') {
          user.party.quest.progress.up += nextDelta * (0.5 + user._statsComputed.str / 400);
        }

        if (!user._tmp.quest) user._tmp.quest = {};
        user._tmp.quest.progressDelta = user.party.quest.progress.up - prevProgress;
      }
      task.value += nextDelta;
    }

    addToDelta += nextDelta;
  });

  return addToDelta;
}

module.exports = function scoreTask (options = {}, req = {}) {
  let {user, task, direction, times = 1, cron = false} = options;
  let delta = 0;
  let stats = {
    gp: user.stats.gp,
    hp: user.stats.hp,
    exp: user.stats.exp,
  };

  // This is for setting one-time temporary flags, such as streakBonus or itemDropped. Useful for notifying
  // the API consumer, then cleared afterwards
  user._tmp = {};

  // If they're trying to purchase a too-expensive reward, don't allow them to do that.
  if (task.value > user.stats.gp && task.type === 'reward') throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));

  if (task.type === 'habit') {
    delta += _changeTaskValue(user, task, direction, times, cron);

    // Add habit value to habit-history (if different)
    if (delta > 0) {
      _addPoints(user, task, stats, direction, delta);
    } else {
      _subtractPoints(user, task, stats, delta);
    }
    _gainMP(user, _.max([0.25, 0.0025 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));

    task.history = task.history || [];
    // Add history entry, even more than 1 per day
    task.history.push({
      date: Number(new Date()),
      value: task.value,
    });
  } else if (task.type === 'daily') {
    if (cron) {
      delta += _changeTaskValue(user, task, direction, times, cron);
      _subtractPoints(user, task, stats, delta);
      if (!user.stats.buffs.streaks) task.streak = 0;
    } else {
      delta += _changeTaskValue(user, task, direction, times, cron);
      if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
      _addPoints(user, task, stats, direction, delta); // obviously for delta>0, but also a trick to undo accidental checkboxes
      _gainMP(user, _.max([1, 0.01 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));

      if (direction === 'up') {
        task.streak += 1;
        // Give a streak achievement when the streak is a multiple of 21
        if (task.streak % 21 === 0) {
          user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
          user.addNotification('STREAK_ACHIEVEMENT');
        }
        task.completed = true;
      } else if (direction === 'down') {
        // Remove a streak achievement if streak was a multiple of 21 and the daily was undone
        if (task.streak % 21 === 0) user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
        task.streak -= 1;
        task.completed = false;
      }
    }
  } else if (task.type === 'todo') {
    if (cron) { // don't touch stats on cron
      delta += _changeTaskValue(user, task, direction, times, cron);
    } else {
      if (direction === 'up') {
        task.dateCompleted = new Date();
        task.completed = true;
      } else if (direction === 'down') {
        task.completed = false;
        task.dateCompleted = undefined;
      }

      delta += _changeTaskValue(user, task, direction, times, cron);
      if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
      _addPoints(user, task, stats, direction, delta);

      // MP++ per checklist item in ToDo, bonus per CLI
      let multiplier = _.max([_.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 1), 1]);
      _gainMP(user, _.max([multiplier, 0.01 * user._statsComputed.maxMP * multiplier]) * (direction === 'down' ? -1 : 1));
    }
  } else if (task.type === 'reward') {
    // Don't adjust values for rewards
    delta += _changeTaskValue(user, task, direction, times, cron);
    // purchase item
    stats.gp -= Math.abs(task.value);
    // hp - gp difference
    if (stats.gp < 0) {
      stats.hp += stats.gp;
      stats.gp = 0;
    }
  }

  updateStats(user, stats, req);
  return [delta];
};
