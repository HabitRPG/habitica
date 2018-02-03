/*
 * Remove empty private groups
 */

var mongo = require('mongoskin');

var dbserver = 'url';
var dbname = 'name';

var db = mongo.db(dbserver + '/' + dbname + '?auto_reconnect');
var dbGroups = db.collection('groups');

console.log('Begins work on db');

dbGroups.findEach({
  memberCount: 0,
}, {_id: 1}, function(err, res){
  if(err) throw err;

  console.log(res);
});