var migrationName = '20140914_upgrade_admin_contrib_tiers';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/**
 * https://github.com/HabitRPG/habitrpg/issues/3801
 * Convert Tier 8 contributors to Tier 9 (staff) (all current Tier 8s are admins).
 * Convert Tier 7 contributors with admin flag to Tier 8 (moderators).
 */

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');

var query =
  { 'contributor.level':{$gte:7}, 'contributor.admin':true, 'migration': {$ne: migrationName} };

var fields = {'migration':1,
    'contributor.admin':1,
    'contributor.level':1,
    'auth.local.username':1,
    'profile.name':1,
    };

var userResults = {}; // each key is a UUID, each value is a username;
                      // contains only the users changed

console.warn('Updating users...');
var progressCount = 1000;
var count = 0;
dbUsers.findEach(query, fields, {batchSize:250}, function(err, user) {
    if (err) { return exiting(1, 'ERROR! ' + err); }
    if (!user) {
        console.warn('All appropriate users found and modified.');
        return displayData();
    }
    count++;

    var set = {'migration': migrationName};
    var inc = {'contributor.level':1, _v:1};

    userResults[user._id] = user.profile.name;

    dbUsers.update({_id:user._id}, {$set:set, $inc:inc});

    if (count%progressCount == 0) console.warn(count + ' ' + user._id);
    if (user._id == authorUuid) console.warn(authorName + ' processed');
    if (user._id == '9'       ) console.warn('lefnire'  + ' processed');
});


function displayData() {
	console.log('users modified:');
    _.each(userResults, function(name, uuid) {
        console.log(name);
    });
    console.warn('\n' + count +
            ' users processed (should be 11 according to the Hall)\n');
    return exiting(0);
}


function exiting(code, msg) {
    code = code || 0; // 0 = success
    if (code && !msg) { msg = 'ERROR!'; }
    if (msg) {
        if (code) { console.error(msg); }
        else      { console.log(  msg); }
    }
    process.exit(code);
}

