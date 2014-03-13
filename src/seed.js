require('coffee-script') // for habitrpg-shared
var nconf = require('nconf');
var utils = require('./utils');
var logging = require('./logging');
utils.setupConfig();
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
    logging.info({tavern:tavern,cb:cb});
    if (!tavern) {
      tavern = new Group({
        _id: 'habitrpg',
        chat: [],
        leader: '9',
        name: 'HabitRPG',
        type: 'guild',
        privacy:'public'
      });
      tavern.save(cb)
    } else {
      cb();
    }
  }
],function(err){
  if (err) throw err;
  logging.info("Done initializing database");
  mongoose.disconnect();
})
