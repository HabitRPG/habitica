var migrationName = '20140829_change_headAccessory_to_eyewear';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/**
 * count_users_who_own_specified_gear.js
 * https://github.com/HabitRPG/habitrpg/pull/3884
 */

var mongo = require('mongoskin');
var _ = require('lodash');

///////////////////    UNCOMMENT *ONE* OF THESE LINES:    ///////////////////
// var dbUsers = mongo.db('lefnire:mAdn3s5s@charlotte.mongohq.com:10015/habitrpg_large?auto_reconnect').collection('users');   // @lefnire production?
// var dbUsers = mongo.db('localhost:27017/habitrpg_old?auto_reconnect').collection('users');   // @lefnire habitrpg_old
var dbUsers = mongo.db('localhost:27017/habitrpg?auto_reconnect').collection('users');   // for local testing by script author (e.g., vagrant install)
if (typeof dbUsers == 'undefined') { exiting(1, 'Uncomment one of the "var dbUsers" lines!'); }

var thingsOfInterest = {
	'items.gear.owned': [
		'headAccessory_special_wondercon_red',
		'headAccessory_special_wondercon_black',
		'back_special_wondercon_black',
		'back_special_wondercon_red',
		'body_special_wondercon_red',
		'body_special_wondercon_black',
		'body_special_wondercon_gold'
	],
	'purchased.skin': [
		'monster',
		'pumpkin',
		'skeleton',
		'zombie',
		'ghost',
		'shadow'
	]
};

var thingsOfInterest = [ // TST
    'headAccessory_special_wondercon_red',
    'headAccessory_special_wondercon_black',
    'back_special_wondercon_black',
    'back_special_wondercon_red',
    'body_special_wondercon_red',
    'body_special_wondercon_black',
    'body_special_wondercon_gold'
];

var query = {};  // Not worth limiting search data with query and fields since
var fields = {}; // this will be run over a local copy of the database?

var thingsFound = {};  // each key is one "thing" from thingsOfInterest,
        // and the value for that key is the number of users who own it
        // (for items, 'owned' values of both true and false are counted
        // to include items lost on death)

console.warn('Finding data...');
var progressCount = 1000;
var count = 0;
// db.users.find().forEach(function(user) { ... });
dbUsers.findEach(query, fields, {batchSize:250}, function(err, user) {
    if (err) { return exiting(1, 'ERROR! ' + err); }
    if (!user) {
        console.warn('All users found.');
        return displayData();
    }
    count++;


/*
    _.each(['costume','equipped'],function(type){
                unset['items.gear.'+type+'.headAccessory'] = "";
                  set['items.gear.'+type+'.eyewear'] = newName;
    });
    _.each(oldToNew,function(newName,oldName){
            unset['items.gear.owned.'+oldName] = "";
    });
*/

    var owned = user.items.gear.owned;
    for (var i=0, ic=thingsOfInterest.length; i<ic; i++) {
        var thingsKey = thingsOfInterest[i];
        if (thingsKey in owned) {
            thingsFound[thingsKey] = (thingsFound[thingsKey] || 0) + 1;
            // console.warn(user.auth.local.username + ":  " + thingsKey); // good for testing, bad for privacy
        }
    }
	// console.warn(JSON.stringify(thingsFound, null, "  "));

    if (count%progressCount == 0) console.warn(count + ' ' + user._id);
    if (user._id == '9') console.warn('lefnire processed');
    if (user._id == authorUuid) console.warn(authorName + ' processed');
});


function displayData() {
	var today = yyyymmdd(new Date());

	var header = '"date"'; // heading row in CSV data
	var data   = '"' + today + '"'; // data row in CSV data
	for (var i=0, ic=thingsOfInterest.length; i<ic; i++) {
		var thingsKey = thingsOfInterest[i];
		header += ',"' + thingsKey + '"';
		data += ',"' + (thingsFound[thingsKey] || 0) + '"';
	}

    //_.each(userResults, function(text, uuid) {
        //console.log(text); // text contains uuid
    //});

	console.log("\nCSV DATA:\n");
	console.log(header);
	console.log(data);
	console.log("\nREADABLE DATA:\n");
	console.log(today);
	console.log(JSON.stringify(thingsFound, null, "  "));
	console.log("\n");

    console.warn('\n' + count + ' users searched\n');
    return exiting(0);
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


/*  SAMPLE OUTPUT:
> load("count_users_who_own_specified_gear.js")

CSV DATA:

"date","headAccessory_special_wondercon_red","headAccessory_special_wondercon_black","back_special_wondercon_black","back_special_wondercon_red","body_special_wondercon_red","body_special_wondercon_black","body_special_wondercon_gold"
"2014-08-17","5","4","3","3","3","3","3"

READABLE DATA:

2014-08-17
{
  "headAccessory_special_wondercon_red": 5,
  "headAccessory_special_wondercon_black": 4,
  "back_special_wondercon_black": 3,
  "back_special_wondercon_red": 3,
  "body_special_wondercon_red": 3,
  "body_special_wondercon_black": 3,
  "body_special_wondercon_gold": 3
}


true
> 
*/

