var migrationName = 'restock_armoire_for_users_that_need_it.js';
var authorName = 'Alys (ALittleYellowSpider)'; // in case script author needs to know when their ...
var authorUuid = '3e595299-3d8a-4a10-bfe0-88f555e4aa0c'; //... own data is done

/*
 * Remove flag stating that the Enchanted Armoire is empty,
 * for when new equipment has been added 
 * AND the normal restock_armoire.js script has failed.
 * This script finds all users that logged in recently, checks if they
 * do NOT own all Armoire items, and only then does it mark the Armoire
 * as not empty.
 * 
 *********************************************************************
 * IMPORTANT:
 * You must update the list of Armoire items that this list checks for.
 * Scroll down. You'll see it.
 *********************************************************************
 * 
 */

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

var monk = require('monk');
var dbUsers = monk(connectionString).get('users', { castIds: false });


function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'auth.timestamps.loggedin':{$gt:new Date('2016-01-04')}
    // '_id': authorUuid // FOR TESTING
  };

  // specify a query to limit the affected users (empty for all users):
  var fields = {
    'flags.armoireEmpty':1,
    'items.gear.owned':1
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: {
      'flags.armoireEmpty':1,
      'items.gear.owned':1
    } // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
  .then(updateUsers)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 1000;
var count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  var userPromises = users.map(updateUser);
  var lastUser = users[users.length - 1];

  return Promise.all(userPromises)
  .then(function () {
    processUsers(lastUser._id);
  });
}

function updateUser (user) {
  count++;

  var set = {'migration':migrationName, 'flags.armoireEmpty':false};


  if (user.flags.armoireEmpty) {
    // this user believes their armoire has no more items in it
    if (user.items.gear.owned.weapon_armoire_barristerGavel && user.items.gear.owned.armor_armoire_barristerRobes && user.items.gear.owned.head_armoire_jesterCap && user.items.gear.owned.armor_armoire_jesterCostume && user.items.gear.owned.head_armoire_barristerWig && user.items.gear.owned.weapon_armoire_jesterBaton && user.items.gear.owned.weapon_armoire_lunarSceptre && user.items.gear.owned.armor_armoire_gladiatorArmor && user.items.gear.owned.weapon_armoire_basicCrossbow && user.items.gear.owned.head_armoire_gladiatorHelm && user.items.gear.owned.armor_armoire_lunarArmor && user.items.gear.owned.head_armoire_redHairbow && user.items.gear.owned.head_armoire_violetFloppyHat && user.items.gear.owned.head_armoire_rancherHat && user.items.gear.owned.shield_armoire_gladiatorShield && user.items.gear.owned.head_armoire_blueHairbow && user.items.gear.owned.weapon_armoire_mythmakerSword && user.items.gear.owned.head_armoire_royalCrown && user.items.gear.owned.head_armoire_hornedIronHelm && user.items.gear.owned.weapon_armoire_rancherLasso && user.items.gear.owned.armor_armoire_rancherRobes && user.items.gear.owned.armor_armoire_hornedIronArmor && user.items.gear.owned.armor_armoire_goldenToga && user.items.gear.owned.weapon_armoire_ironCrook && user.items.gear.owned.head_armoire_goldenLaurels && user.items.gear.owned.head_armoire_redFloppyHat && user.items.gear.owned.armor_armoire_plagueDoctorOvercoat && user.items.gear.owned.head_armoire_plagueDoctorHat && user.items.gear.owned.weapon_armoire_goldWingStaff && user.items.gear.owned.head_armoire_yellowHairbow && user.items.gear.owned.eyewear_armoire_plagueDoctorMask && user.items.gear.owned.head_armoire_blackCat && user.items.gear.owned.weapon_armoire_batWand && user.items.gear.owned.head_armoire_orangeCat && user.items.gear.owned.shield_armoire_midnightShield && user.items.gear.owned.armor_armoire_royalRobes && user.items.gear.owned.head_armoire_blueFloppyHat && user.items.gear.owned.shield_armoire_royalCane && user.items.gear.owned.weapon_armoire_shepherdsCrook && user.items.gear.owned.armor_armoire_shepherdRobes && user.items.gear.owned.head_armoire_shepherdHeaddress && user.items.gear.owned.weapon_armoire_blueLongbow && user.items.gear.owned.weapon_armoire_crystalCrescentStaff && user.items.gear.owned.head_armoire_crystalCrescentHat && user.items.gear.owned.armor_armoire_dragonTamerArmor && user.items.gear.owned.head_armoire_dragonTamerHelm && user.items.gear.owned.armor_armoire_crystalCrescentRobes && user.items.gear.owned.shield_armoire_dragonTamerShield && user.items.gear.owned.weapon_armoire_glowingSpear) {
      // this user does have all the armoire items so we don't change the flag
    // console.log("don't change: " + user._id); // FOR TESTING
    } else {
      // console.log("change: " + user._id); // FOR TESTING
      dbUsers.update({_id: user._id}, {$set: set});
    }
  } else {
    // this user already has armoire marked as containing items to be bought
    // so don't change the flag
    // console.log("DON'T CHANGE: " + user._id); // FOR TESTING
  }

  if (count % progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');
}

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

module.exports = processUsers;
