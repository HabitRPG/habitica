// node .migrations/20131104_restore_lost_task_data.js

/**
 * After the great challenges migration, quite a few things got inadvertently dropped from tasks since their
 * schemas became more strict. See conversation at https://github.com/HabitRPG/habitrpg/issues/1712 ,
 * this restores task tags, streaks, due-dates, values
 */
let mongo = require('mongoskin');
let _ = require('lodash');

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

let backupUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');
let liveUsers = mongo.db('localhost:27017/habitrpg_new?auto_reconnect').collection('users');

backupUsers.count(function (err, count) {
  if (err) return console.error(err);
  backupUsers.findEach({}, {batchSize: 250}, function (err, before) {
    if (err) return console.error(err);
    if (!before) return console.log('!before');
    liveUsers.findOne({_id: before._id}, function (err, after) {
      if (err) return console.error(err);
      if (!after) {
        count--;
        return console.log(`${before._id  } deleted?`);
      }
      if (before._id === '9') console.log('lefnire processed');
      _.each(before.tasks, function (tBefore) {
        let tAfter = _.find(after[`${tBefore.type}s`], {id: tBefore.id});
        if (!tAfter) return; // task has been deleted since launch

        // Restore deleted tags
        if (!_.isEmpty(tBefore.tags) && _.isEmpty(tAfter.tags))
          tAfter.tags = tBefore.tags;
        // Except tags which are no longer available on the updated user
        _.each(tAfter.tags, function (v, k) { // value is true, key is tag.id
          if (!_.find(after.tags, {id: k})) delete tAfter.tags[k];
        });

        // Restore deleted streaks
        if (Number(tBefore.streak) > tAfter.streak)
          tAfter.streak = Number(tBefore.streak);

        if (Boolean(tBefore.date) && !tAfter.date)
          tAfter.date = tBefore.date;

        // Restore deleted values
        if (Number(tBefore.value) != 0 && tAfter.value === 0)
          tAfter.value = Number(tBefore.value);
      });
      after._v++;
      liveUsers.update({_id: after._id}, after);
      if (--count <= 0) console.log('DONE!');
    });
  });
});