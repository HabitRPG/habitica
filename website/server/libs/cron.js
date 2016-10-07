import moment from 'moment';
import Bluebird from 'bluebird';
import { model as User } from '../models/user';
import common from '../../common/';
import { preenUserHistory } from '../libs/preening';
import _ from 'lodash';
import nconf from 'nconf';

const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';
const shouldDo = common.shouldDo;
const scoreTask = common.ops.scoreTask;
// const maxPMs = 200;

export async function recoverCron (status, locals) {
  let {user} = locals;

  await Bluebird.delay(300);

  let reloadedUser = await User.findOne({_id: user._id}).exec();

  if (!reloadedUser) {
    throw new Error(`User ${user._id} not found while recovering.`);
  } else if (reloadedUser._cronSignature !== 'NOT_RUNNING') {
    status.times++;

    if (status.times < 5) {
      await recoverCron(status, locals);
    } else {
      throw new Error(`Impossible to recover from cron for user ${user._id}.`);
    }
  } else {
    locals.user = reloadedUser;
    return null;
  }
}

let CLEAR_BUFFS = {
  str: 0,
  int: 0,
  per: 0,
  con: 0,
  stealth: 0,
  streaks: false,
};

function grantEndOfTheMonthPerks (user, now) {
  let plan = user.purchased.plan;
  let subscriptionEndDate = moment(plan.dateTerminated).isBefore() ? moment(plan.dateTerminated).startOf('month') : moment(now).startOf('month');
  let dateUpdatedMoment = moment(plan.dateUpdated).startOf('month');
  let elapsedMonths = moment(subscriptionEndDate).diff(dateUpdatedMoment, 'months');

  if (elapsedMonths > 0) {
    plan.dateUpdated = now;
    // For every month, inc their "consecutive months" counter. Give perks based on consecutive blocks
    // If they already got perks for those blocks (eg, 6mo subscription, subscription gifts, etc) - then dec the offset until it hits 0
    _.defaults(plan.consecutive, {count: 0, offset: 0, trinkets: 0, gemCapExtra: 0});

    for (let i = 0; i < elapsedMonths; i++) {
      plan.consecutive.count++;

      if (plan.consecutive.offset > 1) {
        plan.consecutive.offset--;
      } else if (plan.consecutive.count % 3 === 0) { // every 3 months
        if (plan.consecutive.offset === 1) plan.consecutive.offset--;
        plan.consecutive.trinkets++;
        plan.consecutive.gemCapExtra += 5;
        if (plan.consecutive.gemCapExtra > 25) plan.consecutive.gemCapExtra = 25; // cap it at 50 (hard 25 limit + extra 25)
      }
    }
  }
}

function removeTerminatedSubscription (user) {
  // If subscription's termination date has arrived
  let plan = user.purchased.plan;

  if (plan.dateTerminated && moment(plan.dateTerminated).isBefore(new Date())) {
    _.merge(plan, {
      planId: null,
      customerId: null,
      paymentMethod: null,
    });

    _.merge(plan.consecutive, {
      count: 0,
      offset: 0,
      gemCapExtra: 0,
    });

    user.markModified('purchased.plan');
  }
}

function performSleepTasks (user, tasksByType, now) {
  user.stats.buffs = _.cloneDeep(CLEAR_BUFFS);

  tasksByType.dailys.forEach((daily) => {
    let completed = daily.completed;
    let thatDay = moment(now).subtract({days: 1});

    if (shouldDo(thatDay.toDate(), daily, user.preferences) || completed) {
      // TODO also untick checklists if the Daily was due on previous missed days, if two or more days were missed at once -- https://github.com/HabitRPG/habitrpg/pull/7218#issuecomment-219256016
      if (daily.checklist) {
        daily.checklist.forEach(box => box.completed = false);
      }
    }

    daily.completed = false;
  });
}

