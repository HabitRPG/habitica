var migrationName = '20150201_convert_creation_date_from_string_to_object__no_date_recent_signup';
//// var migrationName = '20150201_convert_creation_date_from_string_to_object';

var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/*
 * For users that have no value for auth.timestamps.created, assign them
 * a recent value.
 *
 * NOTE:
 * Before this script was used as described above, it was first used to
 * find all users that have a auth.timestamps.created field that is a string
 * rather than a date object and set it to be a date object. The code used
 * for this has been commented out with four slashes: ////
 * 
 * https://github.com/HabitRPG/habitrpg/issues/4601#issuecomment-72339846
 */

var dbserver = 'localhost:27017' // CHANGE THIS FOR PRODUCTION DATABASE

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');
var moment = require('moment');

var dbUsers = mongo.db(dbserver + '/habitrpg?auto_reconnect').collection('users');

var uuidArrayRecent=[ // recent users with no creation dates
'1a0d4b75-73ed-4937-974d-d504d6398884',
'1c7ebe27-1250-4f95-ba10-965580adbfd7',
'5f972121-4a6d-411c-95e9-7093d3e89b66',
'ae85818a-e336-4ccd-945e-c15cef975102',
'ba273976-d9fc-466c-975f-38559d34a824',
];

var query = {
    '_id':{$in: uuidArrayRecent}
    //// 'auth':{$exists:true},
    //// 'auth.timestamps':{$exists:true},
    //// 'auth.timestamps.created':{$not: {$lt:new Date('2018-01-01')}}
    };

var fields = {
    '_id':1,
    'auth.timestamps.created':1
    };
    // 'achievements.habitBirthdays':1

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

    //// var oldDate = user.auth.timestamps.created;
    //// var newDate = moment(oldDate).toDate();
    var oldDate = 'none';
    var newDate = moment('2015-01-11').toDate();
    console.warn(user._id + ' == ' + oldDate + ' == ' + newDate);

    //// var set = { 'migration': migrationName,
                //// 'auth.timestamps.created': newDate,
                //// 'achievements.habitBirthdays': 2,
                //// 'items.gear.owned.head_special_nye':true,
                //// 'items.gear.owned.head_special_nye2014':true,
                //// 'items.gear.owned.armor_special_birthday':true,  
                //// 'items.gear.owned.armor_special_birthday2015':true,
                //// };

    var set = { 'migration': migrationName,
                'auth.timestamps.created': newDate,
                'achievements.habitBirthdays': 1,
                'items.gear.owned.armor_special_birthday':true,  
                };

    // var unset = {'items.gear.owned.armor_special_birthday2015': 1};
    // var inc = {'xyz':1, _v:1};
    dbUsers.update({_id:user._id}, {$set:set});
    // dbUsers.update({_id:user._id}, {$unset:unset, $set:set, $inc:inc});

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
