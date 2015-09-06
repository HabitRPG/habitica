/*
 * Make sure leaders are existing users
 */

var mongo = require('mongoskin');

var dbserver = 'mongodb://url';
var dbname = 'dbname';
var countGroups = 0;
var countUsers = 0;

var db = mongo.db(dbserver + '/' + dbname + '?auto_reconnect');
var dbUsers = db.collection('users');
var dbGroups = db.collection('groups');

console.log('Begins work on db');

dbGroups.findEach({}, {_id: 1, members: 1, leader: 1}, {batchSize: 500}, function(err, group) {
  if(err) throw err;
  if(!group) return;

  countGroups++;
  console.log('Group: ', countGroups);

  var members = group.members;
  var leader = group.leader;

  dbUsers.count({_id: group.leader}, function(err, count){
    if(err) throw err;

    // If leader has deleted account
    if(count < 1 && (group._id !== 'habitrpg') && members && members[0]) {
      dbGroups.update({
        _id: group._id
      }, {
        $set: {
          // Set first user as new leader
          leader: members[0]
        }
      }, {
        multi: false
      }, function(err, res){
        if(err) throw err;

        console.log('Updated: ', res);
      });
    }
  })
});