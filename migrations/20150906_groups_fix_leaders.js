/*
 * Make sure leaders are existing users
 */

var mongo = require('mongoskin');
var async = require('async');

var dbserver = 'url';
var dbname = 'dbname';
var countGroups = 0;
var countUsers = 0;

var db = mongo.db(dbserver + '/' + dbname + '?auto_reconnect');
var dbUsers = db.collection('users');
var dbGroups = db.collection('groups');

console.log('Begins work on db');

function findGroups(gt){
  var query = {};
  if(gt) query._id = {$gt: gt};

  console.log(query)

  dbGroups.find(query, {
    fields: {_id: 1, members: 1, leader: 1},
    limit: 10000,
    sort: {
      _id: 1
    }
  }).toArray(function(err, groups){
    if(err) throw err;

    var lastGroup = null;
    if(groups.length === 10000){
      lastGroup = groups[groups.length - 1];
    }

    async.eachLimit(groups, 30, function(group, cb1){
      countGroups++;
      console.log('Group: ', countGroups, group._id);

      var members = group.members;

      dbUsers.findOne({_id: group.leader}, {fields: {_id: 1}}, function(err, user){
        if(err) return cb1(err);

        // If leader has deleted account
        if(!user && (group._id !== 'habitrpg') && members && members[0]) {
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
            if(err) return cb1(err);

            console.log('Updated: ', res);
            return cb1();
          });
        }else{
          return cb1();
        }
      });
    }, function(err){
      if(err) throw err;

      if(lastGroup && lastGroup._id){
        findGroups(lastGroup._id);
      }
    });
  });
};

findGroups();