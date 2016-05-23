import _ from 'lodash';
import moment from 'moment';
import common from '../../../../common';
import * as Tasks from '../../models/task';
import Bluebird from 'bluebird';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import { cron } from '../../libs/api-v3/cron';
import { v4 as uuid } from 'uuid';

const daysSince = common.daysSince;

module.exports = function cronMiddleware (req, res, next) {
  let user = res.locals.user;

  if (!user) return next(); // User might not be available when authentication is not mandatory

  let analytics = res.analytics;

  let now = new Date();

  // If the user's timezone has changed (due to travel or daylight savings),
  // cron can be triggered twice in one day, so we check for that and use
  // both timezones to work out if cron should run.
  // CDS = Custom Day Start time.
  let timezoneOffsetFromUserPrefs = user.preferences.timezoneOffset || 0;
  let timezoneOffsetAtLastCron = _.isFinite(user.preferences.timezoneOffsetAtLastCron) ? user.preferences.timezoneOffsetAtLastCron : timezoneOffsetFromUserPrefs;
  let timezoneOffsetFromBrowser = Number(req.header('x-user-timezoneoffset'));
  timezoneOffsetFromBrowser = _.isFinite(timezoneOffsetFromBrowser) ? timezoneOffsetFromBrowser : timezoneOffsetFromUserPrefs;
  // NB: All timezone offsets can be 0, so can't use `... || ...` to apply non-zero defaults

  if (timezoneOffsetFromBrowser !== timezoneOffsetFromUserPrefs) {
    // The user's browser has just told Habitica that the user's timezone has
    // changed so store and use the new zone.
    user.preferences.timezoneOffset = timezoneOffsetFromBrowser;
    timezoneOffsetFromUserPrefs = timezoneOffsetFromBrowser;
  }

  // How many days have we missed using the user's current timezone:
  let daysMissed = daysSince(user.lastCron, _.defaults({now}, user.preferences));

  if (timezoneOffsetAtLastCron !== timezoneOffsetFromUserPrefs) {
    // Since cron last ran, the user's timezone has changed.
    // How many days have we missed using the old timezone:
    let daysMissedNewZone = daysMissed;
    let daysMissedOldZone = daysSince(user.lastCron, _.defaults({
      now,
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
      } else if (daysMissedOldZone > 0) {
        // The old timezone says that cron should run; the new timezone does not.
        // This should be impossible for this direction of timezone change, but
        // just in case I'm wrong...
        // TODO
        // console.log("zone has changed - old zone says run cron, NEW zone says no - stop cron now only -- SHOULD NOT HAVE GOT TO HERE", timezoneOffsetAtLastCron, timezoneOffsetFromUserPrefs, now); // used in production for confirming this never happens
      } else if (daysMissedNewZone > 0) {
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
      } else {
        // Both old and new timezones indicate that cron should
        // NOT run.
        daysMissed = 0; // prevent cron running now
      }
    } else if (timezoneOffsetAtLastCron > timezoneOffsetFromUserPrefs) {
      daysMissed = daysMissedNewZone;
      // TODO: Either confirm that there is nothing that could possibly go wrong here and remove the need for this else branch, or fix stuff.
      // There are probably situations where the Dailies do not reset early enough for a user who was expecting the zone change and wants to use all their Dailies immediately in the new zone;
      // if so, we should provide an option for easy reset of Dailies (can't be automatic because there will be other situations where the user was not prepared).
    }
  }

  if (daysMissed <= 0) return next();

  let quest;
  let progress;
  let tasks;

  // To avoid double cron we set _cronSignature on the user to a random string
  // and check that it has remained the same before saving
  user._cronSignature = uuid();

  User.update({
    _id: user._id,
    _cronSignature: 'not-running',
  }, {
    $set: {
      _cronSignature: user._cronSignature,
    },
  }).exec()
  .then((updateResult) => { // Fetch active tasks (no completed todos)
    // if the cron signature is set, throw an error and recover later
    if (updateResult.nMatched === 0 || updateResult.nUpdated === 0) {
      throw new Error('cron-already-running');
    }

    return Tasks.Task.find({
      userId: user._id,
      $or: [ // Exclude completed todos
        {type: 'todo', completed: false},
        {type: {$in: ['habit', 'daily', 'reward']}},
      ],
    }).exec();
  })
  .then(tasksFetched => {
    tasks = tasksFetched;
    let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
    tasks.forEach(task => tasksByType[`${task.type}s`].push(task));

    // Run cron
    progress = cron({user, tasksByType, now, daysMissed, analytics, timezoneOffsetFromUserPrefs});

    // Clear old completed todos - 30 days for free users, 90 for subscribers
    // Do not delete challenges completed todos TODO unless the task is broken?
    Tasks.Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      dateCompleted: {
        $lt: moment(now).subtract(user.isSubscribed() ? 90 : 30, 'days').toDate(),
      },
      'challenge.id': {$exists: false},
    }).exec();

    let ranCron = user.isModified();
    quest = common.content.quests[user.party.quest.key];

    if (ranCron) res.locals.wasModified = true; // TODO remove after v2 is retired
    if (!ranCron) return next();

    // Group.tavernBoss(user, progress);

    // Save user and tasks
    // Uses mongoose's internals to get update command
    let mongooseDelta = user.$__delta();
    if (mongooseDelta instanceof Error) {
      throw mongooseDelta;
    }

    let mongooseWhere = user.$__where(mongooseDelta[0]);
    if (mongooseWhere instanceof Error) {
      throw mongooseWhere;
    }
    mongooseWhere._cronSignature = user._cronSignature; // Only update the user if cron signature matches

    return User.update(mongooseWhere, mongooseDelta[1]);
  })
  .then(updateResult => {
    // if the cron signature is set, throw an error and recover later
    if (updateResult.nMatched === 0 || updateResult.nUpdated === 0) {
      throw new Error('cron-already-running');
    }

    let toSave = [];
    tasks.forEach(task => {
      if (task.isModified()) toSave.push(task.save());
    });

    return Bluebird.all(toSave);
  })
  .then(() => {
    if (!quest) return;
    // If user is on a quest, roll for boss & player, or handle collections
    let questType = quest.boss ? 'boss' : 'collect';
    // TODO this saves user, runs db updates, loads user. Is there a better way to handle this?
    return Group[`${questType}Quest`](user, progress);
  })
  .then(() => {
    User.findByIdAndUpdate(user._id, {
      $set: {_cronSignature: 'not-running'},
    }, {
      new: true, // return the updated document
    }).exec();
  }) // fetch the updated user...
  .then(updatedUser => {
    user = res.locals.user = updatedUser;

    return null;
  })
  .then(() => next())
  .catch((err) => {
    if (err.message === 'cron-already-running') {
      // recovering after abort, wait 200ms and reload user
      setTimeout(() => {
        User.findById(user._id, (reloadErr, reloadedUser) => {
          if (reloadErr) return next(reloadErr);
          user = res.locals.user = reloadedUser;
          return next();
        });
      }, 200);
    } else {
      return next(err);
    }
  });
};
