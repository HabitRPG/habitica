// node .migrations/20131127_restore_dayStart.js

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');

var backupUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');
var liveUsers = mongo.db('localhost:27017/habitrpg_new?auto_reconnect').collection('users');

var query = {'preferences.dayStart':{$exists:1,$ne:0}};
var select = {'preferences.dayStart': 1};

backupUsers.count(query, function(err, count){
  if (err) return console.error(err);
  backupUsers.findEach(query, select, {batchSize:20}, function(err, before){
    if (err) return console.error(err);
    if (!before) { count--; return console.log('!before'); }
    liveUsers.findById(before._id, function(err, after){
      if (err) return console.error(err);
      if (!after) { count--; return console.log(before._id + ' deleted?'); }

      var dayStart = +before.preferences.dayStart;
      if (after.preferences.dayStart == 0 && dayStart != 0){
        dayStart = (_.isNaN(dayStart) || dayStart < 0 || dayStart > 24) ? 0 : dayStart;
      } else {
        dayStart = after.preferences.dayStart;
      }

      liveUsers.update({_id:after._id}, {$inc:{_v:1}, $set:{'preferences.dayStart':dayStart}});
      if (--count <= 0) console.log("DONE!");
    })
  });
});