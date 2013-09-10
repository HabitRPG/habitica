/* @see ./routes.coffee for routing*/

// fixme remove this junk, was coffeescript compiled (probably for IE8 compat)
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
var api = module.exports;

// FIXME put this in a proper location
api.marketBuy = function(req, res, next){
  var user = res.locals.user,
    type = req.query.type,
    item = req.body;

  if (!_.contains(['hatchingPotion', 'egg'], req.query.type))
    return res.json(400, {err: "Type must be in 'hatchingPotion' or 'egg'"});
  var item;
  if (type == 'egg'){
    if (!user.items && !user.items.eggs) user.items.eggs = [];
    user.items.eggs.push(item);
  } else {
    if (!user.items && !user.items.hatchingPotions) user.items.hatchingPotions = [];
    user.items.hatchingPotions.push(item.name);
  }
  user.markModified('items'); // I still don't get when this is necessary and when not..
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
// FIXME put this in helpers, so mobile & web can us it too
// FIXME actually, move to mongoose
*/


function taskSanitizeAndDefaults(task) {
  var _ref;
  if (task.id == null) {
    task.id = helpers.uuid();
  }
  task.value = ~~task.value;
  if (task.type == null) {
    task.type = 'habit';
  }
  if (_.isString(task.text)) {
    task.text = sanitize(task.text).xss();
  }
  if (_.isString(task.text)) {
    task.notes = sanitize(task.notes).xss();
  }
  if (task.type === 'habit') {
    if (!_.isBoolean(task.up)) {
      task.up = true;
    }
    if (!_.isBoolean(task.down)) {
      task.down = true;
    }
  }
  if ((_ref = task.type) === 'daily' || _ref === 'todo') {
    if (!_.isBoolean(task.completed)) {
      task.completed = false;
    }
  }
  if (task.type === 'daily') {
    if (task.repeat == null) {
      task.repeat = {
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true,
        su: true
      };
    }
  }
  return task;
};

/*
Validate task
*/


api.verifyTaskExists = function(req, res, next) {
  /* If we're updating, get the task from the user*/

  var task;
  task = res.locals.user.tasks[req.params.id];
  if (_.isEmpty(task)) {
    return res.json(400, {
      err: "No task found."
    });
  }
  res.locals.task = task;
  return next();
};

function addTask(user, task) {
  taskSanitizeAndDefaults(task);
  user.tasks[task.id] = task;
  user["" + task.type + "Ids"].unshift(task.id);
  return task;
};

/* Override current user.task with incoming values, then sanitize all values*/


function updateTask(user, id, incomingTask) {
  return user.tasks[id] = taskSanitizeAndDefaults(_.defaults(incomingTask, user.tasks[id]));
};

function deleteTask(user, task) {
  var i, ids;
  delete user.tasks[task.id];
  if ((ids = user["" + task.type + "Ids"]) && ~(i = ids.indexOf(task.id))) {
    return ids.splice(i, 1);
  }
};

/*
  API Routes
  ---------------
*/


/**
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
*/
api.scoreTask = function(req, res, next) {

  // FIXME this is all uglified from coffeescript compile, clean this up

  var delta, direction, existing, id, task, user, _ref, _ref1, _ref2, _ref3, _ref4;
  _ref = req.params, id = _ref.id, direction = _ref.direction;

  // Send error responses for improper API call
  if (!id) {
    return res.json(500, {
      err: ':id required'
    });
  }
  if (direction !== 'up' && direction !== 'down') {
    return res.json(500, {
      err: ":direction must be 'up' or 'down'"
    });
  }
  user = res.locals.user;
  /* If exists already, score it*/

  if ((existing = user.tasks[id])) {
    /* Set completed if type is daily or todo and task exists*/

    if ((_ref1 = existing.type) === 'daily' || _ref1 === 'todo') {
      existing.completed = direction === 'up';
    }
  } else {
    /* If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it*/

    task = {
      id: id,
      value: 0,
      type: ((_ref2 = req.body) != null ? _ref2.type : void 0) || 'habit',
      text: ((_ref3 = req.body) != null ? _ref3.title : void 0) || id,
      notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
    };
    if (task.type === 'habit') {
      task.up = task.down = true;
    }
    if ((_ref4 = task.type) === 'daily' || _ref4 === 'todo') {
      task.completed = direction === 'up';
    }
    addTask(user, task);
  }
  task = user.tasks[id];
  delta = algos.score(user, task, direction);
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, _.extend({
      delta: delta
    }, saved.toJSON().stats));
  });
};

