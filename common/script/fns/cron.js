import moment from 'moment';
import _ from 'lodash';
import {
  daysSince,
  shouldDo,
} from '../cron';
import {
  capByLevel,
  toNextLevel,
} from '../statHelpers';
/*
  ------------------------------------------------------
  Cron
  ------------------------------------------------------
 */

/*
  At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  For incomplete Dailys, deduct experience
  Make sure to run this function once in a while as server will not take care of overnight calculations.
  And you have to run it every time client connects.
  {user}
 */

module.exports = function(user, options) {
  var _progress, analyticsData, base, base1, base2, base3, base4, clearBuffs, dailyChecked, dailyDueUnchecked, daysMissed, expTally, lvl, lvlDiv2, multiDaysCountAsOneDay, now, perfect, plan, progress, ref, ref1, ref2, ref3, todoTally, timezoneOffsetFromUserPrefs, timezoneOffsetFromBrowser, timezoneOffsetAtLastCron;
  if (options == null) {
    options = {};
  }
  now = +options.now || +(new Date);

  // If the user's timezone has changed (due to travel or daylight savings),
  // cron can be triggered twice in one day, so we check for that and use
  // both timezones to work out if cron should run.
  // CDS = Custom Day Start time.
  timezoneOffsetFromUserPrefs = user.preferences.timezoneOffset || 0;
  timezoneOffsetAtLastCron = (_.isFinite(user.preferences.timezoneOffsetAtLastCron)) ? user.preferences.timezoneOffsetAtLastCron : timezoneOffsetFromUserPrefs;
  timezoneOffsetFromBrowser = (_.isFinite(+options.timezoneOffset)) ? +options.timezoneOffset : timezoneOffsetFromUserPrefs;
  // NB: All timezone offsets can be 0, so can't use `... || ...` to apply non-zero defaults

  if (timezoneOffsetFromBrowser !== timezoneOffsetFromUserPrefs) {
    // The user's browser has just told Habitica that the user's timezone has
    // changed so store and use the new zone.
    user.preferences.timezoneOffset = timezoneOffsetFromBrowser;
    timezoneOffsetFromUserPrefs = timezoneOffsetFromBrowser;
  }

  // How many days have we missed using the user's current timezone:
  daysMissed = daysSince(user.lastCron, _.defaults({
    now: now
  }, user.preferences));

  if (timezoneOffsetAtLastCron != timezoneOffsetFromUserPrefs) {
    // Since cron last ran, the user's timezone has changed.
    // How many days have we missed using the old timezone:
    let daysMissedNewZone = daysMissed;
    let daysMissedOldZone = daysSince(user.lastCron, _.defaults({
      now: now,
      timezoneOffsetOverride: timezoneOffsetAtLastCron,
    }, user.preferences));

    if (timezoneOffsetAtLastCron < timezoneOffsetFromUserPrefs) {
      // The timezone change was in the unsafe direction.
      // E.g., timezone changes from UTC+1 (offset -60) to UTC+0 (offset 0).
      //    or timezone changes from UTC-4 (offset 240) to UTC-5 (offset 300).
      // Local time changed from, for example, 03:00 to 02:00.

      if (daysMissedOldZone > 0 && daysMissedNewZone > 0) {
        // Both old and new timezones indicate that we SHOULD run cron, so
        // it is safe to do so immediately.
        daysMissed = Math.min(daysMissedOldZone, daysMissedNewZone);
        // use minimum value to be nice to user
      }
      else if (daysMissedOldZone > 0) {
        // The old timezone says that cron should run; the new timezone does not.
        // This should be impossible for this direction of timezone change, but
        // just in case I'm wrong...
        console.log("zone has changed - old zone says run cron, NEW zone says no - stop cron now only -- SHOULD NOT HAVE GOT TO HERE", timezoneOffsetAtLastCron, timezoneOffsetFromUserPrefs, now); // used in production for confirming this never happens
      }
      else if (daysMissedNewZone > 0) {
        // The old timezone says that cron should NOT run -- i.e., cron has
        // already run today, from the old timezone's point of view.
        // The new timezone says that cron SHOULD run, but this is almost
        // certainly incorrect.
        // This happens when cron occurred at a time soon after the CDS. When
        // you reinterpret that time in the new timezone, it looks like it
        // was before the CDS, because local time has stepped backwards.
        // To fix this, rewrite the cron time to a time that the new
        // timezone interprets as being in today.

        daysMissed = 0; // prevent cron running now
        let timezoneOffsetDiff = timezoneOffsetAtLastCron - timezoneOffsetFromUserPrefs;
        // e.g., for dangerous zone change: 240 - 300 = -60 or  -660 - -600 = -60

        user.lastCron = moment(user.lastCron).subtract(timezoneOffsetDiff, 'minutes');
        // NB: We don't change user.auth.timestamps.loggedin so that will still record the time that the previous cron actually ran.
        // From now on we can ignore the old timezone:
        user.preferences.timezoneOffsetAtLastCron = timezoneOffsetFromUserPrefs;
      }
      else {
        // Both old and new timezones indicate that cron should
        // NOT run.
        daysMissed = 0; // prevent cron running now
      }
    }
    else if (timezoneOffsetAtLastCron > timezoneOffsetFromUserPrefs) {
      daysMissed = daysMissedNewZone;
      // TODO: Either confirm that there is nothing that could possibly go wrong here and remove the need for this else branch, or fix stuff. There are probably situations where the Dailies do not reset early enough for a user who was expecting the zone change and wants to use all their Dailies immediately in the new zone; if so, we should provide an option for easy reset of Dailies (can't be automatic because there will be other situations where the user was not prepared).
    }
  }

  if (!(daysMissed > 0)) {
    return;
  }
  user.auth.timestamps.loggedin = new Date();
  user.lastCron = now;
  user.preferences.timezoneOffsetAtLastCron = timezoneOffsetFromUserPrefs;
  if (user.items.lastDrop.count > 0) {
    user.items.lastDrop.count = 0;
  }
  perfect = true;
  clearBuffs = {
    str: 0,
    int: 0,
    per: 0,
    con: 0,
    stealth: 0,
    streaks: false
  };
  plan = (ref = user.purchased) != null ? ref.plan : void 0;
  if (plan != null ? plan.customerId : void 0) {
    if (typeof plan.dateUpdated === "undefined") {
      // partial compensation for bug in subscription creation - https://github.com/HabitRPG/habitrpg/issues/6682
      plan.dateUpdated = new Date();
    }
    if (moment(plan.dateUpdated).format('MMYYYY') !== moment().format('MMYYYY')) {
      plan.gemsBought = 0;
      plan.dateUpdated = new Date();
      _.defaults(plan.consecutive, {
        count: 0,
        offset: 0,
        trinkets: 0,
        gemCapExtra: 0
      });
      plan.consecutive.count++;
      if (plan.consecutive.offset > 0) {
        plan.consecutive.offset--;
      } else if (plan.consecutive.count % 3 === 0) {
        plan.consecutive.trinkets++;
        plan.consecutive.gemCapExtra += 5;
        if (plan.consecutive.gemCapExtra > 25) {
          plan.consecutive.gemCapExtra = 25;
        }
      }
    }
    if (plan.dateTerminated && moment(plan.dateTerminated).isBefore(+(new Date))) {
      _.merge(plan, {
        planId: null,
        customerId: null,
        paymentMethod: null
      });
      _.merge(plan.consecutive, {
        count: 0,
        offset: 0,
        gemCapExtra: 0
      });
      if (typeof user.markModified === "function") {
        user.markModified('purchased.plan');
      }
    }
  }
  if (user.preferences.sleep === true) {
    user.stats.buffs = clearBuffs;
    user.dailys.forEach(function(daily) {
      var completed, repeat, thatDay;
      completed = daily.completed, repeat = daily.repeat;
      thatDay = moment(now).subtract({
        days: 1
      });
      if (shouldDo(thatDay.toDate(), daily, user.preferences) || completed) {
        _.each(daily.checklist, (function(box) {
          box.completed = false;
          return true;
        }));
      }
      return daily.completed = false;
    });
    return;
  }
  multiDaysCountAsOneDay = true;
  todoTally = 0;
  user.todos.forEach(function(task) {
    var absVal, completed, delta, id;
    if (!task) {
      return;
    }
    id = task.id, completed = task.completed;
    delta = user.ops.score({
      params: {
        id: task.id,
        direction: 'down'
      },
      query: {
        times: multiDaysCountAsOneDay != null ? multiDaysCountAsOneDay : {
          1: daysMissed
        },
        cron: true
      }
    });
    absVal = completed ? Math.abs(task.value) : task.value;
    return todoTally += absVal;
  });
  dailyChecked = 0;
  dailyDueUnchecked = 0;
  if ((base = user.party.quest.progress).down == null) {
    base.down = 0;
  }
  user.dailys.forEach(function(task) {
    var EvadeTask, completed, delta, fractionChecked, id, j, n, ref1, ref2, scheduleMisses, thatDay;
    if (!task) {
      return;
    }
    id = task.id, completed = task.completed;
    EvadeTask = 0;
    scheduleMisses = daysMissed;
    if (completed) {
      dailyChecked += 1;
    } else {
      scheduleMisses = 0;
      for (n = j = 0, ref1 = daysMissed; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
        thatDay = moment(now).subtract({
          days: n + 1
        });
        if (shouldDo(thatDay.toDate(), task, user.preferences)) {
          scheduleMisses++;
          if (user.stats.buffs.stealth) {
            user.stats.buffs.stealth--;
            EvadeTask++;
          }
          if (multiDaysCountAsOneDay) {
            break;
          }
        }
      }
      if (scheduleMisses > EvadeTask) {
        perfect = false;
        if (((ref2 = task.checklist) != null ? ref2.length : void 0) > 0) {
          fractionChecked = _.reduce(task.checklist, (function(m, i) {
            return m + (i.completed ? 1 : 0);
          }), 0) / task.checklist.length;
          dailyDueUnchecked += 1 - fractionChecked;
          dailyChecked += fractionChecked;
        } else {
          dailyDueUnchecked += 1;
        }
        delta = user.ops.score({
          params: {
            id: task.id,
            direction: 'down'
          },
          query: {
            times: multiDaysCountAsOneDay != null ? multiDaysCountAsOneDay : {
              1: scheduleMisses - EvadeTask
            },
            cron: true
          }
        });
        user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
      }
    }
    (task.history != null ? task.history : task.history = []).push({
      date: +(new Date),
      value: task.value
    });
    task.completed = false;
    if (completed || (scheduleMisses > 0)) {
      return _.each(task.checklist, (function(i) {
        i.completed = false;
        return true;
      }));
    }
  });
  user.habits.forEach(function(task) {
    if (task.up === false || task.down === false) {
      if (Math.abs(task.value) < 0.1) {
        return task.value = 0;
      } else {
        return task.value = task.value / 2;
      }
    }
  });
  ((base1 = (user.history != null ? user.history : user.history = {})).todos != null ? base1.todos : base1.todos = []).push({
    date: now,
    value: todoTally
  });
  expTally = user.stats.exp;
  lvl = 0;
  while (lvl < (user.stats.lvl - 1)) {
    lvl++;
    expTally += toNextLevel(lvl);
  }
  ((base2 = user.history).exp != null ? base2.exp : base2.exp = []).push({
    date: now,
    value: expTally
  });
  if (!((ref1 = user.purchased) != null ? (ref2 = ref1.plan) != null ? ref2.customerId : void 0 : void 0)) {
    user.fns.preenUserHistory();
    if (typeof user.markModified === "function") {
      user.markModified('history');
    }
    if (typeof user.markModified === "function") {
      user.markModified('dailys');
    }
  }
  user.stats.buffs = perfect ? ((base3 = user.achievements).perfect != null ? base3.perfect : base3.perfect = 0, user.achievements.perfect++, lvlDiv2 = Math.ceil(capByLevel(user.stats.lvl) / 2), {
    str: lvlDiv2,
    int: lvlDiv2,
    per: lvlDiv2,
    con: lvlDiv2,
    stealth: 0,
    streaks: false
  }) : clearBuffs;
  if (dailyDueUnchecked === 0 && dailyChecked === 0) {
    dailyChecked = 1;
  }
  user.stats.mp += _.max([10, .1 * user._statsComputed.maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
  if (user.stats.mp > user._statsComputed.maxMP) {
    user.stats.mp = user._statsComputed.maxMP;
  }
  progress = user.party.quest.progress;
  _progress = _.cloneDeep(progress);
  _.merge(progress, {
    down: 0,
    up: 0
  });
  progress.collect = _.transform(progress.collect, (function(m, v, k) {
    return m[k] = 0;
  }));
  if ((base4 = user.flags).cronCount == null) {
    base4.cronCount = 0;
  }
  user.flags.cronCount++;
  analyticsData = {
    category: 'behavior',
    gaLabel: 'Cron Count',
    gaValue: user.flags.cronCount,
    uuid: user._id,
    user: user,
    resting: user.preferences.sleep,
    cronCount: user.flags.cronCount,
    progressUp: _.min([_progress.up, 900]),
    progressDown: _progress.down
  };
  if ((ref3 = options.analytics) != null) {
    ref3.track('Cron', analyticsData);
  }
  return _progress;
};
