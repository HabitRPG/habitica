var migrationName = '20150131_birthday_goodies_fix_remove_robe.js';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/**
 * remove new birthday robes from people who don't have original birthday achievement
 */

var dbserver = 'localhost:27017' // CHANGE THIS FOR PRODUCTION DATABASE

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/habitrpg?auto_reconnect').collection('users');

var query = {
	'achievements.habitBirthday':{$exists:false}
	};

var fields = {
	'items.gear.owned.armor_special_birthday2015':1
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
    var set = {'migration': migrationName};
    // var inc = {'xyz':1, _v:1};
    dbUsers.update({_id:user._id}, {$unset:unset, $set:set}); // , $inc:inc});

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
