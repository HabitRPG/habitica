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
const POW_BASE = 0.9747;

function _getTaskValue (taskValue) {
  // Min/max on task redness/blueness.
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
// See also comments in _changeTaskValue for _calculateDelta versus _calculateReverseDelta
function _calculateDelta (task, direction, cron) {
  let currVal = _getTaskValue(task.value);
  let nextDelta = Math.pow(POW_BASE, currVal) * (direction === 'down' ? -1 : 1);
  // nextDelta is negative (makes task value more red, down) when:
  //     - cron makes uncompleted Dailies more red
  //     - cron makes uncompleted To-Dos more red (and completed ones https://github.com/HabitRPG/habitrpg/issues/6488 TODO)
  //     - cron moves blue/green Habits towards yellow
  //     - THIS IS NOT USED when a user clicks a Habit's negative button (see _calculateReverseDelta for that - bug? TODO)
  // nextDelta is positive (makes task value more blue, up) when:
  //     - cron makes completed Dailies more blue
  //     - cron moves orange/red Habits towards yellow
  //     - a user ticks a Daily or To-Do (up, more positive, more blue)
  //     - a user clicks a Habit's positive button (up)

  // Checklists
  if (task.checklist && task.checklist.length > 0) {
    if (direction === 'down' && task.type === 'daily' && cron) {
      // For uncompleted Dailies, cron docks only a portion of health, based on checklist completion
      nextDelta *= 1 - _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0) / task.checklist.length;
    }

    if (task.type === 'todo') {
      // A user completing a To-Do earns more points for more completed checklist items.
      // When cron reddens a To-Do, it becomes more red for more completed checklist items. TODO Bug? Bad for challenge value comparison (user can add checklist).
      nextDelta *= 1 + _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
    }
  }

  return nextDelta;
}

