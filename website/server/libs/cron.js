import moment from 'moment';
import mongoose from 'mongoose';
import pick from 'lodash/pick';
import nconf from 'nconf';
import { model as User } from '../models/user';
import * as Tasks from '../models/task';
import { model as Group } from '../models/group';
import common from '../../common';
import { preenUserHistory } from './preening';
import { revealMysteryItems } from './payments/subscriptions';
import { model as UserHistory } from '../models/userHistory';

const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';
const { MAX_INCENTIVES } = common.constants;
const {
  shouldDo,
  i18n,
  getPlanContext,
} = common;
const { scoreTask } = common.ops;
const { loginIncentives } = common.content;

function setIsDueNextDue (task, user, now) {
  const optionsForShouldDo = {
    dayStart: user.preferences.dayStart,
    timezoneOffset: user.preferences.timezoneOffset,
  };
  task.isDue = common.shouldDo(now, task, optionsForShouldDo);
  optionsForShouldDo.nextDue = true;
  const nextDue = common.shouldDo(now, task, optionsForShouldDo);
  if (nextDue && nextDue.length > 0) {
    task.nextDue = nextDue.map(dueDate => dueDate.toISOString());
  }
}

async function unlockUser (user) {
  await User.updateOne({
    _id: user._id,
  }, {
    _cronSignature: 'NOT_RUNNING',
  }).exec();
}

async function grantEndOfTheMonthPerks (user, now) {
  const { plan, elapsedMonths } = getPlanContext(user, now);

  if (elapsedMonths > 0) {
    plan.dateUpdated = now;
    // Award mystery items
    revealMysteryItems(user, elapsedMonths);

    plan.consecutive.count += elapsedMonths;
    plan.cumulativeCount += elapsedMonths;
    await plan.rewardPerks(user._id, elapsedMonths);
  }
}

function removeTerminatedSubscription (user) {
  const { plan } = user.purchased;
  plan.planId = null;
  plan.customerId = null;
  plan.subscriptionId = null;
  plan.paymentMethod = null;
  plan.consecutive.count = 0;

  user.markModified('purchased.plan');
}

function processHabits (user, habits, now, daysMissed) {
  // check if we've passed a day on which we should reset the habit counters, including today
  const nowMoment = moment(now)
    .utcOffset(user.getUtcOffset() - user.preferences.dayStart * 60);
  const thatDay = nowMoment.clone()
    .subtract({ days: daysMissed });
  const resetWeekly = nowMoment.isoWeek() !== thatDay.isoWeek();
  const resetMonthly = nowMoment.month() !== thatDay.month();

  habits.forEach(task => {
    // reset counters if appropriate

    let reset = false;
    if (task.frequency === 'daily') {
      reset = true;
    } else if (task.frequency === 'weekly' && resetWeekly === true) {
      reset = true;
    } else if (task.frequency === 'monthly' && resetMonthly === true) {
      reset = true;
    }
    if (reset === true) {
      task.counterUp = 0;
      task.counterDown = 0;
    }

    // slowly reset value to 0 for "onlies" (Habits with + or - but not both)
    // move singleton Habits towards yellow.
    if (task.up === false || task.down === false) {
      task.value = Math.abs(task.value) < 0.1 ? 0 : task.value /= 2;
    }
  });
}

function trackCronAnalytics (analytics, user, _progress, options) {
  analytics.track('Cron', {
    category: 'behavior',
    uuid: user._id,
    user: pick(user, ['preferences', 'registeredThrough']),
    resting: user.preferences.sleep,
    cronCount: user.flags.cronCount,
    progressUp: Math.min(_progress.up, 900),
    progressDown: _progress.down,
    headers: options.headers,
    loginIncentives: user.loginIncentives,
  });
}

