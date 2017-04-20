// node .migrations/20131221_restore_NaN_history.js

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

/**
 * After the classes migration, users lost some history entries
 */
var mongo = require('mongoskin');
var _ = require('lodash');

var backupUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');
var liveUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');

function filterNaNs(h) {
  return h && _.isNumber(+h.value) && !_.isNaN(+h.value);
}

var fields = {history:1,habits:1,dailys:1,migration:1};
var count = 0;
liveUsers.findEach({migration: {$ne:'20131221_restore_NaN_history'}}, fields, {batchSize:500}, function(err, after){
  if (!after) err = '!after';
  if (err) {count++;return console.error(err);}

  backupUsers.findById(after._id, fields, function(err, before){
    if (err) {count++;return console.error(err);}

    _.each(['todos','exp'],function(type){
      if (!_.isEmpty(after.history[type]))
        after.history[type] = _.filter(after.history[type], filterNaNs);
      if (before && !_.isEmpty(before.history[type]))
        after.history[type] = before.history[type].concat(after.history[type]);
    })

    _.each(['habits','dailys'], function(type){
      _.each(after[type], function(t){
        t.history = _.filter(t.history, filterNaNs);
        var found = before && _.find(before[type],{id:t.id});
        if (found && found.history) t.history = found.history.concat(t.history);
      })
    })

    liveUsers.update({_id:after._id}, {$set:{history:after.history, dailys:after.dailys, habits:after.habits, migration:'20131221_restore_NaN_history'}, $inc:{_v:1}});
    //if (--count <= 0) console.log("DONE! " + after._id);
    if (++count%1000 == 0) console.log(count);
    if (after._id == '9') console.log('lefnire processed');
  })
});