// When a user unticks a previously-completed Daily or To-Do (value goes down, more negative, more red),
// this approximates the reverse delta for the task value.
// This is meant to return the task value to its original value when unchecking a task.
// This is also used when a user clicks a Habit's negative button - TODO A bug? Use _calculateDelta instead?
// See also comments in _changeTaskValue for _calculateDelta versus _calculateReverseDelta
function _calculateReverseDelta (task) { // direction is always down (more negative, redder)
  // First, calculate the value using the normal way for our first guess although it will be a bit wrong.
  let currVal = _getTaskValue(task.value);
  let testVal = currVal + Math.pow(POW_BASE, currVal) * -1; // -1 because direction is down

  // Now keep moving closer to the original value until we get "close enough"
  // Check how close we are to the original value by computing the delta from our guess
  // and looking at the difference between that and our current value.
  while (true) { // eslint-disable-line no-constant-condition
    let calc = testVal + Math.pow(POW_BASE, testVal);
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

  if (task.checklist && task.checklist.length > 0 && task.type === 'todo') {
    // In _calculateDelta, a user completing a To-Do earns more points for more completed checklist items.
    // So here, when a user unticks a To-Do, they must lose more points for more completed checklist items.
    nextDelta *= 1 + _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
  }

  return nextDelta;
}

// Adjust user's MP up / down when:
// - user does positive / negative Habits
// - user ticks / unticks Dailies and To-Dos
function _gainMP (user, val) {
  val *= user._tmp.crit || 1;
  user.stats.mp += val;

  if (user.stats.mp >= user._statsComputed.maxMP) user.stats.mp = user._statsComputed.maxMP;
  if (user.stats.mp < 0) {
    user.stats.mp = 0;
  }
}

// Decrease user's health when:
// - user does negative Habits
// - cron finds uncompleted Dailies
function _subtractPoints (user, task, stats, delta) {
  let conBonus = 1 - user._statsComputed.con / 250; // CON decreases HP loss
  if (conBonus < 0.1) conBonus = 0.1;

  let hpMod = delta * conBonus * task.priority * 2; // constant 2 multiplier for better results
  stats.hp += Math.round(hpMod * 10) / 10;
  return stats.hp;
}

// Adjust user's stats (XP, GP) up or down:
// - up when doing positive Habits and completing Dailies and To-Dos
// - down when unticking previously-completed Dailies and To-Dos (e.g., after accidental completion).
function _addPoints (user, task, stats, direction, delta) {
  // allow critical hit only when checking off a task, not when unchecking it:
  let _crit = direction === 'up' ? crit(user) : 1;
  // if there was a crit, alert the user via notification
  if (_crit > 1) user._tmp.crit = _crit;

  let intBonus = 1 + user._statsComputed.int * 0.025; // INT increases XP gain
  stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);

  let perBonus = 1 + user._statsComputed.per * 0.02; // PER increases GP gain
  let gpMod = delta * task.priority * _crit * perBonus;

  if (task.streak) { // streak increases GP gain
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
  if (task.type === 'reward') return 0;
  let addToDelta = 0;

  // If multiple days have passed, multiply times days missed
  _.times(times, () => {
    // Each iteration calculates a change in task value, which is then accumulated in the total delta.
    addToDelta += !cron && direction === 'down' ? _calculateReverseDelta(task) : _calculateDelta(task, direction, cron);
  });
  // _calculateReverseDelta is used when:
  //     - a user (not cron) unticks a previously-completed Daily or To-Do (value goes down, more negative, more red)
  //     - a user (not cron) clicks a Habit's negative button (down)
  // _calculateDelta is used when:
  //     - a user ticks a Daily or To-Do (up, more positive, more blue)
  //     - a user clicks a Habit's positive button (up)
  //     - cron processes a completed Daily (up) or and uncompleted Daily (down) or an uncompleted To-Do (down)
  //     - cron processes a Habit (moves it up or down towards yellow)

  task.value += addToDelta;

  if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased') {
    user.stats.training[task.attribute] += addToDelta;
  }

  if (direction === 'up') { // Make progress on quest based on STR
    user.party.quest.progress.up = user.party.quest.progress.up || 0;
    // TODO reverse this on 'down' https://github.com/HabitRPG/habitrpg/issues/5648

    if (task.type === 'todo' || task.type === 'daily') {
      user.party.quest.progress.up += nextDelta * (1 + user._statsComputed.str / 200);
    } else if (task.type === 'habit') {
      user.party.quest.progress.up += nextDelta * (0.5 + user._statsComputed.str / 400);
    }
  }

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

  // Change the task's value (up or down)
  // Record the amount of change to use for calculating user stat changes
  if (task.type !== 'reward') delta += _changeTaskValue(user, task, direction, times, cron);

  // Adjust tasks in other ways
  // Calculate user stat changes (MP is done later)
  if (task.type === 'habit') {
    if (delta > 0) {
      _addPoints(user, task, stats, direction, delta);
    } else {
      _subtractPoints(user, task, stats, delta);
    }

    // Add history entry, even more than 1 per day
    task.history = task.history || [];
    task.history.push({
      date: Number(new Date()),
      value: task.value,
    });

  } else if (task.type === 'daily') {
    if (cron) {
      _subtractPoints(user, task, stats, delta);
      if (!user.stats.buffs.streaks) task.streak = 0;
    } else {
      if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
      _addPoints(user, task, stats, direction, delta); // obviously for delta>0, but also a trick to undo accidental checkboxes

      if (direction === 'up') {
        task.streak += 1;
        // Give a streak achievement when the streak is a multiple of 21
        if (task.streak % 21 === 0) user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
        // TODO https://github.com/HabitRPG/habitrpg/issues/2578 Zero-day streak gives achievement (also adjust achievement subtraction below)
        task.completed = true;
      } else if (direction === 'down') {
        // Remove a streak achievement if streak was a multiple of 21 and the daily was undone
        if (task.streak % 21 === 0) user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
        task.streak -= 1;
        task.completed = false;
      }
    }

  } else if (task.type === 'todo' && !cron) { // don't touch stats on cron
    if (direction === 'up') {
      task.dateCompleted = new Date();
      task.completed = true;
    } else if (direction === 'down') {
      task.completed = false;
      task.dateCompleted = undefined;
    }

    if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
    _addPoints(user, task, stats, direction, delta);

  } else if (task.type === 'reward') {
    // Don't adjust values for rewards
    // If they're trying to purchase a too-expensive reward, don't allow them to do that.
    if (task.value > user.stats.gp) throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
    // purchase item
    stats.gp -= Math.abs(task.value);
  }

  // User gains / loses MP for their 'up' / 'down' actions on tasks
  // Must be done after other stat changes, because INT affects maxMP
  // TODO refactor - put all/most in _gainMP; pass in task / task.type; extract numbers out to variables
  if (!cron) {
    if (task.type === 'habit') {
      _gainMP(user, _.max([0.25, 0.0025 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
    } else if (task.type === 'daily') {
      _gainMP(user, _.max([1, 0.01 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
    } else if (task.type === 'todo' && !cron) { // don't touch stats on cron
      // MP++ per checklist item in ToDo, bonus per CLI
      let multiplier = _.max([_.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 1), 1]);
      _gainMP(user, _.max([multiplier, 0.01 * user._statsComputed.maxMP * multiplier]) * (direction === 'down' ? -1 : 1));
    }
  }

  updateStats(user, stats, req);
  return [delta];
};
