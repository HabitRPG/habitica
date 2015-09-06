/*
 * Remove emoty groups
 */

var mongo = require('mongoskin');

var dbserver = 'mongodb://url';
var dbname = 'db';

var db = mongo.db(dbserver + '/' + dbname + '?auto_reconnect');
var dbGroups = db.collection('groups');

console.log('Begins work on db');

dbGroups.remove({
  members: {$size: 0}
}, function(err, res){
  if(err) throw err;

  console.log(res);
});