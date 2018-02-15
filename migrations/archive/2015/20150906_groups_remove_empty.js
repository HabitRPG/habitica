/*
 * Remove empty private groups
 */

let mongo = require('mongoskin');

let dbserver = 'url';
let dbname = 'name';

let db = mongo.db(`${dbserver  }/${  dbname  }?auto_reconnect`);
let dbGroups = db.collection('groups');

console.log('Begins work on db');

dbGroups.findEach({
  memberCount: 0,
}, {_id: 1}, function (err, res) {
  if (err) throw err;

  console.log(res);
});