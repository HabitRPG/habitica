import find from 'lodash/find';
import timesLodash from 'lodash/times';
import reduce from 'lodash/reduce';
import moment from 'moment';
import max from 'lodash/max';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';
import i18n from '../i18n';
import updateStats from '../fns/updateStats';
import crit from '../fns/crit';
import getUtcOffset from '../fns/getUtcOffset';

import statsComputed from '../libs/statsComputed';
import { checkOnboardingStatus } from '../libs/onboarding';

const MAX_TASK_VALUE = 21.27;
const MIN_TASK_VALUE = -47.27;
const CLOSE_ENOUGH = 0.00001;

function _getTaskValue (taskValue) {
  if (taskValue < MIN_TASK_VALUE) {
    return MIN_TASK_VALUE;
  } if (taskValue > MAX_TASK_VALUE) {
    return MAX_TASK_VALUE;
  }
  return taskValue;
}

// Calculates the next task.value based on direction
// Uses a capped inverse log y=.95^x, y>= -5
function _calculateDelta (task, direction, cron) {
  // Min/max on task redness
  const currVal = _getTaskValue(task.value);
  let nextDelta = (0.9747 ** currVal) * (direction === 'down' ? -1 : 1);

  // Checklists
  if (task.checklist && task.checklist.length > 0) {
    // If the Daily, only dock them a portion based on their checklist completion
    if (direction === 'down' && task.type === 'daily' && cron) {
      nextDelta *= 1 - reduce(
        task.checklist,
        (m, i) => m + (i.completed ? 1 : 0),
        0,
      ) / task.checklist.length;
    }

    // If To Do, point-match the TD per checklist item completed
    if (task.type === 'todo' && !cron) {
      nextDelta *= 1 + reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
    }
  }

  return nextDelta;
}

// Approximates the reverse delta for the task value
// This is meant to return the task value to its original value when unchecking a task.
// First, calculate the value using the normal way for our first guess although
// it will be a bit off
function _calculateReverseDelta (task, direction) {
  const currVal = _getTaskValue(task.value);
  let testVal = currVal + (0.9747 ** currVal) * (direction === 'down' ? -1 : 1);

  // Now keep moving closer to the original value until we get "close enough"
  // Check how close we are to the original value by computing the delta off our guess
  // and looking at the difference between that and our current value.
  while (true) { // eslint-disable-line no-constant-condition
    const calc = testVal + (0.9747 ** testVal);
    const diff = currVal - calc;

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

  // Checklists - If To Do, point-match the TD per checklist item completed
  if (task.checklist && task.checklist.length > 0 && task.type === 'todo') {
    nextDelta *= 1 + reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0);
  }

  return nextDelta;
}

function _gainMP (user, val) {
  val *= user._tmp.crit || 1; // eslint-disable-line no-param-reassign
  user.stats.mp += val;

  if (user.stats.mp >= statsComputed(user).maxMP) user.stats.mp = statsComputed(user).maxMP;
  if (user.stats.mp < 0) {
    user.stats.mp = 0;
  }
}

// HP modifier
// ===== CONSTITUTION =====
// TODO Decreases HP loss from bad habits / missed dailies by 0.5% per point.
function _subtractPoints (user, task, stats, delta) {
  if (task.group.id && task.type === 'daily') return stats.hp;
  let conBonus = 1 - statsComputed(user).con / 250;
  if (conBonus < 0.1) conBonus = 0.1;

  const hpMod = delta * conBonus * task.priority * 2; // constant 2 multiplier for better results
  stats.hp += Math.round(hpMod * 10) / 10; // round to 1dp
  return stats.hp;
}

function _addPoints (user, task, stats, direction, delta) {
  const _crit = user._tmp.crit || 1;

  // Exp Modifier
  // ===== Intelligence =====
  // TODO Increases Experience gain by .2% per point.
  const intBonus = 1 + statsComputed(user).int * 0.025;
  stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);

  // GP modifier
  // ===== PERCEPTION =====
  // TODO Increases Gold gained from tasks by .3% per point.
  const perBonus = 1 + statsComputed(user).per * 0.02;
  const gpMod = delta * task.priority * _crit * perBonus;

  if (task.streak) {
    const currStreak = direction === 'down' ? task.streak - 1 : task.streak;
    const streakBonus = currStreak / 100 + 1; // eg, 1-day streak is 1.01, 2-day is 1.02, etc
    const afterStreak = gpMod * streakBonus;
    if (currStreak > 0 && gpMod > 0) {
      // keep this on-hand for later, so we can notify streak-bonus
      user._tmp.streakBonus = afterStreak - gpMod;
    }

    stats.gp += afterStreak;
  } else {
    stats.gp += gpMod;
  }
}

