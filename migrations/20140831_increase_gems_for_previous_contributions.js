// IMPORTANT:
//
// run like this to capture all output:
// node 20140831_increase_gems_for_previous_contributions.js  > 20140831_increase_gems_for_previous_contributions_output.txt


var migrationName = '20140831_increase_gems_for_previous_contributions';
// author: Alys (d904bd62-da08-416b-a816-ba797c9ee265)

/**
 * https://github.com/HabitRPG/habitrpg/issues/3933
 * Increase Number of Gems for Contributors
 * 
 * Increase everyone's gems per their contribution level.
 * Originally they were given 2 gems per tier.
 * Now they are given 3 gems per tier for tiers 1,2,3
 *                and 4 gems per tier for tiers 4,5,6,7
 * So that means an EXTRA 1 for tier 1,
 *                        2 for tier 2,
 *                        3 for tier 3,
 *                        5 for tier 4,
 *                        7 for tier 5,
 *                        9 for tier 6,
 *                       11 for tier 7,
 *                       11 for tier 8 (moderators = tier 7 + admin privileges),
 *                     none for tier 9 (staff)
 */

var mongo = require('mongoskin');
var _ = require('lodash');


///////////////////    UNCOMMENT *ONE* OF THESE LINES:    ///////////////////
// var dbUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');   // @lefnire production?
// var dbUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');   // @lefnire habitrpg_old
// var dbUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');   // for local testing by script author (e.g., vagrant install)


var fields = {'migration':1,
    'contributor.level':1,
    'auth.local.username':1,
    'balance':1,
    };

dbUsers.findEach({ $and: [
  { 'contributor.level': {$gt:0} },
  { 'contributor.level': {$lt:9} }
]}, fields, {batchSize:250}, function(err, user){
    if (!user) err = '!user';
    if (err) {return console.error(err);}

    var set = {'migration': migrationName};

    var tier = user.contributor.level;
    var extraGems = tier; // tiers 1,2,3
    if (tier > 3) {
        extraGems = 3 + (tier - 3) * 2;
    }
    if (tier == 8) {
        extraGems = 11; // mods (tier 8) are tier 7 in terms of gems awarded
    }
    extraBalance = extraGems / 4;
    set['balance'] = user.balance + extraBalance;

    // Display current state of user:
    console.log("\n" + user._id + "  " + user.auth.local.username + ":\n" +
        "  contrib tier          :  " + tier + "\n" +
        "  balance before        :  " + user.balance + "\n" +
        "  balance (gems) added  :  " + extraBalance + " (" +
                                        extraGems + ")" + "\n" +
        "  expected balance after:  " + (user.balance + extraBalance));

    //console.log(JSON.stringify(user, null, "  "));
    //console.log("set: "   + JSON.stringify(set,   null, "  "));

    dbUsers.update({_id:user._id}, {$set:set, $inc:{_v:1}});

    // No progress counter because we print output for every user.
});
