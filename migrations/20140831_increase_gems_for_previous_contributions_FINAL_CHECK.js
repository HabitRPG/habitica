// IMPORTANT:
//
// run like this to capture all output:
// node 20140831_increase_gems_for_previous_contributions_FINAL_CHECK.js  > 20140831_increase_gems_for_previous_contributions_FINAL_CHECK_output.txt



// 20140831_increase_gems_for_previous_contributions_FINAL_CHECK.js
// author: Alys (d904bd62-da08-416b-a816-ba797c9ee265)

/**
 * Run this script immediately after
 *   20140831_increase_gems_for_previous_contributions.js
 * to capture the actual gem balance in case we need it later for
 * handling complaints that the right number of gems weren't added.
 */

var mongo = require('mongoskin');
var _ = require('lodash');

///////////////////    UNCOMMENT *ONE* OF THESE LINES:    ///////////////////
// var dbUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');   // @lefnire production?
// var dbUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');   // @lefnire habitrpg_old
var dbUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');   // for local testing by script author (e.g., vagrant install)


var fields = {
    'auth.local.username':1,
    'balance':1,
    };

dbUsers.findEach({ $and: [
  { 'contributor.level': {$gt:0} },
  { 'contributor.level': {$lt:9} }
]}, fields, {batchSize:250}, function(err, user){
    if (!user) err = '!user';
    if (err) {return console.error(err);}

    console.log("\n" + user._id + "  " + user.auth.local.username + ":\n" +
        "  actual balance after  :  " + user.balance);

    // No progress counter because we print output for every user.
});
