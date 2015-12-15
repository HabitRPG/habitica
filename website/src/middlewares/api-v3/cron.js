import _ from 'lodash';
import {
  daysSince,
} from '../../../../common/script/cron';
import cron from '../../../../common/script/api-v3/cron';
import common from '../../../../common';
import Task from '../../models/task';
// import Group from '../../models/group';

// TODO check that it's usef everywhere
export default function cronMiddleware (req, res, next) {
  let user = res.locals.user;
  let analytics = res.analytics;

  let now = new Date();
  let daysMissed = daysSince(user.lastCron, _.defaults({now}, user.preferences));

  if (daysMissed <= 0) return next(null, user); // TODO why are we passing user down here?

  // Fetch active tasks (no completed todos)
  Task.find({
    userId: user._id,
    $or: [ // Exclude completed todos
      {type: 'todo', completed: false},
      {type: {$in: ['habit', 'daily', 'reward']}},
    ],
  }).exec()
  .then((tasks) => {
    let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
    tasks.forEach(task => tasksByType[`${task.type}s`].push(task));

    // Run cron
    cron({user, tasks, tasksByType, now, daysMissed, analytics});

    let ranCron = user.isModified();
    let quest = common.content.quests[user.party.quest.key];

    // if (ranCron) res.locals.wasModified = true; // TODO remove?
    if (!ranCron) return next(null, user); // TODO why are we passing user to next?
    // TODO Group.tavernBoss(user, progress);
    if (!quest || true /* TODO remove */) return user.save(next);

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