function awardLoginIncentives (user) {
  if (user.loginIncentives > MAX_INCENTIVES) return;

  //  Remove old notifications if they exists
  user.notifications.forEach((notif, index) => {
    if (notif && notif.type === 'LOGIN_INCENTIVE') user.notifications.splice(index, 1);
  });

  const notificationData = {};
  notificationData.message = i18n.t('checkinEarned', user.preferences.language);

  const loginIncentive = loginIncentives[user.loginIncentives];

  if (loginIncentive.rewardKey) {
    loginIncentive.assignReward(user);
    notificationData.reward = loginIncentive.reward;
    notificationData.rewardText = '';

    // @TODO: Abstract this logic and share it across the server and client
    let count = 0;
    for (const reward of loginIncentive.reward) {
      if (reward.text) {
        notificationData.rewardText += reward.text(user.preferences.language);
        if (reward.key === 'RoyalPurple') {
          notificationData.rewardText = i18n.t('potion', { potionType: notificationData.rewardText }, user.preferences.language);
        }
      } else if (loginIncentive.rewardKey[0] === 'background_blue') {
        notificationData.rewardText = i18n.t('incentiveBackgrounds', user.preferences.language);
      }

      if (loginIncentive.reward.length > 0 && count < loginIncentive.reward.length - 1) notificationData.rewardText += ', ';

      count += 1;
    }

    // Overwrite notificationData.rewardText if rewardName was explicitly declared
    if (loginIncentive.rewardName) {
      notificationData.rewardText = i18n.t(loginIncentive.rewardName, user.preferences.language);
    }

    notificationData.rewardKey = loginIncentive.rewardKey;
    notificationData.message = i18n.t('unlockedCheckInReward', user.preferences.language);
  }

  notificationData.nextRewardAt = loginIncentives[user.loginIncentives].nextRewardAt || 0;
  user.addNotification('LOGIN_INCENTIVE', notificationData);
}

