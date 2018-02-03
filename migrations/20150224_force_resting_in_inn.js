var migrationName = '20150224_force_resting_in_inn';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/*
 * force all active players to rest in the inn due to massive server fail
 */

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var dbserver = 'localhost:27017' // CHANGE THIS FOR PRODUCTION DATABASE

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/habitrpg?auto_reconnect').collection('users');

var query = {
    'auth.timestamps.loggedin':{$gt:new Date('2015-02-22')}
    };

var fields = {
	'preferences.sleep':1,
    };

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

    var set = {'migration':migrationName, 'preferences.sleep':1 };
    dbUsers.update({_id:user._id}, {$set:set});

    if (count%progressCount == 0) console.warn(count + ' ' + user._id);
    if (user._id == authorUuid) console.warn(authorName + ' processed');
    if (user._id == '9'       ) console.warn('lefnire'  + ' processed');
});


function displayData() {
    console.warn('\n' + count + ' users processed\n');
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
