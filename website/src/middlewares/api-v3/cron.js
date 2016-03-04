import _ from 'lodash';
import moment from 'moment';
import {
  daysSince,
  shouldDo,
} from '../../../../common/script/cron';
import common from '../../../../common';
import Task from '../../models/task';
import Q from 'q';
import Group from '../../models/group';
import User from '../../models/user';
import scoreTask from '../../../../common/script/api-v3/scoreTask';
import { preenUserHistory } from '../../libs/api-v3/preening';

let clearBuffs = {
  str: 0,
  int: 0,
  per: 0,
  con: 0,
  stealth: 0,
  streaks: false,
};

// At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
// For incomplete Dailys, deduct experience
// Make sure to run this function once in a while as server will not take care of overnight calculations.
// And you have to run it every time client connects.
export function cron (options = {}) {
  let {user, tasksByType, analytics, now, daysMissed} = options;

  user.auth.timestamps.loggedin = now;
  user.lastCron = now;
  // Reset the lastDrop count to zero
  if (user.items.lastDrop.count > 0) user.items.lastDrop.count = 0;

  // "Perfect Day" achievement for perfect-days
  let perfect = true;

  // end-of-month perks for subscribers
  let plan = user.purchased.plan;
  if (user.isSubscribed()) {
    if (moment(plan.dateUpdated).format('MMYYYY') !== moment().format('MMYYYY')) {
      plan.gemsBought = 0; // reset gem-cap
      plan.dateUpdated = now;
      // For every month, inc their "consecutive months" counter. Give perks based on consecutive blocks
      // If they already got perks for those blocks (eg, 6mo subscription, subscription gifts, etc) - then dec the offset until it hits 0
      // TODO use month diff instead of ++ / --?
      _.defaults(plan.consecutive, {count: 0, offset: 0, trinkets: 0, gemCapExtra: 0}); // FIXME see https://github.com/HabitRPG/habitrpg/issues/4317
      plan.consecutive.count++;
      if (plan.consecutive.offset > 0) {
        plan.consecutive.offset--;
      } else if (plan.consecutive.count % 3 === 0) { // every 3 months
        plan.consecutive.trinkets++;
        plan.consecutive.gemCapExtra += 5;
        if (plan.consecutive.gemCapExtra > 25) plan.consecutive.gemCapExtra = 25; // cap it at 50 (hard 25 limit + extra 25)
      }
    }

    // If user cancelled subscription, we give them until 30day's end until it terminates
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

  // User is resting at the inn.
  // On cron, buffs are cleared and all dailies are reset without performing damage
  if (user.preferences.sleep === true) {
    user.stats.buffs = _.cloneDeep(clearBuffs);

    tasksByType.dailys.forEach((daily) => {
      let completed = daily.completed;
      let thatDay = moment(now).subtract({days: 1});

      if (shouldDo(thatDay.toDate(), daily, user.preferences) || completed) {
        daily.checklist.forEach(box => box.completed = false);
      }
      daily.completed = false;
    });

    return;
  }

  let multiDaysCountAsOneDay = true;
  // If the user does not log in for two or more days, cron (mostly) acts as if it were only one day.
  // When site-wide difficulty settings are introduced, this can be a user preference option.

  // Tally each task
  let todoTally = 0;

  tasksByType.todos.forEach(task => { // make uncompleted todos redder
    scoreTask({
      task,
      user,
      direction: 'down',
      cron: true,
      times: multiDaysCountAsOneDay ? 1 : daysMissed,
      // TODO pass req for analytics?
    });

    todoTally += task.value;
  });

  let dailyChecked = 0; // how many dailies were checked?
  let dailyDueUnchecked = 0; // how many dailies were cun-hecked?
  if (!user.party.quest.progress.down) user.party.quest.progress.down = 0;

  tasksByType.dailys.forEach((task) => {
    let completed = task.completed;
    // Deduct points for missed Daily tasks
    let EvadeTask = 0;
    let scheduleMisses = daysMissed;

    if (completed) {
      dailyChecked += 1;
    } else {
      // dailys repeat, so need to calculate how many they've missed according to their own schedule
      scheduleMisses = 0;

      for (let i = 0; i < daysMissed; i++) {
        let thatDay = moment(now).subtract({days: i + 1});

        if (shouldDo(thatDay.toDate(), task, user.preferences)) {
          scheduleMisses++;
          if (user.stats.buffs.stealth) {
            user.stats.buffs.stealth--;
            EvadeTask++;
          }
          if (multiDaysCountAsOneDay) break;
        }
      }

      if (scheduleMisses > EvadeTask) {
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

        // Apply damage from a boss, less damage for Trivial priority (difficulty)
        user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
        // NB: Medium and Hard priorities do not increase damage from boss. This was by accident
        // initially, and when we realised, we could not fix it because users are used to
        // their Medium and Hard Dailies doing an Easy amount of damage from boss.
        // Easy is task.priority = 1. Anything < 1 will be Trivial (0.1) or any future
        // setting between Trivial and Easy.
      }
    }

    task.history.push({
      date: Number(new Date()),
      value: task.value,
    });
    task.completed = false;

    if (completed || scheduleMisses > 0) {
      task.checklist.forEach(i => i.completed = true); // FIXME this should not happen for grey tasks unless they are completed
    }
  });

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
  // also for subscribed users but differentyly
  // premium subscribers can keep their full history.
  preenUserHistory(user, tasksByType, user.preferences.timezoneOffset);

  if (perfect) {
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
    user.stats.buffs = _.cloneDeep(clearBuffs);
  }

  // Add 10 MP, or 10% of max MP if that'd be more. Perform this after Perfect Day for maximum benefit
  // Adjust for fraction of dailies completed
  user.stats.mp += _.max([10, 0.1 * user._statsComputed.maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
  if (user.stats.mp > user._statsComputed.maxMP) user.stats.mp = user._statsComputed.maxMP;

  if (dailyDueUnchecked === 0 && dailyChecked === 0) dailyChecked = 1;
  user.stats.mp += _.max([10, 0.1 * user._statsComputed.maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
  if (user.stats.mp > user._statsComputed.maxMP) {
    user.stats.mp = user._statsComputed.maxMP;
  }

  // After all is said and done, progress up user's effect on quest, return those values & reset the user's
  let progress = user.party.quest.progress;
  let _progress = _.cloneDeep(progress);
  _.merge(progress, {down: 0, up: 0});
  progress.collect = _.transform(progress.collect, (m, v, k) => m[k] = 0);

  // Clean PMs - keep 200 for subscribers and 50 for free users
  // TODO tests
  let maxPMs = user.isSubscribed() ? 200 : 50; // TODO 200 limit for contributors too
  let numberOfPMs = Object.keys(user.inbox.messages).length;
  if (Object.keys(user.inbox.messages).length > maxPMs) {
    _(user.inbox.messages)
      .sortBy('timestamp')
      .takeRight(numberOfPMs - maxPMs)
      .each(pm => {
        user.inbox.messages[pm.id] = undefined;
      }).value();

    user.markModified('inbox.messages');
  }

  // Analytics
  user.flags.cronCount++;
  analytics.track('Cron', {
    category: 'behavior',
    gaLabel: 'Cron Count',
    gaValue: user.flags.cronCount,
    uuid: user._id,
    user, // TODO is it really necessary passing the whole user object?
    resting: user.preferences.sleep,
    cronCount: user.flags.cronCount,
    progressUp: _.min([_progress.up, 900]),
    progressDown: _progress.down,
  });

  return _progress;
}

// TODO check that it's used everywhere
module.exports = async function cronMiddleware (req, res, next) {
  let user = res.locals.user;
  let analytics = res.analytics;

  let now = new Date();
  let daysMissed = daysSince(user.lastCron, _.defaults({now}, user.preferences));

  if (daysMissed <= 0) return next();

  // Fetch active tasks (no completed todos)
  Task.find({
    userId: user._id,
    $or: [ // Exclude completed todos
      {type: 'todo', completed: false},
      {type: {$in: ['habit', 'daily', 'reward']}},
    ],
  }).exec()
  .then(tasks => {
    let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
    tasks.forEach(task => tasksByType[`${task.type}s`].push(task));

    // Run cron
    let progress = cron({user, tasksByType, now, daysMissed, analytics});

    // Clear old completed todos - 30 days for free users, 90 for subscribers
    // Do not delete challenges completed todos TODO unless the task is broken?
    Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      dateCompleted: {
        $lt: moment(now).subtract(user.isSubscribed() ? 90 : 30, 'days'),
      },
      'challenge.id': {$exists: false},
    }).exec(); // TODO catch error or at least log it, wait before returning?

    let ranCron = user.isModified();
    let quest = common.content.quests[user.party.quest.key];

    // if (ranCron) res.locals.wasModified = true; // TODO remove?
    if (!ranCron) return next();

    // Group.tavernBoss(user, progress);

    // Save user and tasks
    let toSave = [user.save()];
    tasks.forEach(task => {
      if (task.isModified) toSave.push(task.save());
    });
    Q.all(toSave)
    .then(saved => {
      user = res.locals.user = saved[0];
      if (!quest) return;

      // If user is on a quest, roll for boss & player, or handle collections
      let questType = quest.boss ? 'boss' : 'collect';
      // FIXME this saves user, runs db updates, loads user. Is there a better way to handle this?
      return Group[`${questType}Quest`](user, progress)
      .then(() => User.findById(user._id).exec()) // fetch the updated user...
      .then(updatedUser => {
        res.locals.user = updatedUser;
      });
    })
    .then(() => next())
    .catch(next);
  });
};
