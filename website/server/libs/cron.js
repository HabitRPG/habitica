import moment from 'moment';
import { model as User } from '../models/user';
import common from '../../common/';
import { preenUserHistory } from '../libs/preening';
import sleep from '../libs/sleep';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import nconf from 'nconf';

const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';
const MAX_INCENTIVES = common.constants.MAX_INCENTIVES;
const shouldDo = common.shouldDo;
const scoreTask = common.ops.scoreTask;
const i18n = common.i18n;
const loginIncentives = common.content.loginIncentives;
// const maxPMs = 200;

function setIsDueNextDue (task, user, now) {
  let optionsForShouldDo = cloneDeep(user.preferences.toObject());
  task.isDue = common.shouldDo(now, task, optionsForShouldDo);
  optionsForShouldDo.nextDue = true;
  let nextDue = common.shouldDo(now, task, optionsForShouldDo);
  if (nextDue && nextDue.length > 0) {
    task.nextDue = nextDue;
  }
}

export async function recoverCron (status, locals) {
  let {user} = locals;

  await sleep(0.3);

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
  const SUBSCRIPTION_BASIC_BLOCK_LENGTH = 3; // multi-month subscriptions are for multiples of 3 months
  let plan = user.purchased.plan;
  let subscriptionEndDate = moment(plan.dateTerminated).isBefore() ? moment(plan.dateTerminated).startOf('month') : moment(now).startOf('month');
  let dateUpdatedMoment = moment(plan.dateUpdated).startOf('month');
  let elapsedMonths = moment(subscriptionEndDate).diff(dateUpdatedMoment, 'months');

  if (elapsedMonths > 0) {
    plan.dateUpdated = now;
    // For every month, inc their "consecutive months" counter. Give perks based on consecutive blocks
    // If they already got perks for those blocks (eg, 6mo subscription, subscription gifts, etc) - then dec the offset until it hits 0
    _.defaults(plan.consecutive, {count: 0, offset: 0, trinkets: 0, gemCapExtra: 0});

    let planMonthsLength = 1; // 1 for one-month recurring or gift subscriptions; later set to 3 for 3-month recurring, etc.

    for (let i = 0; i < elapsedMonths; i++) {
      plan.consecutive.count++;

      plan.consecutive.offset--;
      // If offset is now greater than 0, the user is within a period for which they have already been given the consecutive months perks.
      //
      // If offset now equals 0, this is the final month for which the user has already been given the consecutive month perks.
      // We do not give them more perks yet because they might cancel the subscription before the next payment is taken.
      //
      // If offset is now less than 0, the user EITHER has a single-month recurring subscription and MIGHT be due for perks,
      // OR has a multi-month subscription that renewed some time in the previous calendar month and so they are due for a new set of perks
      // (strictly speaking, they should have been given the perks at the time that next payment was taken, but we don't have support for
      // tracking payments like that - giving the perks when offset is < 0 is a workaround).

      if (plan.consecutive.offset < 0) {
        if (plan.planId) {
          // NB gift subscriptions don't have a planID (which doesn't matter because we don't need to reapply perks for them and by this point they should have expired anyway)
          let planIdRegExp = new RegExp('_([0-9]+)mo'); // e.g., matches 'google_6mo' / 'basic_12mo' and captures '6' / '12'
          let match = plan.planId.match(planIdRegExp);
          if (match !== null && match[0] !== null) {
            planMonthsLength = match[1]; // 3 for 3-month recurring subscription, etc
          }
        }

        let perkAmountNeeded = 0; // every 3 months you get one set of perks - this variable records how many sets you need
        if (planMonthsLength === 1) {
          // User has a single-month recurring subscription and are due for perks IF they've been subscribed for a multiple of 3 months.
          if (plan.consecutive.count % SUBSCRIPTION_BASIC_BLOCK_LENGTH === 0) { // every 3 months
            perkAmountNeeded = 1;
          }
          plan.consecutive.offset = 0; // allow the same logic to be run next month
        } else {
          // User has a multi-month recurring subscription and it renewed in the previous calendar month.
          perkAmountNeeded = planMonthsLength / SUBSCRIPTION_BASIC_BLOCK_LENGTH; // e.g., for a 6-month subscription, give two sets of perks
          plan.consecutive.offset = planMonthsLength - 1; // don't need to check for perks again for this many months (subtract 1 because we should have run this when the payment was taken last month)
        }
        if (perkAmountNeeded > 0) {
          plan.consecutive.trinkets += perkAmountNeeded; // one Hourglass every 3 months
          plan.consecutive.gemCapExtra += 5 * perkAmountNeeded; // 5 extra Gems every 3 months
          if (plan.consecutive.gemCapExtra > 25) plan.consecutive.gemCapExtra = 25; // cap it at 50 (hard 25 limit + extra 25)
        }
      }
    }
  }
}

