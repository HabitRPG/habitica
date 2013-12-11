/* @see ./routes.coffee for routing*/

var url = require('url');
var ipn = require('paypal-ipn');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('habitrpg-shared');
var validator = require('validator');
var check = validator.check;
var sanitize = validator.sanitize;
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var acceptablePUTPaths;
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

/*
  API Routes
  ---------------
*/

/**
  This is called form deprecated.coffee's score function, and the req.headers are setup properly to handle the login
  Export it also so we can call it from deprecated.coffee
*/
api.score = function(req, res, next) {
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
    task = user.ops.addTask({body:task});
  }
  var delta = user.ops.score({params:{id:task.id, direction:direction}});
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
  api.verifyTaskExists(req, res, function(){
    var user = res.locals.user;
    user.deleteTask(res.locals.task.id);
    user.save(function(err) {
      if (err) return res.json(500, {err: err});
      res.send(204);
    });
  })
};

/*
  Update Task
*/

// api.updateTask // handled in Shared.ops

// api.addTask // handled in Shared.ops

api.sortTask = function(req, res, next) {
  api.verifyTaskExists(req, res, function(){
    var id = req.params.id;
    var to = req.body.to, from = req.body.from, type = req.body.type;
    var user = res.locals.user;
    user[type+'s'].splice(to, 0, user[type+'s'].splice(from, 1)[0]);
    user.save(function(err, saved) {
      if (err) return res.json(500, {err: err});
      return res.json(200, saved.toJSON()[type+'s']);
    });
  })
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
// api.buy // handled in Shard.ops

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
  user.stats.toNextLevel = shared.tnl(user.stats.lvl);
  user.stats.maxHealth = 50;
  delete user.apiToken;
  if (user.auth) {
    delete user.auth.hashed_password;
    delete user.auth.salt;
  }
  return res.json(200, user);
};


/**
 * This tells us for which paths users can call `PUT /user` (or batch-update equiv, which use `User.set()` on our client).
 * The trick here is to only accept leaf paths, not root/intermediate paths (see http://goo.gl/OEzkAs)
 * FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
 *
 * Note: custom is for 3rd party apps
 */
acceptablePUTPaths = _.reduce(require('./../models/user').schema.paths, function(m,v,leaf){
  var found= _.find('tasks achievements filters flags invitations lastCron party preferences profile stats tags'.split(' '), function(root){
    return leaf.indexOf(root) == 0;
  });
  if (found) m[leaf]=true;
  return m;
}, {})
acceptablePUTPaths['tasks']=true; // and for now, let them fully set tasks.* (for advanced editing, TODO lock down)

/**
 * Update user
 * Send up PUT /user as `req.body={path1:val, path2:val, etc}`. Example:
 * PUT /user {'stats.hp':50, 'tasks.TASK_ID.repeat.m':false}
 * See acceptablePUTPaths for which user paths are supported
*/
api.update = function(req, res, next) {
  var user = res.locals.user;
  var errors = [];
  if (_.isEmpty(req.body)) return res.json(200, user);

  _.each(req.body, function(v, k) {
    if (acceptablePUTPaths[k])
      user.fns.dotSet(k, v);
    else
      errors.push("path `" + k + "` was not saved, as it's a protected path. Make sure to send `PUT /api/v1/user` request bodies as `{'set.this.path':value}` instead of `{set:{this:{path:value}}}`");
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
  shared.cron(user);
  if (user.isModified()) {
    res.locals.wasModified = true;
    user.auth.timestamps.loggedin = new Date();
  }
  user.save(next);
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

// api.unlock // see Shared.ops

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
    user.markModified('habits');
    user.markModified('dailys');
    user.markModified('todos');
    user.markModified('rewards');
    user.save(function(err,saved){
      if (err) return res.json(500, {err: err});
      res.send(204);
    });
  } else {
    res.json(400, {err:'Tag not found'});
  }
}

/*
 ------------------------------------------------------------------------
 Spells
 ------------------------------------------------------------------------
 */
api.cast = function(req, res) {
  var user = res.locals.user;
  var type = req.body.type, target = req.body.target;
  var spell = shared.content.spells[user.stats.class][req.params.spell];

  var done = function(){
    var err = arguments[0];
    var saved = _.size(arguments == 3) ? arguments[2] : arguments[1];
    if (err) return res.json(500, {err:err});
    res.json(saved);
  }

  switch (type) {
    case 'task':
      spell.cast(user, user.tasks[target.id]);
      user.save(done);
      break;

    case 'self':
      spell.cast(user);
      user.save(done);
      break;

    case 'party':
      async.waterfall([
        function(cb){
          Group.findOne({type: 'party', members: {'$in': [user._id]}}).populate('members').exec(cb);
        },
        function(group, cb) {
          if (!group) group = {members:[user]};
          spell.cast(user, group.members);
          var series = _.transform(group.members, function(m,v,k){
            m[k] = function(cb2){v.save(cb2);}
          });
          async.series(series, cb);
        },
        function(whatever, cb){
          user.save(cb);
        }
      ], done);
      break;

    case 'user':
      async.waterfall([
        function(cb) {
          User.findById(target._id, cb);
        },
        function(member, cb) {
          spell.cast(user, member);
          member.save(cb); // not parallel because target could be user, which causes race condition when saving
        },
        function(saved, num, cb) {
          user.save(cb);
        }
      ], done);
      break;
  }
}

/**
 * All other user.ops which can easily be mapped to habitrpg-shared/index.coffee, not requiring custom API-wrapping
 */
_.each(shared.wrap({}).ops, function(op,k){
  if (!api[k]) {
    api[k] = function(req, res, next) {
      var user = res.locals.user;
      async.series([
        function(cb){ user.ops[k](req, cb) },
        function(cb){ user.save(cb) },
      ], function(err){
        if (err) {
          // If we want to send something other than 500, pass err as {code: 200, message: "Not enough GP"}
          if (err.code) return res.json(err.code, err.message);
          return res.json(500,{err:err});
        }
        return res.send(200);
      })
    }
  }
})

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

  var callOp = function(_req, cb) {
    res.send = res.json = function(code, data) {
      if (_.isNumber(code) && code >= 400)
        console.error({code: code, data: data});
      //FIXME send error messages down
      return cb();
    };
    api[_req.op](_req, res);
  };

  // Setup the array of functions we're going to call in parallel with async
  var ops = _.transform(req.body || [], function(result, _req) {
    if (!_.isEmpty(_req)) {
      result.push(function(cb) {
        callOp(_req, cb);
      });
    }
  });

  // call all the operations, then return the user object to the requester
  async.series(ops, function(err) {
    res.json = oldJson;
    res.send = oldSend;
    if (err) return res.json(500, {err: err});
    var response = user.toJSON();
    response.wasModified = res.locals.wasModified;
    if (response._tmp && response._tmp.drop){
      res.json(200, {_tmp: {drop: response._tmp.drop}, _v: response._v});
    }else if(response.wasModified){
      res.json(200, response);
    }else{
      res.json(200, {_v: response._v});
    }
  });
};