// Perform various beginning-of-day reset actions.
export function cron (options = {}) {
  let {user, tasksByType, analytics, now = new Date(), daysMissed, timezoneOffsetFromUserPrefs} = options;

  // Record pre-cron values of HP and MP to show notifications later
  let beforeCronStats = _.pick(user.stats, ['hp', 'mp']);

  user.preferences.timezoneOffsetAtLastCron = timezoneOffsetFromUserPrefs;
  // User is only allowed a certain number of drops a day. This resets the count.
  if (user.items.lastDrop.count > 0) user.items.lastDrop.count = 0;

  // "Perfect Day" achievement for perfect days
  let perfect = true;

  // Reset Gold-to-Gems cap if it's the start of the month
  if (user.purchased && user.purchased.plan && moment(user.purchased.plan.dateUpdated).startOf('month') !== moment().startOf('month')) {
    user.purchased.plan.gemsBought = 0;
  }
  if (user.isSubscribed()) {
    grantEndOfTheMonthPerks(user, now);
    if (!CRON_SAFE_MODE) removeTerminatedSubscription(user);
  }

  // User is resting at the inn.
  // On cron, buffs are cleared and all dailies are reset without performing damage
  if (user.preferences.sleep === true) {
    performSleepTasks(user, tasksByType, now);
    return;
  }

  let multiDaysCountAsOneDay = true;
  // If the user does not log in for two or more days, cron (mostly) acts as if it were only one day.
  // When site-wide difficulty settings are introduced, this can be a user preference option.

  // Tally each task
  let todoTally = 0;

  tasksByType.todos.forEach(task => { // make uncompleted To-Dos redder (further incentive to complete them)
    scoreTask({
      task,
      user,
      direction: 'down',
      cron: true,
      times: multiDaysCountAsOneDay ? 1 : daysMissed,
    });

    todoTally += task.value;
  });

  // For incomplete Dailys, add value (further incentive), deduct health, keep records for later decreasing the nightly mana gain
  let dailyChecked = 0; // how many dailies were checked?
  let dailyDueUnchecked = 0; // how many dailies were un-checked?
  let atLeastOneDailyDue = false; // were any dailies due?
  if (!user.party.quest.progress.down) user.party.quest.progress.down = 0;

  tasksByType.dailys.forEach((task) => {
    let completed = task.completed;
    // Deduct points for missed Daily tasks
    let EvadeTask = 0;
    let scheduleMisses = daysMissed;

    if (completed) {
      dailyChecked += 1;
      if (!atLeastOneDailyDue) { // only bother checking until the first thing is found
        let thatDay = moment(now).subtract({days: daysMissed});
        atLeastOneDailyDue = shouldDo(thatDay.toDate(), task, user.preferences);
      }
    } else {
      // dailys repeat, so need to calculate how many they've missed according to their own schedule
      scheduleMisses = 0;

      for (let i = 0; i < daysMissed; i++) {
        let thatDay = moment(now).subtract({days: i + 1});

        if (shouldDo(thatDay.toDate(), task, user.preferences)) {
          atLeastOneDailyDue = true;
          scheduleMisses++;
          if (user.stats.buffs.stealth) {
            user.stats.buffs.stealth--;
            EvadeTask++;
          }
          if (multiDaysCountAsOneDay) break;
        }
      }

      if (scheduleMisses > EvadeTask) {
        // The user did not complete this due Daily (but no penalty if cron is running in safe mode).
        if (CRON_SAFE_MODE) {
          dailyChecked += 1; // allows full allotment of mp to be gained
        } else {
          perfect = false;

          if (task.checklist && task.checklist.length > 0) { // Partially completed checklists dock fewer mana points
            let fractionChecked = _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0) / task.checklist.length;
            dailyDueUnchecked += 1 - fractionChecked;
            dailyChecked += fractionChecked;
          } else {
            dailyDueUnchecked += 1;
          }

          let delta = scoreTask({
            user,
            task,
            direction: 'down',
            times: multiDaysCountAsOneDay ? 1 : scheduleMisses - EvadeTask,
            cron: true,
          });

          if (!CRON_SEMI_SAFE_MODE) {
            // Apply damage from a boss, less damage for Trivial priority (difficulty)
            user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
            // NB: Medium and Hard priorities do not increase damage from boss. This was by accident
            // initially, and when we realised, we could not fix it because users are used to
            // their Medium and Hard Dailies doing an Easy amount of damage from boss.
            // Easy is task.priority = 1. Anything < 1 will be Trivial (0.1) or any future
            // setting between Trivial and Easy.
          }
        }
      }
    }

    task.history.push({
      date: Number(new Date()),
      value: task.value,
    });
    task.completed = false;

    if (completed || scheduleMisses > 0) {
      if (task.checklist) {
        task.checklist.forEach(i => i.completed = false);
      }
    }
  });

  // move singleton Habits towards yellow.
  tasksByType.habits.forEach((task) => { // slowly reset 'onlies' value to 0
    if (task.up === false || task.down === false) {
      task.value = Math.abs(task.value) < 0.1 ? 0 : task.value = task.value / 2;
    }
  });

  // Finished tallying
  user.history.todos.push({date: now, value: todoTally});

  // tally experience
  let expTally = user.stats.exp;
  let lvl = 0; // iterator
  while (lvl < user.stats.lvl - 1) {
    lvl++;
    expTally += common.tnl(lvl);
  }

  user.history.exp.push({date: now, value: expTally});

  // preen user history so that it doesn't become a performance problem
  // also for subscribed users but differently
  // TODO also do while resting in the inn. Note that later we'll be allowing the value/color of tasks to change while sleeping (https://github.com/HabitRPG/habitrpg/issues/5232), so the code in performSleepTasks() might be best merged back into here for that. Perhaps wait until then to do preen history for sleeping users.
  preenUserHistory(user, tasksByType, user.preferences.timezoneOffset);

  if (perfect && atLeastOneDailyDue) {
    user.achievements.perfect++;
    let lvlDiv2 = Math.ceil(common.capByLevel(user.stats.lvl) / 2);
    user.stats.buffs = {
      str: lvlDiv2,
      int: lvlDiv2,
      per: lvlDiv2,
      con: lvlDiv2,
      stealth: 0,
      streaks: false,
    };
  } else {
    user.stats.buffs = _.cloneDeep(CLEAR_BUFFS);
  }

  // Add 10 MP, or 10% of max MP if that'd be more. Perform this after Perfect Day for maximum benefit
  // Adjust for fraction of dailies completed
  if (dailyDueUnchecked === 0 && dailyChecked === 0) dailyChecked = 1;
  user.stats.mp += _.max([10, 0.1 * user._statsComputed.maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
  if (user.stats.mp > user._statsComputed.maxMP) user.stats.mp = user._statsComputed.maxMP;

  // After all is said and done, progress up user's effect on quest, return those values & reset the user's
  let progress = user.party.quest.progress;
  let _progress = _.cloneDeep(progress);
  _.merge(progress, {down: 0, up: 0, collectedItems: 0});

  // Send notification for changes in HP and MP

  // First remove a possible previous cron notification
  // we don't want to flood the users with many cron notifications at once

  let oldCronNotif = user.notifications.toObject().find((notif, index) => {
    if (notif.type === 'CRON') {
      user.notifications.splice(index, 1);
      return true;
    } else {
      return false;
    }
  });

  user.addNotification('CRON', {
    hp: user.stats.hp - beforeCronStats.hp - (oldCronNotif ? oldCronNotif.data.hp : 0),
    mp: user.stats.mp - beforeCronStats.mp - (oldCronNotif ? oldCronNotif.data.mp : 0),
  });

  // TODO: Clean PMs - keep 200 for subscribers and 50 for free users. Should also be done while resting in the inn
  // let numberOfPMs = Object.keys(user.inbox.messages).length;
  // if (numberOfPMs > maxPMs) {
  //   _(user.inbox.messages)
  //     .sortBy('timestamp')
  //     .takeRight(numberOfPMs - maxPMs)
  //     .each(pm => {
  //       delete user.inbox.messages[pm.id];
  //     }).value();
  //
  //   user.markModified('inbox.messages');
  // }

  // Analytics
  user.flags.cronCount++;
  analytics.track('Cron', { // TODO also do while resting in the inn. https://github.com/HabitRPG/habitrpg/issues/7161#issuecomment-218214191
    category: 'behavior',
    gaLabel: 'Cron Count',
    gaValue: user.flags.cronCount,
    uuid: user._id,
    user,
    resting: user.preferences.sleep,
    cronCount: user.flags.cronCount,
    progressUp: _.min([_progress.up, 900]),
    progressDown: _progress.down,
    headers: options.headers,
  });

  return _progress;
}