// Perform various beginning-of-day reset actions.
export async function cron (options = {}) {
  const {
    user, tasksByType, analytics, now = new Date(), daysMissed, timezoneUtcOffsetFromUserPrefs,
  } = options;
  let _progress = { down: 0, up: 0, collectedItems: 0 };

  user.preferences.timezoneOffsetAtLastCron = -timezoneUtcOffsetFromUserPrefs;
  // User is only allowed a certain number of drops a day. This resets the count.
  if (user.items.lastDrop.count > 0) user.items.lastDrop.count = 0;

  // "Perfect Day" achievement for perfect days
  let perfect = true;

  // Reset Gold-to-Gems cap if it's the start of the month
  const dateUpdatedFalse = !moment(user.purchased.plan.dateUpdated).startOf('month').isSame(moment().startOf('month')) || !user.purchased.plan.dateUpdated;

  if (user.purchased && user.purchased.plan && dateUpdatedFalse) {
    user.purchased.plan.gemsBought = 0;
    if (!user.purchased.plan.dateUpdated) user.purchased.plan.dateUpdated = moment();
  }

  if (user.isSubscribed()) {
    await grantEndOfTheMonthPerks(user, now);
  }

  const { plan } = user.purchased;
  const userHasTerminatedSubscription = plan.dateTerminated
    && moment(plan.dateTerminated).isBefore(new Date());
  if (!CRON_SAFE_MODE && userHasTerminatedSubscription) removeTerminatedSubscription(user);

  // Login Incentives
  user.loginIncentives += 1;
  awardLoginIncentives(user);

  const multiDaysCountAsOneDay = true;
  // If the user does not log in for two or more days,
  // cron (mostly) acts as if it were only one day.
  // When site-wide difficulty settings are introduced, this can be a user preference option.

  let todoTally = 0;
  // make uncompleted To Do's redder (further incentive to complete them)
  tasksByType.todos.forEach(task => {
    if (
      task.completed
      || (task.group.assignedDate
      && moment(task.group.assignedDate).isAfter(user.auth.timestamps.updated))
    ) return;
    scoreTask({
      task,
      user,
      direction: 'down',
      cron: true,
      times: multiDaysCountAsOneDay ? 1 : daysMissed,
    });

    todoTally += task.value;
  });
  user.history.todos.push({ date: now.toISOString(), value: todoTally });

  // For incomplete Dailys, add value (further incentive),
  // deduct health, keep records for later decreasing the nightly mana gain.
  // The negative effects are not done when resting in the inn.
  let dailyChecked = 0; // how many dailies were checked?
  let dailyDueUnchecked = 0; // how many dailies were un-checked?
  let atLeastOneDailyDue = false; // were any dailies due?
  if (!user.party.quest.progress.down) user.party.quest.progress.down = 0;

  tasksByType.dailys.forEach(task => {
    const isTeamBoardTask = task.group.id && !task.userId;
    if (
      !isTeamBoardTask && task.group.assignedDate
      && moment(task.group.assignedDate).isAfter(user.auth.timestamps.updated)
    ) return;
    const { completed } = task;
    // Deduct points for missed Daily tasks
    let evadeTask = 0;
    let scheduleMisses = 0;

    if (completed) {
      if (!isTeamBoardTask) dailyChecked += 1;
      if (!atLeastOneDailyDue) { // only bother checking until the first thing is found
        atLeastOneDailyDue = task.isDue;
      }
    } else {
      // dailys repeat, so need to calculate how many they've missed according to their own schedule
      for (let i = 0; i < daysMissed; i += 1) {
        const thatDay = moment(now).subtract({ days: i + 1 });

        if (shouldDo(thatDay.toDate(), task, user.preferences)) {
          atLeastOneDailyDue = true;
          scheduleMisses += 1;
          if (user.stats.buffs.stealth && !isTeamBoardTask) {
            user.stats.buffs.stealth -= 1;
            evadeTask += 1;
          }
        }
        if (multiDaysCountAsOneDay) break;
      }

      if (scheduleMisses > evadeTask) {
        // The user did not complete this due Daily
        // (but no penalty if cron is running in safe mode).
        if (CRON_SAFE_MODE) {
          dailyChecked += 1; // allows full allotment of mp to be gained
        } else {
          perfect = false;

          // Partially completed checklists dock fewer mana points
          if (task.checklist && task.checklist.length > 0) {
            const completedItems = task.checklist.filter(i => i.completed).length;
            const fractionChecked = completedItems / task.checklist.length;
            dailyDueUnchecked += 1 - fractionChecked;
            dailyChecked += fractionChecked;
          } else {
            dailyDueUnchecked += 1;
          }

          if (!user.preferences.sleep) {
            const delta = scoreTask({
              user,
              task,
              direction: 'down',
              times: multiDaysCountAsOneDay ? 1 : scheduleMisses - evadeTask,
              cron: true,
            });

            if (!CRON_SEMI_SAFE_MODE) {
              // Apply damage from a boss, less damage for Trivial priority (difficulty)
              user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
              // NB: Medium and Hard priorities do not increase damage from boss.
              // This was by accident
              // initially, and when we realised, we could not fix it because users are used to
              // their Medium and Hard Dailies doing an Easy amount of damage from boss.
              // Easy is task.priority = 1. Anything < 1 will be Trivial (0.1) or any future
              // setting between Trivial and Easy.
            }
          }
        }
      }

      // add history entry when task was not completed
      task.history.push({
        date: Number(new Date()),
        value: task.value,
        isDue: task.isDue,
        completed: false,
      });
    }

    task.completed = false;
    setIsDueNextDue(task, user, now);

    if (completed || scheduleMisses > 0) {
      if (task.checklist) {
        task.checklist.forEach(i => { i.completed = false; });
      }
    }
  });

  processHabits(user, tasksByType.habits, now, daysMissed);

  // tally experience
  let expTally = user.stats.exp;
  let lvl = 0; // iterator
  while (lvl < user.stats.lvl - 1) {
    lvl += 1;
    expTally += common.tnl(lvl);
  }

  user.history.exp.push({ date: now.toISOString(), value: expTally });

  // Remove any remaining completed todos from the list of active todos
  const incompleteTodoIds = tasksByType.todos.filter(task => !task.completed).map(task => task._id);
  user.tasksOrder.todos = user.tasksOrder.todos
    .filter(taskOrderId => incompleteTodoIds.includes(taskOrderId));
  // TODO also adjust tasksOrder arrays to remove deleted tasks of any kind (including rewards), ensure that all existing tasks are in the arrays, no tasks IDs are duplicated -- https://github.com/HabitRPG/habitica/issues/7645

  // preen user history so that it doesn't become a performance problem
  // also for subscribed users but differently
  preenUserHistory(user, tasksByType);

  if (perfect && atLeastOneDailyDue) {
    user.achievements.perfect += 1;
    const lvlDiv2 = Math.ceil(common.capByLevel(user.stats.lvl) / 2);
    user.stats.buffs = {
      str: lvlDiv2,
      int: lvlDiv2,
      per: lvlDiv2,
      con: lvlDiv2,
      stealth: 0,
      streaks: false,
    };
  } else {
    user.stats.buffs = {
      str: 0,
      int: 0,
      per: 0,
      con: 0,
      stealth: 0,
      streaks: false,
    };
  }

  common.setDebuffPotionItems(user);

  // Add 10 MP, or 10% of max MP if that'd be more.
  // Perform this after Perfect Day for maximum benefit
  // Adjust for fraction of dailies completed
  if (!user.preferences.sleep) {
    if (dailyDueUnchecked === 0 && dailyChecked === 0) dailyChecked = 1;
    const { maxMP } = common.statsComputed(user);
    user.stats.mp += (Math.max(10, 0.1 * maxMP) * dailyChecked) / (dailyDueUnchecked + dailyChecked); // eslint-disable-line max-len
    if (user.stats.mp > maxMP) {
      user.stats.mp = maxMP;
    }

    // After all is said and done,
    // progress up user's effect on quest, return those values & reset the user's
    const { progress } = user.party.quest;
    _progress = progress.toObject(); // clone the old progress object
    progress.down = 0;
    progress.up = 0;
    progress.collectedItems = 0;
  }

  if (user.pinnedItems && user.pinnedItems.length > 0) {
    user.pinnedItems = common.cleanupPinnedItems(user);
  }

  // Analytics
  user.flags.cronCount += 1;
  trackCronAnalytics(analytics, user, _progress, options);

  await UserHistory.beginUserHistoryUpdate(user._id, options.headers)
    .withCron(user.flags.cronCount)
    .commit();

  return _progress;
}