/*
  Get all tasks
*/


api.getTasks = function(req, res, next) {
  var tasks, types, _ref;
  types = (_ref = req.query.type) === 'habit' || _ref === 'todo' || _ref === 'daily' || _ref === 'reward' ? [req.query.type] : ['habit', 'todo', 'daily', 'reward'];
  tasks = _.toArray(_.filter(res.locals.user.tasks, function(t) {
    var _ref1;
    return _ref1 = t.type, __indexOf.call(types, _ref1) >= 0;
  }));
  return res.json(200, tasks);
};

/*
  Get Task
*/


api.getTask = function(req, res, next) {
  var task;
  task = res.locals.user.tasks[req.params.id];
  if (_.isEmpty(task)) {
    return res.json(400, {
      err: "No task found."
    });
  }
  return res.json(200, task);
};

/*
  Delete Task
*/


api.deleteTask = function(req, res, next) {
  deleteTask(res.locals.user, res.locals.task);
  res.locals.user.save(function(err) {
    if (err) return res.json(500, {err: err});
    res.send(204);
  });
};

/*
  Update Task
*/


api.updateTask = function(req, res, next) {
  var id, user;
  user = res.locals.user;
  id = req.params.id;
  updateTask(user, id, req.body);
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, _.findWhere(saved.toJSON().tasks, {
      id: id
    }));
  });
};

/*
  Update tasks (plural). This will update, add new, delete, etc all at once.
  Should we keep this?
*/


api.updateTasks = function(req, res, next) {
  var tasks, user;
  user = res.locals.user;
  tasks = req.body;
  _.each(tasks, function(task, idx) {
    if (task.id) {
      /*delete*/

      if (task.del) {
        deleteTask(user, task);
        task = {
          deleted: true
        };
      } else {
        /* Update*/

        updateTask(user, task.id, task);
      }
    } else {
      /* Create*/

      task = addTask(user, task);
    }
    return tasks[idx] = task;
  });
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(201, tasks);
  });
};

api.createTask = function(req, res, next) {
  var task, user;
  user = res.locals.user;
  task = addTask(user, req.body);
  return user.save(function(err) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(201, task);
  });
};

api.sortTask = function(req, res, next) {
  var from, id, path, to, type, user, _ref;
  id = req.params.id;
  _ref = req.body, to = _ref.to, from = _ref.from, type = _ref.type;
  user = res.locals.user;
  path = "" + type + "Ids";
  user[path].splice(to, 0, user[path].splice(from, 1)[0]);
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, saved.toJSON()[path]);
  });
};

api.clearCompleted = function(req, res, next) {
  var completedIds, todoIds, user;
  user = res.locals.user;
  completedIds = _.pluck(_.where(user.tasks, {
    type: 'todo',
    completed: true
  }), 'id');
  todoIds = user.todoIds;
  _.each(completedIds, function(id) {
    delete user.tasks[id];
    return true;
  });
  user.todoIds = _.difference(todoIds, completedIds);
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
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
    return res.json(400, {
      err: ":type must be in one of: 'weapon', 'armor', 'head', 'shield', 'potion'"
    });
  }
  hasEnough = items.buyItem(user, type);
  if (hasEnough) {
    return user.save(function(err, saved) {
      if (err) {
        return res.json(500, {
          err: err
        });
      }
      return res.json(200, saved.toJSON().items);
    });
  } else {
    return res.json(200, {
      err: "Not enough GP"
    });
  }
};

