import moment from 'moment';
import * as Tasks from '../models/task';
import Bluebird from 'bluebird';
import { model as Group } from '../models/group';
import { model as User } from '../models/user';
import { recoverCron, cron } from '../libs/cron';

// Wait this length of time in ms before attempting another cron
const CRON_TIMEOUT_WAIT = new Date(60 * 60 * 1000).getTime();

async function checkForActiveCron (user, now) {
  // set _cronSignature to current time in ms since epoch time so we can make sure to wait at least CRONT_TIMEOUT_WAIT before attempting another cron
  let _cronSignature = now.getTime();
  // Calculate how long ago cron must have been attempted to try again
  let cronRetryTime = _cronSignature - CRON_TIMEOUT_WAIT;

  // To avoid double cron we first set _cronSignature and then check that it's not changed while processing
  let userUpdateResult = await User.update({
    _id: user._id,
    $or: [ // Make sure last cron was successful or failed before cronRetryTime
      {_cronSignature: 'NOT_RUNNING'},
      {_cronSignature: {$lt: cronRetryTime}},
    ],
  }, {
    $set: {
      _cronSignature,
      lastCron: now, // setting lastCron now so we don't risk re-running parts of cron if it fails
      'auth.timestamps.loggedin': now,
    },
  }).exec();

  // If the cron signature is already set, cron is running in another request
  // throw an error and recover later,
  if (userUpdateResult.nMatched === 0 || userUpdateResult.nModified === 0) {
    throw new Error('CRON_ALREADY_RUNNING');
  }
}

async function unlockUser (user) {
  await User.update({
    _id: user._id,
  }, {
    _cronSignature: 'NOT_RUNNING',
  }).exec();
}

async function cronAsync (req, res) {
  let user = res.locals.user;
  if (!user) return null; // User might not be available when authentication is not mandatory

  let analytics = res.analytics;
  let now = new Date();

  try {
    let {daysMissed, timezoneOffsetFromUserPrefs} = user.daysUserHasMissed(now, req);

    await checkForActiveCron(user, now);

    if (daysMissed <= 0) {
      if (user.isModified()) await user.save();
      await unlockUser(user);
      return null;
    }

    let tasks = await Tasks.Task.find({
      userId: user._id,
      $or: [ // Exclude completed todos
        {type: 'todo', completed: false},
        {type: {$in: ['habit', 'daily', 'reward']}},
      ],
    }).exec();

    let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
    tasks.forEach(task => tasksByType[`${task.type}s`].push(task));

    // Run cron
    let progress = cron({user, tasksByType, now, daysMissed, analytics, timezoneOffsetFromUserPrefs, headers: req.headers});

    // Clear old completed todos - 30 days for free users, 90 for subscribers
    // Do not delete challenges completed todos TODO unless the task is broken?
    // Do not delete group completed todos
    Tasks.Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      dateCompleted: {
        $lt: moment(now).subtract(user.isSubscribed() ? 90 : 30, 'days').toDate(),
      },
      'challenge.id': {$exists: false},
      'group.id': {$exists: false},
    }).exec();

    res.locals.wasModified = true; // TODO remove after v2 is retired

    // Group.tavernBoss(user, progress);

    // Save user and tasks
    let toSave = [user.save()];
    tasks.forEach(task => {
      if (task.isModified()) toSave.push(task.save());
    });
    await Bluebird.all(toSave);

    await Group.processQuestProgress(user, progress);

    // Set _cronSignature, lastCron and auth.timestamps.loggedin to signal end of cron
    await User.update({
      _id: user._id,
    }, {
      $set: {
        _cronSignature: 'NOT_RUNNING',
      },
    }).exec();

    // Reload user
    res.locals.user = await User.findOne({_id: user._id}).exec();
    return null;
  } catch (err) {
    // If cron was aborted for a race condition try to recover from it
    if (err.message === 'CRON_ALREADY_RUNNING') {
      // Recovering after abort, wait 300ms and reload user
      // do it for max 5 times then reset _cronSignature so that it doesn't prevent cron from running
      // at the next request
      let recoveryStatus = {
        times: 0,
      };

      await recoverCron(recoveryStatus, res.locals);
    } else {
      // For any other error make sure to reset _cronSignature so that it doesn't prevent cron from running
      // at the next request
      await User.update({
        _id: user._id,
      }, {
        _cronSignature: 'NOT_RUNNING',
      }).exec();

      throw err; // re-throw the original error
    }
  }
}

module.exports = function cronMiddleware (req, res, next) {
  cronAsync(req, res)
    .then(() => {
      next();
    })
    .catch(next);
};
