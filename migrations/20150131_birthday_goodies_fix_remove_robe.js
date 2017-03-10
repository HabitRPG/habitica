var migrationName = '20150131_birthday_goodies_fix__one_birthday__1';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/*
 * remove new birthday robes and second achievement from people who shouldn't have them
 */

var dbserver = 'localhost:27017' // CHANGE THIS FOR PRODUCTION DATABASE

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/habitrpg?auto_reconnect').collection('users');

    // 'auth.timestamps.created':{$gt:new Date('2014-02-01')},
var query = {
    'achievements.habitBirthdays':1,
    'auth.timestamps.loggedin':{$gt:new Date('2014-12-20')}
    };

    // '_id': 'c03e41bd-501f-438c-9553-a7afdf52a08c',
    // 'achievements.habitBirthday':{$exists:false},
    // 'items.gear.owned.armor_special_birthday2015':1

var fields = {
    // 'auth.timestamps.created':1,
    // 'achievements.habitBirthday':1,
    // 'achievements.habitBirthdays':1,
    'items.gear.owned.armor_special_birthday2015':1,
    // 'items.gear.owned.armor_special':1
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

    var unset = {'items.gear.owned.armor_special_birthday2015': 1};
    // var set = {'migration':migrationName, 'achievements.habitBirthdays':1 };
    // var inc = {'xyz':1, _v:1};
    dbUsers.update({_id:user._id}, {$unset:unset}); // , $inc:inc});
    // dbUsers.update({_id:user._id}, {$unset:unset, $set:set});
    // console.warn(user.auth.timestamps.created);

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
