// node .migrations/20131022_restore_ads.js
let mongo = require('mongoskin');
let _ = require('lodash');
let dbBackup = mongo.db('localhost:27017/habitrpg?auto_reconnect');
let dbLive = mongo.db('localhost:27017/habitrpg2?auto_reconnect');
let count = 89474;
dbBackup.collection('users').findEach({$or: [{'flags.ads': 'show'}, {'flags.ads': null}]}, {batchSize: 10}, function (err, item) {
  if (err) return console.error({err});
  if (!item || !item._id) return console.error('blank user');
  dbLive.collection('users').update({_id: item._id}, {$set: {'purchased.ads': false}, $unset: {'flags.ads': 1}});
  if (--count <= 0) console.log('DONE!');
});