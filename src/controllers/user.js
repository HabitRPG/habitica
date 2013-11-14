/* @see ./routes.coffee for routing*/

var url = require('url');
var ipn = require('paypal-ipn');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var validator = require('validator');
var check = validator.check;
var sanitize = validator.sanitize;
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var api = module.exports;

// FIXME put this in a proper location
api.marketBuy = function(req, res, next){
  var user = res.locals.user,
    type = req.query.type,
    item = req.body;

  if (!_.contains(['hatchingPotion', 'egg', 'food'], type))
    return res.json(400, {err: "Type must be 'hatchingPotion', 'egg', or 'food'"});
  type = (type == 'food' ? type : type + 's'); // I'm stupid, we're passing up 'hatchingPotion' but we need 'hatchingPotions'
  if (!user.items[type][item.name]) user.items[type][item.name] = 0;
  user.items[type][item.name]++;
  user.balance -= (item.value/4);
  user.save(function(err, saved){
    if (err) return res.json(500, {err:err});
    res.json(saved);
  })
}


/*
  ------------------------------------------------------------------------
  Tasks
  ------------------------------------------------------------------------
*/


/*
  Local Methods
  ---------------
*/

/*
Validate task
*/
api.verifyTaskExists = function(req, res, next) {
  // If we're updating, get the task from the user
  var task = res.locals.user.tasks[req.params.id];
  if (_.isEmpty(task)) return res.json(400, {err: "No task found."});
  res.locals.task = task;
  return next();
};

function addTask(user, task) {
  task = helpers.taskDefaults(task);
  user[task.type+'s'].unshift(task);
  return task;
}

/*
  API Routes
  ---------------
*/

/**
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
*/
api.scoreTask = function(req, res, next) {
  var id = req.params.id,
    direction = req.params.direction,
    user = res.locals.user,
    task;

  // Send error responses for improper API call
  if (!id) return res.json(500, {err: ':id required'});
  if (direction !== 'up' && direction !== 'down') {
    if (direction == 'unlink') return next();
    return res.json(500, {err: ":direction must be 'up' or 'down'"});
  }
  // If exists already, score it
  if (task = user.tasks[id]) {
    // Set completed if type is daily or todo and task exists
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up';
    }
  } else {
    // If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it
    task = {
      id: id,
      value: 0,
      type: req.body.type || 'habit',
      text: req.body.title || id,
      notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
    };
    if (task.type === 'habit') {
      task.up = task.down = true;
    }
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up';
    }
    task = addTask(user, task);
  }
  var delta = algos.score(user, task, direction);
  //user.markModified('flags');
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    res.json(200, _.extend({
      delta: delta
    }, saved.toJSON().stats));
  });

  // if it's a challenge task, sync the score
  user.syncScoreToChallenge(task, delta);
};

/**
 * Get all tasks
 */
api.getTasks = function(req, res, next) {
  var user = res.locals.user;
  if (req.query.type) {
    return res.json(user[req.query.type+'s']);
  } else {
    return res.json(_.toArray(user.tasks));
  }
};

/**
 * Get Task
 */
api.getTask = function(req, res, next) {
  var task = res.locals.user.tasks[req.params.id];
  if (_.isEmpty(task)) return res.json(400, {err: "No task found."});
  return res.json(200, task);
};

/**
 * Delete Task
 */
api.deleteTask = function(req, res, next) {
  var user = res.locals.user;
  user.deleteTask(res.locals.task.id);
  user.save(function(err) {
    if (err) return res.json(500, {err: err});
    res.send(204);
  });
};

/*
  Update Task
*/
api.updateTask = function(req, res, next) {
  var user = res.locals.user;
  var tid = req.params.id;
  var task = user.tasks[req.params.id];
  _.merge(task, req.body);
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err})
    return res.json(200, task);
  });
};

api.createTask = function(req, res, next) {
  var user = res.locals.user;
  var task = addTask(user, req.body);
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    return res.json(201, task);
  });
};

api.sortTask = function(req, res, next) {
  var id = req.params.id;
  var to = req.body.to, from = req.body.from, type = req.body.type;
  var user = res.locals.user;
  user[type+'s'].splice(to, 0, user[type+'s'].splice(from, 1)[0]);
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    return res.json(200, saved.toJSON()[type+'s']);
  });
};

api.clearCompleted = function(req, res, next) {
  var user = res.locals.user;
  user.todos = _.where(user.todos, {completed: false});
  return user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    return res.json(saved);
  });
};

/*
  ------------------------------------------------------------------------
  Items
  ------------------------------------------------------------------------
*/
api.buy = function(req, res, next) {
  var hasEnough, type, user;
  user = res.locals.user;
  type = req.params.type;
  if (type !== 'weapon' && type !== 'armor' && type !== 'head' && type !== 'shield' && type !== 'potion') {
    return res.json(400, {err: ":type must be in one of: 'weapon', 'armor', 'head', 'shield', 'potion'"});
  }
  hasEnough = items.buyItem(user, type);
  if (hasEnough) {
    return user.save(function(err, saved) {
      if (err) return res.json(500, {err: err});
      return res.json(200, saved.toJSON().items);
    });
  } else {
    return res.json(200, {err: "Not enough GP"});
  }
};

