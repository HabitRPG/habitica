// node .migrations/20131225_restore_streaks.js

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
var liveUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');

var fields = {dailys:1,migration:1};
var count = 0;
liveUsers.findEach({migration: {$ne:'20131225_restore_streaks'}}, fields, {batchSize:250}, function(err, after){
  if (!after) err = '!after';
  if (err) {count++;return console.error(err);}

  backupUsers.findById(after._id, fields, function(err, before){
    if (!before) err = '!before';
    if (err) {count++;return console.error(err);}

    _.each(before.dailys,function(d){
      var found = _.find(after.dailys,{id: d.id});
      if (found && !found.streak) found.streak = d.streak;
    })

    liveUsers.update({_id:after._id}, {$set:{dailys:after.dailys, migration:'20131225_restore_streaks'}, $inc:{_v:1}});
    //if (--count <= 0) console.log("DONE! " + after._id);
    if (++count%1000 == 0) console.log(count);
    if (after._id == '9') console.log('lefnire processed');
  })
});