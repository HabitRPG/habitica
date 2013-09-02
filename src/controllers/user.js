/* @see ./routes.coffee for routing*/

// fixme remove this junk, was coffeescript compiled (probably for IE8 compat)
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var validator = require('derby-auth/node_modules/validator');
var check = validator.check;
var sanitize = validator.sanitize;
var utils = require('derby-auth/utils');
var derbyAuthUtil = require('derby-auth/utils');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var api = module.exports;

/*
  ------------------------------------------------------------------------
  Misc
  ------------------------------------------------------------------------
*/

var NO_TOKEN_OR_UID = { err: "You must include a token and uid (user id) in your request"};
var NO_USER_FOUND = {err: "No user found."};

/*
  beforeEach auth interceptor
*/

api.auth = function(req, res, next) {
  var token, uid;
  uid = req.headers['x-api-user'];
  token = req.headers['x-api-key'];
  if (!(uid && token)) {
    return res.json(401, NO_TOKEN_OR_UID);
  }
  return User.findOne({
    _id: uid,
    apiToken: token
  }, function(err, user) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    if (_.isEmpty(user)) {
      return res.json(401, NO_USER_FOUND);
    }
    res.locals.wasModified = +user._v !== +req.query._v;
    res.locals.user = user;
    req.session.userId = user._id;
    return next();
  });
};

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


/*
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
*/


api.scoreTask = function(req, res, next) {
  var delta, direction, existing, id, task, user, _ref, _ref1, _ref2, _ref3, _ref4;
  _ref = req.params, id = _ref.id, direction = _ref.direction;
  /* Send error responses for improper API call*/

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
  return res.locals.user.save(function(err) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.send(204);
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
  Registers a new user. Only accepting username/password registrations, no Facebook
*/


api.registerUser = function(req, res, next) {
  var confirmPassword, e, email, password, username, _ref;
  _ref = req.body, email = _ref.email, username = _ref.username, password = _ref.password, confirmPassword = _ref.confirmPassword;
  if (!(username && password && email)) {
    return res.json(401, {
      err: ":username, :email, :password, :confirmPassword required"
    });
  }
  if (password !== confirmPassword) {
    return res.json(401, {
      err: ":password and :confirmPassword don't match"
    });
  }
  try {
    validator.check(email).isEmail();
  } catch (_error) {
    e = _error;
    return res.json(401, {
      err: e.message
    });
  }
  return async.waterfall([
    function(cb) {
      return User.findOne({
        'auth.local.email': email
      }, cb);
    }, function(found, cb) {
      if (found) {
        return cb("Email already taken");
      }
      return User.findOne({
        'auth.local.username': username
      }, cb);
    }, function(found, cb) {
      var newUser, salt, user;
      if (found) {
        return cb("Username already taken");
      }
      newUser = helpers.newUser(true);
      salt = utils.makeSalt();
      newUser.auth = {
        local: {
          username: username,
          email: email,
          salt: salt
        }
      };
      newUser.auth.local.hashed_password = derbyAuthUtil.encryptPassword(password, salt);
      user = new User(newUser);
      return user.save(cb);
    }
  ], function(err, saved) {
    if (err) {
      return res.json(401, {
        err: err
      });
    }
    return res.json(200, saved);
  });
};

/*
  Get User
*/


api.getUser = function(req, res, next) {
  var user;
  user = res.locals.user;
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
  Register new user with uname / password
*/


api.loginLocal = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  async.waterfall([
    function(cb) {
      if (!(username && password)) return cb('No username or password');
      User.findOne({'auth.local.username': username}, cb);
    }, function(user, cb) {
      if (!user) return cb('Username not found');
      // We needed the whole user object first so we can get his salt to encrypt password comparison
      User.findOne({
        'auth.local.username': username,
        'auth.local.hashed_password': utils.encryptPassword(password, user.auth.local.salt)
      }, cb);
    }
  ], function(err, user) {
    if (!user) err = 'Incorrect password';
    if (err) return res.json(401, {err: err});
    res.json(200, {
      id: user._id,
      token: user.apiToken
    });
  });
};

/*
  POST /user/auth/facebook
*/


api.loginFacebook = function(req, res, next) {
  var email, facebook_id, name, _ref;
  _ref = req.body, facebook_id = _ref.facebook_id, email = _ref.email, name = _ref.name;
  if (!facebook_id) {
    return res.json(401, {
      err: 'No facebook id provided'
    });
  }
  return User.findOne({
    'auth.local.facebook.id': facebook_id
  }, function(err, user) {
    if (err) {
      return res.json(401, {
        err: err
      });
    }
    if (user) {
      return res.json(200, {
        id: user.id,
        token: user.apiToken
      });
    } else {
      /* FIXME: create a new user instead*/

      return res.json(403, {
        err: "Please register with Facebook on https://habitrpg.com, then come back here and log in."
      });
    }
  });
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

  acceptableAttrs = 'tasks. achievements. filters. flags. invitations. items. lastCron party. preferences. profile. stats. tags. custom.'.split(' ');
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
  Party
  ------------------------------------------------------------------------
*/


api.getGroups = function(req, res, next) {
  var user = res.locals.user;
  /*TODO should we support non-authenticated users? just for viewing public groups?*/

  return async.parallel({
    party: function(cb) {
      return async.waterfall([
        function(cb2) {
          return Group.findOne({
            type: 'party',
            members: {
              '$in': [user._id]
            }
          }, cb2);
        }, function(party, cb2) {
          var fields, query;
          party = party.toJSON();
          query = {
            _id: {
              '$in': party.members,
              '$nin': [user._id]
            }
          };
          fields = 'profile preferences items stats achievements party backer auth.local.username auth.facebook.first_name auth.facebook.last_name auth.facebook.name auth.facebook.username'.split(' ');
          fields = _.reduce(fields, (function(m, k, v) {
            m[k] = 1;
            return m;
          }), {});
          return User.find(query, fields, function(err, members) {
            party.members = members;
            return cb2(err, party);
          });
        }
      ], function(err, members) {
        return cb(err, members);
      });
    },
    guilds: function(cb) {
      return cb(null, {});
      return Group.findOne({
        type: 'guild',
        members: {
          '$in': [user._id]
        }
      }, cb);
    },
    "public": function(cb) {
      return cb(null, {});
      return Group.find({
        privacy: 'public'
      }, {
        name: 1,
        description: 1,
        members: 1
      }, cb);
    }
  }, function(err, results) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    return res.json(results);
  });
};

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
      /*FIXME send error messages down*/

      return cb();
    };
    switch (action.op) {
      case "score":
        return api.scoreTask(req, res);
      case "buy":
        return api.buy(req, res);
      case "sortTask":
        return api.verifyTaskExists(req, res, function() {
          return api.sortTask(req, res);
        });
      case "addTask":
        return api.createTask(req, res);
      case "delTask":
        return api.verifyTaskExists(req, res, function() {
          return api.deleteTask(req, res);
        });
      case "set":
        return api.updateUser(req, res);
      case "revive":
        return api.revive(req, res);
      case "clear-completed":
        return api.clearCompleted(req, res);
      case "reroll":
        return api.reroll(req, res);
      default:
        return cb();
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