/*
  ------------------------------------------------------------------------
  User
  ------------------------------------------------------------------------
*/

/**
 * Get User
 */
api.getUser = function(req, res, next) {
  var user = res.locals.user.toJSON();
  user.stats.toNextLevel = algos.tnl(user.stats.lvl);
  user.stats.maxHealth = 50;
  delete user.apiToken;
  if (user.auth) {
    delete user.auth.hashed_password;
    delete user.auth.salt;
  }
  return res.json(200, user);
};

/**
 * Update user
 * FIXME add documentation here
*/
api.updateUser = function(req, res, next) {
  var acceptableAttrs, errors, user;
  user = res.locals.user;
  errors = [];
  if (_.isEmpty(req.body)) {
    return res.json(200, user);
  }
  /*
  # FIXME we need to do some crazy sanitiazation if they're using the old `PUT /user {data}` method.
  # The new `PUT /user {'stats.hp':50}

  # FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
  # There's a trick here. In order to prevent prevent clobering top-level paths, we add `.` to make sure they're
  # sending bodies as {"set.this.path":value} instead of {set:{this:{path:value}}}. Permit lastCron since it's top-level
  # Note: custom is for 3rd party apps
  */

  acceptableAttrs = 'tasks. achievements. filters. flags. invitations. items. lastCron party. preferences. profile. stats. tags custom.'.split(' ');
  _.each(req.body, function(v, k) {
    var found = _.find(acceptableAttrs, function(attr) { return k.indexOf(attr) == 0; })
    if (found) {
//      if (_.isObject(v)) {
//        errors.push("Value for " + k + " was an object. Be careful here, you could clobber stuff.");
//      }
      helpers.dotSet(k, v, user);
    } else {
      errors.push("path `" + k + "` was not saved, as it's a protected path. Make sure to send `PUT /api/v1/user` request bodies as `{'set.this.path':value}` instead of `{set:{this:{path:value}}}`");
    }
    return true;
  });
  user.save(function(err) {
    if (!_.isEmpty(errors)) return res.json(500, {err: errors});
    if (err) {return res.json(500, {err: err})}
    res.json(200, user);
  });
};

api.cron = function(req, res, next) {
  var user = res.locals.user;
  algos.cron(user);
  if (user.isModified()) {
    res.locals.wasModified = true;
    user.auth.timestamps.loggedin = new Date();
  }
  user.save(next);
};

api.revive = function(req, res, next) {
  var user = res.locals.user;
  algos.revive(user);
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    return res.json(200, saved);
  });
};

api.reroll = function(req, res, next) {
  var user = res.locals.user;
  if (user.balance < 1) return res.json(401, {err: "Not enough tokens."});
  user.balance -= 1;
  _.each(['habits','dailys','todos'], function(type){
    _.each(user[type], function(task){
      task.value = 0;
    })
  })
  user.stats.hp = 50;
  user.save(function(err, saved) {
    if (err) return res.json(500, {err: err});
    return res.json(200, saved);
  });
};

api.reset = function(req, res){
  var user = res.locals.user;
  user.habits = [];
  user.dailys = [];
  user.todos = [];
  user.rewards = [];

  user.stats.hp = 50;
  user.stats.lvl = 1;
  user.stats.gp = 0;
  user.stats.exp = 0;

  user.items.armor = 0;
  user.items.weapon = 0;
  user.items.head = 0;
  user.items.shield = 0;

  user.save(function(err, saved){
    if (err) return res.json(500,{err:err});
    res.json(saved);
  })
}

api['delete'] = function(req, res) {
  res.locals.user.remove(function(err){
    if (err) return res.json(500,{err:err});
    res.send(200);
  })
}

/*
 ------------------------------------------------------------------------
 Unlock Preferences
 ------------------------------------------------------------------------
 */

api.unlock = function(req, res) {
  var user = res.locals.user;
  var path = req.query.path;
  var fullSet = ~path.indexOf(',');

  // 5G per set, 2G per individual
  cost = fullSet ? 1.25 : 0.5;

  if (user.balance < cost)
    return res.json(401, {err: 'Not enough gems'});

  if (fullSet) {
    var paths = path.split(',');
    _.each(paths, function(p){
      helpers.dotSet('purchased.' + p, true, user);
    });
  } else {
    if (helpers.dotGet('purchased.' + path, user) === true)
      return res.json(401, {err: 'User already purchased that'});
    helpers.dotSet('purchased.' + path, true, user);
  }

  user.balance -= cost;
  user._v++;
  user.markModified('purchased');
  user.save(function(err, saved){
    if (err) res.json(500, {err:err});
    res.send(200);
  })
}

