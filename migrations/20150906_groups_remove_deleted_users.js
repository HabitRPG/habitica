/*
 * Remove deleted accounts from groups
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

dbGroups.findEach({}, {_id: 1, members: 1}, {batchSize: 500}, function(err, group) {
  if(err) throw err;
  if(!group) return;

  countGroups++;
  console.log('Group: ', countGroups);

  var members = group.members;

  // Remove users who deleted their account
  members.forEach(function(member){
    dbUsers.count({_id: member}, function(err, count){
      if(err) throw err;

      if(count < 1 && (group._id !== 'habitrpg')) {
        countUsers++;
        console.log('User: ', countUsers);

        // TODO updating the same group many times concurrently can cause problems?
        dbGroups.update({
          _id: group._id
        }, {
          $pull: {members: member},
          $inc: {memberCount: -1}
        }, {
          multi: false
        }, function(err, res){
          if(err) throw err;

          console.log('Updated: ', res);
        });
      }
    });
  });
});