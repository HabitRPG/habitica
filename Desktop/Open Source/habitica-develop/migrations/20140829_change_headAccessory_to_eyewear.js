//  node .migrations/20140829_change_headAccessory_to_eyewear.js

var migrationName = '20140829_change_headAccessory_to_eyewear';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

/**
 * https://github.com/HabitRPG/habitrpg/issues/3645
 */
var mongo = require('mongoskin');
var _ = require('lodash');
var liveUsers = mongo.db('localhost:27017/habitrpg2?auto_reconnect').collection('users');

var fields = {'migration':1,
    'items.gear.costume.headAccessory':1,
    'items.gear.equipped.headAccessory':1,
    'items.gear.owned.headAccessory_special_wondercon_black':1,
    'items.gear.owned.headAccessory_special_wondercon_red':1,
    'items.gear.owned.headAccessory_special_summerRogue':1,
    'items.gear.owned.headAccessory_special_summerWarrior':1
    };

var progressCount = 1000;
var count = 0;
liveUsers.findEach({ $and: [
  { migration: {$ne:migrationName} },
  { $or: [
    {'items.gear.owned.headAccessory_special_summerRogue':  {'$exists':true}},
    {'items.gear.owned.headAccessory_special_summerWarrior':{'$exists':true}},
    {'items.gear.owned.headAccessory_special_wondercon_red':{'$exists':true}},
    {'items.gear.owned.headAccessory_special_wondercon_black':{'$exists':true}}
  ]}
]}, fields, {batchSize:250}, function(err, user){
    count++;
    if (!user) err = '!user';
    if (err) {return console.error(err);}

    var set = {'migration': migrationName};
    var unset = {};

    var oldToNew = {
      'headAccessory_special_summerRogue':    'eyewear_special_summerRogue',
      'headAccessory_special_summerWarrior':  'eyewear_special_summerWarrior',
      'headAccessory_special_wondercon_red':  'eyewear_special_wondercon_red',
      'headAccessory_special_wondercon_black':'eyewear_special_wondercon_black'
    };

    // items.gear.costume, items.gear.equipped:
    _.each(['costume','equipped'],function(type){
        _.each(oldToNew,function(newName,oldName){
            if (user.items.gear[type].headAccessory === oldName) {
                unset['items.gear.'+type+'.headAccessory'] = "";
                  set['items.gear.'+type+'.eyewear'] = newName;
            }
        });
    });

    // items.gear.owned:
    _.each(oldToNew,function(newName,oldName){
        if (oldName in user.items.gear.owned) {
            unset['items.gear.owned.'+oldName] = "";
              set['items.gear.owned.'+newName] = user.items.gear.owned[oldName];
        }
    });

    //console.log(JSON.stringify(user, null, "  "));
    //console.log("set: "   + JSON.stringify(set,   null, "  "));
    //console.log("unset: " + JSON.stringify(unset, null, "  "));

    liveUsers.update({_id:user._id}, {$set:set, $unset:unset, $inc:{_v:1}});

    if (count%progressCount == 0) console.log(count + ' ' + user._id);
    if (user._id == '9') console.log('lefnire processed');
    if (user._id == authorUuid) console.log(authorName + ' processed');
});