/*
  ------------------------------------------------------------------------
  User
  ------------------------------------------------------------------------
*/

/*
  Get User
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

/*
  Update user
  FIXME add documentation here
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
    if ((_.find(acceptableAttrs, function(attr) {
      return k.indexOf(attr) === 0;
    })) != null) {
      if (_.isObject(v)) {
        errors.push("Value for " + k + " was an object. Be careful here, you could clobber stuff.");
      }
      helpers.dotSet(k, v, user);
    } else {
      errors.push("path `" + k + "` was not saved, as it's a protected path. Make sure to send `PUT /api/v1/user` request bodies as `{'set.this.path':value}` instead of `{set:{this:{path:value}}}`");
    }
    return true;
  });
  return user.save(function(err) {
    if (!_.isEmpty(errors)) {
      return res.json(500, {
        err: errors
      });
    }
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, user);
  });
};

api.cron = function(req, res, next) {
  var user;
  user = res.locals.user;
  algos.cron(user);
  if (user.isModified()) {
    res.locals.wasModified = true;
    user.auth.timestamps.loggedin = new Date();
  }
  user.save(next);
};

api.revive = function(req, res, next) {
  var user;
  user = res.locals.user;
  algos.revive(user);
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, saved);
  });
};

api.reroll = function(req, res, next) {
  var user;
  user = res.locals.user;
  if (user.balance < 1) {
    return res.json(401, {
      err: "Not enough tokens."
    });
  }
  user.balance -= 1;
  _.each(user.tasks, function(task) {
    if (task.type !== 'reward') {
      user.tasks[task.id].value = 0;
    }
    return true;
  });
  user.stats.hp = 50;
  return user.save(function(err, saved) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(200, saved);
  });
};

api.reset = function(req, res){
  var user = res.locals.user;
  user.tasks = {};

  _.each(['habit', 'daily', 'todo', 'reward'], function(type) {
    user[type + "Ids"] = [];
  });

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
      res.locals.user.flags.ads = 'hide';
      res.locals.user.save(cb);
    }
  ], function(err, saved){
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.send(200, saved);
  });
};

/*
 ------------------------------------------------------------------------
 Tags
 ------------------------------------------------------------------------
 */
api.deleteTag = function(req, res){
  var user = res.locals.user;
  var i = _.findIndex(user.tags, {id:req.params.tid});
  if (~i) {
    var tag = user.tags[i];
    delete user.filters[tag.id];
    user.tags.splice(i,1);
    // remove tag from all tasks
    _.each(user.tasks, function(task) {
      delete user.tasks[task.id].tags[tag.id];
    });
    user.save(function(err,saved){
      res.send(200);
    })
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
  var actions, oldJson, oldSend, performAction, user, _ref;
  user = res.locals.user;
  oldSend = res.send;
  oldJson = res.json;
  performAction = function(action, cb) {
    /*
    # TODO come up with a more consistent approach here. like:
    # req.body=action.data; delete action.data; _.defaults(req.params, action)
    # Would require changing action.dir on mobile app
    */

    var _ref;
    req.params.id = (_ref = action.data) != null ? _ref.id : void 0;
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
  /* Setup the array of functions we're going to call in parallel with async*/

  actions = _.transform((_ref = req.body) != null ? _ref : [], function(result, action) {
    if (!_.isEmpty(action)) {
      return result.push(function(cb) {
        return performAction(action, cb);
      });
    }
  });
  /* call all the operations, then return the user object to the requester*/

  return async.series(actions, function(err) {
    var response;
    res.json = oldJson;
    res.send = oldSend;
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    response = user.toJSON();
    response.wasModified = res.locals.wasModified;
    res.json(200, response);
    return console.log("Reply sent");
  });
};