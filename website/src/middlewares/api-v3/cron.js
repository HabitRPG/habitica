import _ from 'lodash';
import moment from 'moment';
import {
  daysSince,
} from '../../../../common/script/cron';
import cron from '../../../../common/script/api-v3/cron';
import common from '../../../../common';
import Task from '../../models/task';
import Q from 'q';
// import Group from '../../models/group';

// TODO check that it's used everywhere
export default function cronMiddleware (req, res, next) {
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
    cron({user, tasksByType, now, daysMissed, analytics});

    // Clean completed todos - 30 days for free users, 90 for subscribers
    // Do not delete challenges completed todos TODO unless the task is broken?
    Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      dateCompleted: {
        $lt: moment(now).subtract(user.isSubscribed() ? 90 : 30, 'days'),
      },
      'challenge.id': {$exists: false},
    }).exec(); // TODO catch error or at least log it

    let ranCron = user.isModified();
    let quest = common.content.quests[user.party.quest.key];

    // if (ranCron) res.locals.wasModified = true; // TODO remove?
    if (!ranCron) return next();
    // TODO Group.tavernBoss(user, progress);
    if (!quest || true /* TODO remove */) {
      // Save user and tasks
      let toSave = [user.save()];
      tasks.forEach(task => {
        if (task.isModified) toSave.push(task.save());
      });

      return Q.all(toSave).then(() => next()).catch(next);
    }

    // If user is on a quest, roll for boss & player, or handle collections
    // FIXME this saves user, runs db updates, loads user. Is there a better way to handle this?
    // TODO do
    /* async.waterfall([
      function(cb){
        user.save(cb); // make sure to save the cron effects
      },
      function(saved, count, cb){
        var type = quest.boss ? 'boss' : 'collect';
        Group[type+'Quest'](user,progress,cb);
      },
      function(){
        var cb = arguments[arguments.length-1];
        // User has been updated in boss-grapple, reload
        User.findById(user._id, cb);
      }
    ], function(err, saved) {
      res.locals.user = saved;
      next(err,saved);
      user = progress = quest = null;
    });*/
  });
}
