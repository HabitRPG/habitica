//  node .migrations/20140823_remove_undefined_and_false_notifications.js

var migrationName = '20140823_remove_undefined_and_false_notifications';

var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

/**
 * https://github.com/HabitRPG/habitrpg/pull/3907
 */

var mongo = require('mongoskin');
var _ = require('lodash');

// XXX @lefnire, choose wisely:
// var liveUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');
// var liveUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');

// For local testing by script author:
// var liveUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');


var fields = {migration:1,newMessages:1};
var progressCount = 1000;
// var progressCount = 1;
var count = 0;
liveUsers.findEach({migration: {$ne:migrationName}}, fields, {batchSize:250}, function(err, user){
  count++;
  if (!user) err = '!user';
  if (err) {return console.error(err);}

 var newNewMessages = {};
  _.each(user.newMessages,function(val,key){
    // console.log(key + " " + val.name);
    if(key != "undefined" && val['value']){
      newNewMessages[key] = val;
    }
  })

  liveUsers.update({_id:user._id}, {$set:{newMessages:newNewMessages, migration:migrationName}, $inc:{_v:1}});

  if (count%progressCount == 0) console.log(count + ' ' + user._id);
  if (user._id == '9') console.log('lefnire processed');
  if (user._id == authorUuid) console.log(authorName + ' processed');
});