/*
 ------------------------------------------------------------------------
 Buy Gems
 ------------------------------------------------------------------------
 */

api.addTenGems = function(req, res) {
  var user = res.locals.user;
  user.balance += 2.5;
  user.save(function(err){
    if (err) return res.json(500,{err:err});
    res.send(204);
  })
}

/*
 Setup Stripe response when posting payment
 */
api.buyGems = function(req, res) {
  var api_key = nconf.get('STRIPE_API_KEY');
  var stripe = require("stripe")(api_key);
  var token = req.body.id;
  // console.dir {token:token, req:req}, 'stripe'

  async.waterfall([
    function(cb){
      stripe.charges.create({
        amount: "500", // $5
        currency: "usd",
        card: token
      }, cb);
    },
    function(response, cb) {
      res.locals.user.balance += 5;
      res.locals.user.purchased.ads = true;
      res.locals.user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200, saved);
  });
};

api.buyGemsPaypalIPN = function(req, res) {
  res.send(200);
  ipn.verify(req.body, function callback(err, msg) {
    if (err) {
      console.error(msg);
      res.send(500, msg);
    } else {
      if (req.body.payment_status == 'Completed') {
        //Payment has been confirmed as completed
        var parts = url.parse(req.body.custom, true);
        var uid = parts.query.uid; //, apiToken = query.apiToken;
        if (!uid) throw new Error("uuid or apiToken not found when completing paypal transaction");
        User.findById(uid, function(err, user) {
          if (err) throw err;
          if (_.isEmpty(user)) throw "user not found with uuid " + uuid + " when completing paypal transaction"
          user.balance += 5;
          user.purchased.ads = true;
          user.save();
          console.log('PayPal transaction completed and user updated');
        });
      }
    }
  });
}

/*
 ------------------------------------------------------------------------
 Tags
 ------------------------------------------------------------------------
 */
api.deleteTag = function(req, res){
  var user = res.locals.user;
  var tid = req.params.tid || req.body.tag;
  var i = _.findIndex(user.tags, {id:tid});
  if (~i) {
    var tag = user.tags[i];
    delete user.filters[tag.id];
    user.tags.splice(i,1);
    // remove tag from all tasks
    _.each(['habits','dailys','todos','rewards'], function(type){
      _.each(user[type], function(task){
        delete task.tags[tag.id];
      })
    })
    user.save(function(err,saved){
      if (err) return res.json(500, {err: err});
      // Need to use this until we found a way to update the ui for tasks when a tag is deleted
      res.locals.wasModified = true; 
      res.send(200);
    });
  } else {
    res.json(400, {err:'Tag not found'});
  }
}

/*
  ------------------------------------------------------------------------
  Batch Update
  Run a bunch of updates all at once
  ------------------------------------------------------------------------
*/
api.batchUpdate = function(req, res, next) {
  var user = res.locals.user;
  var oldSend = res.send;
  var oldJson = res.json;
  var performAction = function(action, cb) {

    // TODO come up with a more consistent approach here. like:
    // req.body=action.data; delete action.data; _.defaults(req.params, action)
    // Would require changing action.dir on mobile app
    req.params.id = action.data && action.data.id;
    req.params.direction = action.dir;
    req.params.type = action.type;
    req.body = action.data;
    res.send = res.json = function(code, data) {
      if (_.isNumber(code) && code >= 400) {
        console.error({
          code: code,
          data: data
        });
      }
      //FIXME send error messages down
      return cb();
    };
    switch (action.op) {
      case "score":
        api.scoreTask(req, res);
        break;
      case "buy":
        api.buy(req, res);
        break;
      case "sortTask":
        api.verifyTaskExists(req, res, function() {
          api.sortTask(req, res);
        });
        break;
      case "addTask":
        api.createTask(req, res);
        break;
      case "delTask":
        api.verifyTaskExists(req, res, function() {
          api.deleteTask(req, res);
        });
        break;
      case "set":
        api.updateUser(req, res);
        break;
      case "delTag":
        api.deleteTag(req, res);
        break;
      case "revive":
        api.revive(req, res);
        break;
      case "clear-completed":
        api.clearCompleted(req, res);
        break;
      case "reroll":
        api.reroll(req, res);
        break;
      default:
        cb();
        break;
    }
  };

  // Setup the array of functions we're going to call in parallel with async
  var actions = _.transform(req.body || [], function(result, action) {
    if (!_.isEmpty(action)) {
      result.push(function(cb) {
        performAction(action, cb);
      });
    }
  });

  // call all the operations, then return the user object to the requester
  async.series(actions, function(err) {
    res.json = oldJson;
    res.send = oldSend;
    if (err) return res.json(500, {err: err});
    var response = user.toJSON();
    response.wasModified = res.locals.wasModified;
    if (response._tmp && response._tmp.drop) response.wasModified = true;

    // Send the response to the server
    if(response.wasModified){
      res.json(200, response);
    }else{
      res.json(200, {_v: response._v});
    }
  });
};