function _changeTaskValue (user, task, direction, times, cron) {
  let addToDelta = 0;

  // ===== CRITICAL HITS =====
  // allow critical hit only when checking off a task, not when unchecking it:
  const _crit = direction === 'up' ? crit.crit(user) : 1;
  // if there was a crit, alert the user via notification
  if (_crit > 1) user._tmp.crit = _crit;

  // If multiple days have passed, multiply times days missed
  timesLodash(times, () => {
    // Each iteration calculate the nextDelta, which is then accumulated in the total delta.
    const nextDelta = !cron && direction === 'down' ? _calculateReverseDelta(task, direction) : _calculateDelta(task, direction, cron);

    if (task.type !== 'reward') {
      if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased' && !(task.type === 'todo' && direction === 'down')) {
        user.stats.training[task.attribute] += nextDelta;
      }

      if (direction === 'up') { // Make progress on quest based on STR
        user.party.quest.progress.up = user.party.quest.progress.up || 0;
        const prevProgress = user.party.quest.progress.up;

        if (task.type === 'todo' || task.type === 'daily') {
          user.party.quest.progress.up += nextDelta * _crit * (1 + statsComputed(user).str / 200);
        } else if (task.type === 'habit') {
          user.party.quest.progress.up += nextDelta * _crit * (0.5 + statsComputed(user).str / 400);
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

function _updateCounter (task, direction, times) {
  if (direction === 'up') {
    task.counterUp += times;
  } else {
    task.counterDown += times;
  }
}

function _lastHistoryEntryWasToday (lastHistoryEntry, user) {
  if (!lastHistoryEntry || !lastHistoryEntry.date) {
    return false;
  }

  const timezoneUtcOffset = getUtcOffset(user);
  const { dayStart } = user.preferences;

  // Adjust the last entry date according to the user's timezone and CDS
  const dateWithTimeZone = moment(lastHistoryEntry.date).utcOffset(timezoneUtcOffset);
  if (dateWithTimeZone.hour() < dayStart) dateWithTimeZone.subtract(1, 'day');

  return moment().utcOffset(timezoneUtcOffset).isSame(dateWithTimeZone, 'day');
}

function _updateLastHistoryEntry (lastHistoryEntry, task, direction, times) {
  lastHistoryEntry.value = task.value;
  lastHistoryEntry.date = Number(new Date());

  // @TODO remove this extra check after migration
  // has run to set scoredUp and scoredDown in every task
  lastHistoryEntry.scoredUp = lastHistoryEntry.scoredUp || 0;
  lastHistoryEntry.scoredDown = lastHistoryEntry.scoredDown || 0;

  if (direction === 'up') {
    lastHistoryEntry.scoredUp += times;
  } else {
    lastHistoryEntry.scoredDown += times;
  }
}

export default function scoreTask (options = {}, req = {}, analytics) {
  const {
    user, task, direction, times = 1, cron = false,
  } = options;
  let delta = 0;
  const stats = {
    gp: user.stats.gp,
    hp: user.stats.hp,
    exp: user.stats.exp,
  };

  // This is for setting one-time temporary flags,
  // such as streakBonus or itemDropped. Useful for notifying
  // the API consumer, then cleared afterwards
  // Keep user._tmp.leveledUp if it already exists
  // To make sure infos on level ups don't get lost when bulk scoring multiple tasks
  const oldLeveledUp = user._tmp && user._tmp.leveledUp;
  user._tmp = {};

  if (oldLeveledUp) user._tmp.leveledUp = oldLeveledUp;

  // Thanks to open group tasks, userId is not guaranteed. Don't allow scoring inaccessible tasks
  if (task.userId && task.userId !== user._id) {
    throw new BadRequest('Cannot score task belonging to another user.');
  } else if (task.group.id && user.guilds.indexOf(task.group.id) === -1
    && user.party._id !== task.group.id) {
    throw new BadRequest('Cannot score task belonging to another user.');
  }
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
    _gainMP(user, max([0.25, 0.0025 * statsComputed(user).maxMP]) * (direction === 'down' ? -1 : 1));

    // Save history entry for habit
    task.history = task.history || [];
    const historyLength = task.history.length;
    const lastHistoryEntry = task.history[historyLength - 1];

    if (_lastHistoryEntryWasToday(lastHistoryEntry, user)) {
      _updateLastHistoryEntry(lastHistoryEntry, task, direction, times);
      if (task.markModified) {
        task.markModified(`history.${historyLength - 1}`);
      }
    } else {
      task.history.push({
        date: Number(new Date()),
        value: task.value,
        scoredUp: direction === 'up' ? 1 : 0,
        scoredDown: direction === 'down' ? 1 : 0,
      });
    }

    _updateCounter(task, direction, times);
  } else if (task.type === 'daily') {
    if (cron) {
      delta += _changeTaskValue(user, task, direction, times, cron);
      _subtractPoints(user, task, stats, delta);
      // Chilling frost should not affect challenge or group dailies
      if (!user.stats.buffs.streaks || task.challenge.id || task.group.id) task.streak = 0;
    } else {
      delta += _changeTaskValue(user, task, direction, times, cron);
      if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
      // obviously for delta>0, but also a trick to undo accidental checkboxes
      _addPoints(user, task, stats, direction, delta);
      _gainMP(user, max([1, 0.01 * statsComputed(user).maxMP]) * (direction === 'down' ? -1 : 1));

      if (direction === 'up') {
        if (task.group.id) {
          if (!task.group.assignedUsers || task.group.assignedUsers.length === 0) {
            task.group.completedBy = {
              userId: user._id,
              date: new Date(),
            };
            task.completed = true;
            task.streak += 1;
          } else {
            task.group.assignedUsersDetail[user._id].completed = true;
            task.group.assignedUsersDetail[user._id].completedDate = new Date();
            if (!find(task.group.assignedUsersDetail, assignedUser => !assignedUser.completed)) {
              task.dateCompleted = new Date();
              task.completed = true;
              task.streak += 1;
            }
          }
          if (task.markModified) task.markModified('group');
        } else {
          task.streak += 1;
          // Give a streak achievement when the streak is a multiple of 21
          if (task.streak !== 0 && task.streak % 21 === 0) {
            user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
            if (user.addNotification) user.addNotification('STREAK_ACHIEVEMENT');
          }
          task.completed = true;

          // Save history entry for daily
          task.history = task.history || [];
          const historyEntry = {
            date: Number(new Date()),
            value: task.value,
            isDue: task.isDue,
            completed: true,
          };
          task.history.push(historyEntry);
        }
      } else if (direction === 'down') {
        if (task.group.id) {
          if (!task.group.assignedUsersDetail
            || !find(task.group.assignedUsersDetail, assignedUser => !assignedUser.completed)
          ) {
            task.streak -= 1;
            task.completed = false;
          }
          if (task.group.completedBy) task.group.completedBy = {};
          if (task.group.assignedUsersDetail && task.group.assignedUsersDetail[user._id]) {
            task.group.assignedUsersDetail[user._id].completed = false;
            task.group.assignedUsersDetail[user._id].completedDate = undefined;
          }
          if (task.markModified) task.markModified('group');
        } else {
          // Remove a streak achievement if streak was a multiple of 21 and the daily was undone
          if (task.streak !== 0 && task.streak % 21 === 0) {
            user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
          }
          task.streak -= 1;
          task.completed = false;

          // Delete history entry when daily unchecked
          if (task.history || task.history.length > 0) {
            task.history.splice(-1, 1);
          }
        }
      }
    }
  } else if (task.type === 'todo') {
    if (cron) { // don't touch stats on cron
      delta += _changeTaskValue(user, task, direction, times, cron);
    } else {
      if (direction === 'up') {
        if (task.group.id) {
          if (!task.group.assignedUsers || task.group.assignedUsers.length === 0) {
            task.group.completedBy = {
              userId: user._id,
              date: new Date(),
            };
            task.completed = true;
          } else {
            task.group.assignedUsersDetail[user._id].completed = true;
            task.group.assignedUsersDetail[user._id].completedDate = new Date();
            if (!find(task.group.assignedUsersDetail, assignedUser => !assignedUser.completed)) {
              task.dateCompleted = new Date();
              task.completed = true;
            }
          }
          if (task.markModified) task.markModified('group');
        } else {
          task.dateCompleted = new Date();
          task.completed = true;
        }
      } else if (direction === 'down') {
        task.completed = false;
        task.dateCompleted = undefined;
        if (task.group.id) {
          if (task.group.completedBy) task.group.completedBy = {};
          if (task.group.assignedUsersDetail && task.group.assignedUsersDetail[user._id]) {
            task.group.assignedUsersDetail[user._id].completed = false;
            task.group.assignedUsersDetail[user._id].completedDate = undefined;
          }
          if (task.markModified) task.markModified('group');
        }
      }

      delta += _changeTaskValue(user, task, direction, times, cron);
      if (direction === 'down') delta = _calculateDelta(task, direction, cron); // recalculate delta for unchecking so the gp and exp come out correctly
      _addPoints(user, task, stats, direction, delta);

      // MP++ per checklist item in ToDo, bonus per CLI
      const multiplier = max([reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 1), 1]);
      _gainMP(user, max([multiplier, 0.01 * statsComputed(user).maxMP * multiplier]) * (direction === 'down' ? -1 : 1));
    }
  } else if (task.type === 'reward') {
    // Don't adjust values for rewards
    delta += _changeTaskValue(user, task, direction, times, cron);
    // purchase item
    stats.gp -= task.value;
  }

  req.yesterDailyScored = task.yesterDailyScored;
  updateStats(user, stats, req);

  if (!user.achievements.completedTask && cron === false && direction === 'up' && user.addAchievement) {
    user.addAchievement('completedTask');
    checkOnboardingStatus(user, req, analytics);
  }

  return delta;
}
