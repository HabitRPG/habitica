require('coffee-script') // for habitrpg-shared
var nconf = require('nconf');
require('./config');
var async = require('async');
var mongoose = require('mongoose');
User = require('./models/user').model;
Group = require('./models/group').model;

async.waterfall([
  function(cb){
    mongoose.connect(nconf.get('NODE_DB_URI'), cb);
  },
  function(cb){
    Group.findById('habitrpg', cb);
  },
  function(tavern, cb){
    console.log({tavern:tavern,cb:cb});
    if (!tavern) {
      tavern = new Group({
        _id: 'habitrpg',
        chat: [],
        leader: '9',
        name: 'HabitRPG',
        type: 'guild'
      });
      tavern.save(cb)
    } else {
      cb();
    }
  }
],function(err){
  if (err) throw err;
  console.log("Dont initializing database");
})