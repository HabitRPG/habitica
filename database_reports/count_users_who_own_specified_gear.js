var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/**
 * database_reports/count_users_who_own_specified_gear.js
 * https://github.com/HabitRPG/habitrpg/pull/3884
 */

var thingsOfInterest = {
	'Unconventional Armor ownership': {
		'data_path': 'items.gear.owned',
		'identifyOwnershipWith': 'exists',
		'items': [
			'headAccessory_special_wondercon_red',
			'headAccessory_special_wondercon_black',
			'back_special_wondercon_black',
			'back_special_wondercon_red',
			'body_special_wondercon_red',
			'body_special_wondercon_black',
			'body_special_wondercon_gold'
		],
	},
	'Spooky Skins purchases': {
		'data_path': 'purchased.skin',
		'identifyOwnershipWith': 'true',
		'items': [
			'monster',
			'pumpkin',
			'skeleton',
			'zombie',
			'ghost',
			'shadow'
		]
	}
};

var mongo = require('mongoskin');
var _ = require('lodash');

////////////////    UNCOMMENT ONE OF THESE mongo.db LINES:    ////////////////
// var dbUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');   // @lefnire production?
// var dbUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');   // @lefnire habitrpg_old
// var dbUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');   // for local testing by script author (e.g., vagrant install)
if (typeof dbUsers == 'undefined') { exiting(1, 'Uncomment one of the "var dbUsers" lines!'); }

var thingsFound = {};  // each key is one "thing" from thingsOfInterest,
        // and the value for that key is the number of users who own it
        // (for items, 'owned' values of both true and false are counted
        // to include items lost on death)

var query  = {}; // Not worth limiting search data with query and fields since
var fields = {}; // this will be run over a local copy of the database?

console.warn('Finding data...');
var progressCount = 1000;
var count = 0;
dbUsers.findEach(query, fields, {batchSize:250}, function(err, user) {
    if (err) { return exiting(1, 'ERROR! ' + err); }
    if (!user) {
        console.warn('All users found.');
        return displayData();
    }
    count++;

    _.each(thingsOfInterest,function(obj,label){
		var data_path = obj['data_path'];
		var items = obj['items'];
		var identifyOwnershipWith = obj['identifyOwnershipWith'];
		var userOwns = path(user, data_path);

		_.each(items,function(item){
			if ( (identifyOwnershipWith == 'exists' && item in userOwns) ||
			     (identifyOwnershipWith == 'true'   && userOwns[item])
			   ) {
				if (! thingsFound[label]) { thingsFound[label] = {}; }
				thingsFound[label][item] = (thingsFound[label][item] || 0) + 1;
				// console.warn(user.auth.local.username + ":  " + label + ":  " + item); // good for testing, bad for privacy
			}
		});
	});

    if (count%progressCount == 0) console.warn(count + ' ' + user._id);
    if (user._id == authorUuid) console.warn(authorName + ' processed');
    if (user._id == '9'       ) console.warn('lefnire'  + ' processed');
});


function displayData() {
	var today = yyyymmdd(new Date());
	var report = '';
	_.each(thingsFound,function(obj,label){
		report += '"' + label + '"' + '\n';
		var header = '"date"'; // heading row in CSV data
		var data   = '"' + today + '"'; // data row in CSV data
		_.each(obj,function(value,key){
			header += ',"' + key + '"';
			data += ',"' + (value || 0) + '"';
		});
		report += header + '\n' + data + '\n\n';
	});

	console.log('\nCSV DATA:\n\n' +
	            report +
	            '\nREADABLE DATA:\n\n' +
	            today + '\n' +
	            JSON.stringify(thingsFound, null, '    ') +
	            '\n');

    console.warn('\n' + count + ' users searched (should be >400k)\n');
	// NB: "should be" assumes that no query filter was applied to findEach

    return exiting(0);
}


function path(obj, path, def) {
/**
 * Retrieve nested item from object/array
 * @param {Object|Array} obj
 * @param {String} path dot separated
 * @param {*} def default value ( if result undefined )
 * @returns {*}
 * http://stackoverflow.com/a/16190716
 * Usage: console.log(path(someObject, pathname));
 */
	for(var i = 0,path = path.split('.'),len = path.length; i < len; i++){
		if(!obj || typeof obj !== 'object') return def;
		obj = obj[path[i]];
	}
	if(obj === 'undefined') return def;
	return obj;
}


function yyyymmdd(date) {
    var yyyy =  date.getFullYear().toString();
    var mm   = (date.getMonth()+1).toString();
    var dd   =  date.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]);
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


/*  SAMPLE OUTPUT (STDOUT and STDERR):
$ node database_reports/count_users_who_own_specified_gear.js 

Finding data...
Alys processed
lefnire processed
All users found.

CSV DATA:

"Unconventional Armor ownership"
"date","headAccessory_special_wondercon_red","headAccessory_special_wondercon_black","back_special_wondercon_black","back_special_wondercon_red","body_special_wondercon_red","body_special_wondercon_black","body_special_wondercon_gold"
"2014-09-01","9","7","7","7","7","7","7"

"Spooky Skins purchases"
"date","monster","pumpkin","skeleton","zombie","ghost","shadow"
"2014-09-01","3","3","4","3","2","6"


READABLE DATA:

2014-09-01
{
    "Unconventional Armor ownership": {
        "headAccessory_special_wondercon_red": 9,
        "headAccessory_special_wondercon_black": 7,
        "back_special_wondercon_black": 7,
        "back_special_wondercon_red": 7,
        "body_special_wondercon_red": 7,
        "body_special_wondercon_black": 7,
        "body_special_wondercon_gold": 7
    },
    "Spooky Skins purchases": {
        "monster": 3,
        "pumpkin": 3,
        "skeleton": 4,
        "zombie": 3,
        "ghost": 2,
        "shadow": 6
    }
}


400100 users searched (should be >400k)

*/