function removeTerminatedSubscription (user) {
  let plan = user.purchased.plan;

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

function resetHabitCounters (user, tasksByType, now, daysMissed) {
  // check if we've passed a day on which we should reset the habit counters, including today
  let resetWeekly = false;
  let resetMonthly = false;
  for (let i = 0; i < daysMissed; i++) {
    if (resetWeekly === true && resetMonthly === true) {
      break;
    }
    let thatDay = moment(now).zone(user.preferences.timezoneOffset + user.preferences.dayStart * 60).subtract({days: i});
    if (thatDay.day() === 1) {
      resetWeekly = true;
    }
    if (thatDay.date() === 1) {
      resetMonthly = true;
    }
  }

  tasksByType.habits.forEach((task) => {
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
  });
}

function trackCronAnalytics (analytics, user, _progress, options) {
  analytics.track('Cron', {
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
    loginIncentives: user.loginIncentives,
  });

  if (user.party && user.party.quest && !user.party.quest.RSVPNeeded && !user.party.quest.completed && user.party.quest.key && !user.preferences.sleep) {
    analytics.track('quest participation', {
      category: 'behavior',
      uuid: user._id,
      user,
      questName: user.party.quest.key,
      headers: options.headers,
    });
  }
}

function awardLoginIncentives (user) {
  if (user.loginIncentives > MAX_INCENTIVES) return;

  //  Remove old notifications if they exists
  user.notifications.forEach((notif, index) => {
    if (notif && notif.type === 'LOGIN_INCENTIVE') user.notifications.splice(index, 1);
  });

  let notificationData = {};
  notificationData.message = i18n.t('checkinEarned', user.preferences.language);

  let loginIncentive = loginIncentives[user.loginIncentives];

  if (loginIncentive.rewardKey) {
    loginIncentive.assignReward(user);
    notificationData.reward = loginIncentive.reward;
    notificationData.rewardText = '';

    // @TODO: Abstract this logic and share it across the server and client
    let count = 0;
    for (let reward of loginIncentive.reward) {
      if (reward.text) {
        notificationData.rewardText += reward.text(user.preferences.language);
        if (reward.key === 'RoyalPurple') {
          notificationData.rewardText = i18n.t('potion', {potionType: notificationData.rewardText}, user.preferences.language);
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
export function cron (options = {}) {
  let {user, tasksByType, analytics, now = new Date(), daysMissed, timezoneOffsetFromUserPrefs} = options;
  let _progress = {down: 0, up: 0, collectedItems: 0};

  // Record pre-cron values of HP and MP to show notifications later
  let beforeCronStats = _.pick(user.stats, ['hp', 'mp']);

  user.preferences.timezoneOffsetAtLastCron = timezoneOffsetFromUserPrefs;
  // User is only allowed a certain number of drops a day. This resets the count.
  if (user.items.lastDrop.count > 0) user.items.lastDrop.count = 0;

  // "Perfect Day" achievement for perfect days
  let perfect = true;

  // Reset Gold-to-Gems cap if it's the start of the month
  let dateUpdatedFalse = !moment(user.purchased.plan.dateUpdated).startOf('month').isSame(moment().startOf('month')) || !user.purchased.plan.dateUpdated;

  if (user.purchased && user.purchased.plan && dateUpdatedFalse) {
    user.purchased.plan.gemsBought = 0;
    if (!user.purchased.plan.dateUpdated) user.purchased.plan.dateUpdated = moment();
  }

  if (user.isSubscribed()) {
    grantEndOfTheMonthPerks(user, now);
  }

  let plan = user.purchased.plan;
  let userHasTerminatedSubscription = plan.dateTerminated && moment(plan.dateTerminated).isBefore(new Date());
  if (!CRON_SAFE_MODE && userHasTerminatedSubscription) removeTerminatedSubscription(user);

  // Login Incentives
  user.loginIncentives++;
  awardLoginIncentives(user);

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

  // For incomplete Dailys, add value (further incentive), deduct health, keep records for later decreasing the nightly mana gain.
  // The negative effects are not done when resting in the inn.
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
      if (task.history && task.history.length) {
        const lastHistoryEntry = task.history[task.history.length - 1];
        task.lastCompleted = moment(lastHistoryEntry.date).toDate();
      } else {
        task.lastCompleted = moment(now).subtract({days: 1}).toDate();
      }

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
        }
        if (multiDaysCountAsOneDay) break;
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

          if (!user.preferences.sleep) {
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

      // add history entry when task was not completed
      task.history.push({
        date: Number(new Date()),
        value: task.value,
      });
    }

    task.completed = false;
    setIsDueNextDue(task, user, now);

    if (completed || scheduleMisses > 0) {
      if (task.checklist) {
        task.checklist.forEach(i => i.completed = false);
      }
    }
  });

  resetHabitCounters(user, tasksByType, now, daysMissed);

  tasksByType.habits.forEach((task) => {
    // slowly reset value to 0 for "onlies" (Habits with + or - but not both)
    // move singleton Habits towards yellow.
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

  // Remove any remaining completed todos from the list of active todos
  user.tasksOrder.todos = user.tasksOrder.todos.filter(taskOrderId => {
    return _.some(tasksByType.todos, taskType => {
      return taskType._id === taskOrderId && taskType.completed === false;
    });
  });
  // TODO also adjust tasksOrder arrays to remove deleted tasks of any kind (including rewards), ensure that all existing tasks are in the arrays, no tasks IDs are duplicated -- https://github.com/HabitRPG/habitica/issues/7645

  // preen user history so that it doesn't become a performance problem
  // also for subscribed users but differently
  preenUserHistory(user, tasksByType);

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
  if (!user.preferences.sleep) {
    if (dailyDueUnchecked === 0 && dailyChecked === 0) dailyChecked = 1;
    user.stats.mp += _.max([10, 0.1 * common.statsComputed(user).maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
    if (user.stats.mp > common.statsComputed(user).maxMP) user.stats.mp = common.statsComputed(user).maxMP;
  }

  // After all is said and done, progress up user's effect on quest, return those values & reset the user's
  if (!user.preferences.sleep) {
    let progress = user.party.quest.progress;
    _progress = progress.toObject(); // clone the old progress object
    _.merge(progress, {down: 0, up: 0, collectedItems: 0});
  }

  // Send notification for changes in HP and MP.
  // First remove a possible previous cron notification because
  // we don't want to flood the users with many cron notifications at once.
  let oldCronNotif = user.notifications.find((notif, index) => {
    if (notif && notif.type === 'CRON') {
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

  // Analytics
  user.flags.cronCount++;
  trackCronAnalytics(analytics, user, _progress, options);

  return _progress;
}
