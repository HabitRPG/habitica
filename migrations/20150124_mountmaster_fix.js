var migrationName = '20150124_mountmaster_fix.js';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/**
 * https://github.com/HabitRPG/habitrpg/pull/4374#issuecomment-71038795
 * Convert false to null for mounts that used to be owned.
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

var query = {
	'items.mounts':{$exists:true}
	};

var fields = {
	'items.mounts':1
    };

var animals = [ "Wolf-Base", "Wolf-White", "Wolf-Desert", "Wolf-Red", "Wolf-Shade", "Wolf-Skeleton", "Wolf-Zombie", "Wolf-CottonCandyPink", "Wolf-CottonCandyBlue", "Wolf-Golden", "TigerCub-Base", "TigerCub-White", "TigerCub-Desert", "TigerCub-Red", "TigerCub-Shade", "TigerCub-Skeleton", "TigerCub-Zombie", "TigerCub-CottonCandyPink", "TigerCub-CottonCandyBlue", "TigerCub-Golden", "PandaCub-Base", "PandaCub-White", "PandaCub-Desert", "PandaCub-Red", "PandaCub-Shade", "PandaCub-Skeleton", "PandaCub-Zombie", "PandaCub-CottonCandyPink", "PandaCub-CottonCandyBlue", "PandaCub-Golden", "LionCub-Base", "LionCub-White", "LionCub-Desert", "LionCub-Red", "LionCub-Shade", "LionCub-Skeleton", "LionCub-Zombie", "LionCub-CottonCandyPink", "LionCub-CottonCandyBlue", "LionCub-Golden", "Fox-Base", "Fox-White", "Fox-Desert", "Fox-Red", "Fox-Shade", "Fox-Skeleton", "Fox-Zombie", "Fox-CottonCandyPink", "Fox-CottonCandyBlue", "Fox-Golden", "FlyingPig-Base", "FlyingPig-White", "FlyingPig-Desert", "FlyingPig-Red", "FlyingPig-Shade", "FlyingPig-Skeleton", "FlyingPig-Zombie", "FlyingPig-CottonCandyPink", "FlyingPig-CottonCandyBlue", "FlyingPig-Golden", "Dragon-Base", "Dragon-White", "Dragon-Desert", "Dragon-Red", "Dragon-Shade", "Dragon-Skeleton", "Dragon-Zombie", "Dragon-CottonCandyPink", "Dragon-CottonCandyBlue", "Dragon-Golden", "Cactus-Base", "Cactus-White", "Cactus-Desert", "Cactus-Red", "Cactus-Shade", "Cactus-Skeleton", "Cactus-Zombie", "Cactus-CottonCandyPink", "Cactus-CottonCandyBlue", "Cactus-Golden", "BearCub-Base", "BearCub-White", "BearCub-Desert", "BearCub-Red", "BearCub-Shade", "BearCub-Skeleton", "BearCub-Zombie", "BearCub-CottonCandyPink", "BearCub-CottonCandyBlue", "BearCub-Golden" ]; // all Gen1 mounts

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

    var mounts = user.items.mounts;
    var changed = false;
    for(var a in animals) {
      if(mounts[animals[a]] == false) {
        mounts[animals[a]] = null;
        changed = true;
      }
    }

    if (changed) {
      dbUsers.update(
         { _id: user._id},
         {
           $set: { "migration": migrationName,
                   "items.mounts" : mounts
           }
         }
      );
    }

    // var set = {'migration': migrationName};
    // var inc = {'xyz':1, _v:1};
    // dbUsers.update({_id:user._id}, {$set:set, $inc:inc});

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