// Wait 5 minutes before attempting another cron
const CRON_TIMEOUT_WAIT = new Date(5 * 60 * 1000).getTime();

async function checkForActiveCron (user, now, session) {
  // set _cronSignature to current time in ms since epoch time
  // so we can make sure to wait at least CRONT_TIMEOUT_WAIT before attempting another cron
  const _cronSignature = now.getTime();
  // Calculate how long ago cron must have been attempted to try again
  const cronRetryTime = _cronSignature - CRON_TIMEOUT_WAIT;

  // To avoid double cron we first set _cronSignature
  // and then check that it's not changed while processing
  const userUpdateResult = await User.updateOne({
    _id: user._id,
    $or: [ // Make sure last cron was successful or failed before cronRetryTime
      { _cronSignature: 'NOT_RUNNING' },
      { _cronSignature: { $lt: cronRetryTime } },
    ],
  }, {
    $set: {
      _cronSignature,
    },
  }, { session }).exec();

  // If the cron signature is already set, cron is running in another request
  // throw an error and recover later,
  if (userUpdateResult.matchedCount === 0 || userUpdateResult.modifiedCount === 0) {
    throw new Error('CRON_ALREADY_RUNNING');
  }
}

export async function cronWrapper (req, res) {
  const { user } = res.locals;
  if (!user) return null; // User might not be available when authentication is not mandatory

  const { analytics } = res;
  const now = new Date();
  let session;

  try {
    await checkForActiveCron(user, now);
    const { daysMissed, timezoneUtcOffsetFromUserPrefs } = user.daysUserHasMissed(now, req);

    if (daysMissed <= 0) {
      if (user.isModified()) {
        user._cronSignature = 'NOT_RUNNING';
        await user.save();
      } else {
        await unlockUser(user);
      }
      return null;
    }

    // Clear old completed todos - 30 days for free users, 90 for subscribers
    // Do not delete challenges completed todos TODO unless the task is broken?
    // Do not delete group completed todos
    await Tasks.Task.deleteMany({
      userId: user._id,
      type: 'todo',
      completed: true,
      dateCompleted: {
        $lt: moment(now).subtract(user.isSubscribed() ? 90 : 30, 'days').toDate(),
      },
      'challenge.id': { $exists: false },
      'group.id': { $exists: false },
    }).exec();

    const tasks = await Tasks.Task.find({
      userId: user._id,
      $or: [ // Exclude completed todos
        { type: 'todo', completed: false },
        { type: { $in: ['habit', 'daily'] } },
      ],
    }, null).exec();
    const tasksByType = {
      habits: [], dailys: [], todos: [], rewards: [],
    };
    tasks.forEach(task => tasksByType[`${task.type}s`].push(task));

    // Run cron
    const progress = await cron({
      user,
      tasksByType,
      now,
      daysMissed,
      analytics,
      timezoneUtcOffsetFromUserPrefs,
      headers: req.headers,
    });

    // await Group.tavernBoss(user, progress);

    // Save user and tasks
    user._cronSignature = 'NOT_RUNNING';
    user.markModified('_cronSignature');
    user.auth.timestamps.loggedin = now;
    user.lastCron = now;

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await user.save({ session });
      for (const index in tasks) {
        if (Object.prototype.hasOwnProperty.call(tasks, index)) {
          const task = tasks[index];
          // eslint-disable-next-line no-await-in-loop
          if (task.isModified()) await task.save({ session });
        }
      }
    });

    await Group.processQuestProgress(user, progress);

    // Reload user
    res.locals.user = await User.findOne({ _id: user._id }).exec();
    return null;
  } catch (err) {
    if (err.message !== 'CRON_ALREADY_RUNNING') {
      // For any other error make sure to reset _cronSignature
      // so that it doesn't prevent cron from running
      // at the next request
      await unlockUser(user);
    }

    throw err; // re-throw the original error
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
