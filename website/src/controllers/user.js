/* @see ./routes.coffee for routing*/

var url = require('url');
var ipn = require('paypal-ipn');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('../../../common');
var User = require('./../models/user').model;
var Task = require('./../models/task').model;
var utils = require('./../utils');
var analytics = utils.analytics;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var Task = require('./../models/task').model;
var moment = require('moment');
var logging = require('./../logging');
var acceptablePUTPaths;
var api = module.exports;
var qs = require('qs');
var firebase = require('../libs/firebase');
var webhook = require('../webhook');

// api.purchase // Shared.ops

api.getContent = function(req, res, next) {
  var language = 'en';

  // TODO use i18n getUserLanguage
  if (typeof req.query.language != 'undefined')
    language = req.query.language.toString(); //|| 'en' in i18n

  var content = _.cloneDeep(shared.content);
  var walk = function(obj, lang){
    _.each(obj, function(item, key, source){
      if (_.isPlainObject(item) || _.isArray(item)) return walk(item, lang);
      if (_.isFunction(item) && item.i18nLangFunc) source[key] = item(lang);
    });
  }
  walk(content, language);
  res.json(content);
}

api.getModelPaths = function(req,res,next){
  res.json(_.reduce(User.schema.paths,function(m,v,k){
    m[k] = v.instance || 'Boolean';
    return m;
  },{}));
}

/*
  ------------------------------------------------------------------------
  Tasks
  ------------------------------------------------------------------------
*/

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
    body = req.body || {},
    task;

  // Send error responses for improper API call
  if (!id) return res.json(400, {err: ':id required'});
  if (direction !== 'up' && direction !== 'down') {
    if (direction == 'unlink' || direction == 'sort') return next();
    return res.json(400, {err: ":direction must be 'up' or 'down'"});
  }

  Task.findOne({
    _id: id,
    userId: user._id
  }, function(err, task){
    if(err) return next(err);

    // If exists already, score it
    if (!task) {
      // If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it
      // Defaults. Other defaults are handled in user.ops.addTask()
      task = new Task({
        _id: id, // TODO this might easily lead to conflicts as ids are now unique db-wide
        type: body.type,
        text: body.text,
        userId: user._id,
        notes: body.notes || "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task." // TODO translate
      });

      user.tasksOrder[task.type + 's'].push(task._id);
    }

    // Set completed if type is daily or todo
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up';
    }

    var delta = user.ops.score({
      params: {
        task: task, 
        direction: direction
      }, 
      language: req.language,
      user: user
    });

    async.parallel({
      task: task.save.bind(task),
      user: user.save.bind(user)
    }, function(err, results){
      if(err) return next(err);

      // FIXME this is suuuper strange, sometimes results.user is an array, sometimes user directly
      var saved = Array.isArray(results.user) ? results.user[0] : results.user;
      var task = results.task[0];

      var userStats = saved.toJSON().stats;
      var resJsonData = _.extend({ delta: delta, _tmp: user._tmp }, userStats);
      res.json(200, resJsonData);

      var webhookData = _generateWebhookTaskData(
        task, direction, delta, userStats, user
      );
      webhook.sendTaskWebhook(user.preferences.webhooks, webhookData);

      if (
        (!task.challenge.id || task.challenge.broken) // If it's a challenge task, sync the score. Do it in the background, we've already sent down a response and the user doesn't care what happens back there
        || (task.type == 'reward') // we don't want to update the reward GP cost
      ) return;

        // select name and shortName because they can be synced on syncToUser
      Challenge.findById(task.challenge.id, 'name shortName', function(err, chal) {
        if (err) return next(err);
        if (!chal) {
          task.challenge.broken = 'CHALLENGE_DELETED';
          task.save();
          return;
        }

        Task.find({
          'challenge.id': task.challenge.id,
          '_id': task.challenge.taskId,
          userId: {$exists: false}
        }, function(err, chalTask){
          if(err) return; //FIXME
          // this task was removed from the challenge, notify user
          if(!chalTask) {
            chal.getTasks(function(err, chalTasks){
              if(err) return; //FIXME
              chal.syncToUser(user, chalTasks);
            });
          } else {
            chalTask.value += delta;
            if (chalTask.type == 'habit' || chalTask.type == 'daily')
              chalTask.history.push({value: chalTask.value, date: +new Date});
            chalTask.save();
          }
        });
      });
    });
  });

};

/**
 * Get all tasks
 */
api.getTasks = function(req, res, next) {
  var user = res.locals.user;

  user.getTasks(function(err, tasks){
    if(err) return next(err);

    if (req.query.type) {
      res.json(tasks.filter(function(task){
        return task.type === (req.query.type+'s');
      }));
    } else {
      res.json(tasks);
    }
  });
};

/**
 * Get Task
 */
api.getTask = function(req, res, next) {
  var user = res.locals.user;

  Task.findOne({
    _id: req.params.id,
    userId: user._id
  }, function(err, task){
    if(err) return next(err);
    if(!task) return res.json(404, {err: 'No task found.'});

    res.json(task);
  });
};


/*
  Update Task
*/


/*
  ------------------------------------------------------------------------
  Items
  ------------------------------------------------------------------------
*/
// api.buy // handled in Shard.ops

api.getBuyList = function (req, res, next) {
   var list = shared.updateStore(res.locals.user);
   return res.json(200, list);
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
  res.locals.user.getTransformedData(function(err, user){
    if(err) return next(err);

    user.stats.toNextLevel = shared.tnl(user.stats.lvl);
    user.stats.maxHealth = shared.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;
    delete user.apiToken;
    if (user.auth && user.auth.local) {
      delete user.auth.local.hashed_password;
      delete user.auth.local.salt;
    }

    return res.json(200, user);
  });
};

/**
 * Get anonymized User
 */
api.getUserAnonymized = function(req, res, next) {
  res.locals.user.getTransformedData(function(err, user){
    user.stats.toNextLevel = shared.tnl(user.stats.lvl);
    user.stats.maxHealth = shared.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    delete user.apiToken;

    if (user.auth) {
      delete user.auth.local;
      delete user.auth.facebook;
    }

    delete user.newMessages;

    delete user.profile;
    delete user.purchased.plan;
    delete user.contributor;
    delete user.invitations;

    delete user.items.special.nyeReceived;
    delete user.items.special.valentineReceived;

    delete user.webhooks;
    delete user.achievements.challenges;

    _.forEach(user.inbox.messages, function(msg){
      msg.text = "inbox message text";
    });

    _.forEach(user.tags, function(tag){
      tag.name = "tag";
      tag.challenge = "challenge";
    });

    function cleanChecklist(task){
      var checklistIndex = 0;

      _.forEach(task.checklist, function(c){
        c.text = "item" + checklistIndex++;
      });
    }

    _.forEach(user.habits, function(task){
      task.text = "task text";
      task.notes = "task notes";
    });

    _.forEach(user.rewards, function(task){
      task.text = "task text";
      task.notes = "task notes";
    });

    _.forEach(user.dailys, function(task){
      task.text = "task text";
      task.notes = "task notes";

      cleanChecklist(task);
    });

    _.forEach(user.todos, function(task){
      task.text = "task text";
      task.notes = "task notes";

      cleanChecklist(task);
    });

    return res.json(200, user);
  });
};

/**
 * This tells us for which paths users can call `PUT /user` (or batch-update equiv, which use `User.set()` on our client).
 * The trick here is to only accept leaf paths, not root/intermediate paths (see http://goo.gl/OEzkAs)
 * FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
 */
acceptablePUTPaths = _.reduce(require('./../models/user').schema.paths, function(m,v,leaf){
  var found= _.find('achievements filters flags invitations lastCron party preferences profile stats inbox'.split(' '), function(root){
    return leaf.indexOf(root) == 0;
  });
  if (found) m[leaf]=true;
  return m;
}, {})

_.each('stats.class'.split(' '), function(removePath){
  delete acceptablePUTPaths[removePath];
})

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
      errors.push("path `" + k + "` was not saved, as it's a protected path.");
    return true;
  });
  user.save(function(err) {
    if (!_.isEmpty(errors)) return res.json(401, {err: errors});
    if (err) return next(err);
    res.json(200, user);
    user = errors = null;
  });
};

var saveAfterCron = function(user, tasks, cb) {
  async.parallel({
    user: user.save.bind(user),
    tasks: function(cb1) {
      async.each(tasks, function(task, cb2){
        task.isModified() ? task.save(cb2) : cb2();
      }, cb1);
    }
  }, cb);
};

api.cron = function(req, res, next) {
  var user = res.locals.user;

  var daysMissed = user.fns.shouldCronRun();

  if (daysMissed !== 0) return next(null, user);

  user.getTasks(function(err, tasks) {
    if(err) return next(err);

    var progress = user.fns.cron({
      daysMissed: daysMissed,
      tasks: tasks,
      analytics: utils.analytics
    });

    var ranCron = user.isModified();
    var quest = shared.content.quests[user.party.quest.key];

    if (ranCron) res.locals.wasModified = true;
    if (!ranCron) return next(null, user);
    Group.tavernBoss(user, progress);
    if (!quest) return saveAfterCron(user, tasks, next);

    // If user is on a quest, roll for boss & player, or handle collections
    // FIXME this saves user, runs db updates, loads user. Is there a better way to handle this?
    async.waterfall([
      function(cb){
        return saveAfterCron(user, tasks, cb); // make sure to save the cron effects
      },
      function(saved, count, cb){
        var type = quest.boss ? 'boss' : 'collect';
        Group[type+'Quest'](saved.user[0],progress,cb);
      },
      function(){
        var cb = arguments[arguments.length-1];
        // User has been updated in boss-grapple, reload
        User.findById(user._id, cb);
      }
    ], function(err, saved) {
      res.locals.user = saved;
      next(err,saved);
      user = progress = quest = null;
    });
  });

};

api['delete'] = function(req, res, next) {
  var user = res.locals.user;
  var plan = user.purchased.plan;

  if (plan && plan.customerId && !plan.dateTerminated){
    return res.json(400,{err:"You have an active subscription, cancel your plan before deleting your account."});
  }

  async.parallel([
    function(cb){
      Group.find({
        members: {
          '$in': [user._id]
        }
      }, function(err, groups){
        if(err) return cb(err);

        async.each(groups, function(group, cb1){
          group.leave(user, 'remove-all', cb1);
        }, cb);
      })
    },

    function(cb){
      Task.remove({
        userId: user._id
      }, cb);
    }
  ], function(err, results){
    if(err) return next(err);

    user.remove(function(err){
      if(err) return next(err);

      firebase.deleteUser(user._id);
      res.send(200);
    });
  });
}

/*
 ------------------------------------------------------------------------
 Development Only Operations
 ------------------------------------------------------------------------
 */
if (nconf.get('NODE_ENV') === 'development') {

  api.addTenGems = function(req, res, next) {
    var user = res.locals.user;

    user.balance += 2.5;

    user.save(function(err){
      if (err) return next(err);
      res.send(204);
    });
  };

  api.addHourglass = function(req, res, next) {
    var user = res.locals.user;

    user.purchased.plan.consecutive.trinkets += 1;

    user.save(function(err){
      if (err) return next(err);
      res.send(204);
    });
  };
}

/*
 ------------------------------------------------------------------------
 Tags
 ------------------------------------------------------------------------
 */
// api.deleteTag // handled in Shared.ops
// api.addTag // handled in Shared.ops
// api.updateTag // handled in Shared.ops
// api.sortTag // handled in Shared.ops

/*
 ------------------------------------------------------------------------
 Spells
 ------------------------------------------------------------------------
 */
api.cast = function(req, res, next) {
  var user = res.locals.user,
    targetType = req.query.targetType,
    targetId = req.query.targetId,
    klass = shared.content.spells.special[req.params.spell] ? 'special' : user.stats.class,
    spell = shared.content.spells[klass][req.params.spell];

  if (!spell) return res.json(404, {err: 'Spell "' + req.params.spell + '" not found.'});
  if (spell.mana > user.stats.mp) return res.json(400, {err: 'Not enough mana to cast spell'});

  var done = function(err, user, tasks){
    if (err) return next(err);

    async.parallel({
      // Saving modified tasks
      tasks: function(cb) {
        // async.each doesn't support passing the index of the item being processed,
        // so we convert it to an object of {index, value}
        // taken from https://github.com/caolan/async/issues/669#issuecomment-65004297
        var tasksMap = tasks.map(function(task, index){
          return {index: index, value: task};
        });
        async.each(tasksMap, function(item, cb1){
          var task = tasks[item.index]
          if(task.isModified()){
            task.save(function(err, savedTask){
              if(err) return cb1(err);
              tasks[item.index] = savedTask;
              cb1();
            });
          }else{
            cb1();
          }
        }, cb);
      },
      user: user.save.bind(user)
    }, function(err, results){
      if(err) return next(err);

      res.json(results.user[0].addTasksToUser(tasks));
    });    
  };

  // We load all the tasks even if not needed because they'll have to be returned later
  // TODO fix in API v3
  user.getTasks(function(err, tasks) {
    if(err) return next(err);

    switch (targetType) {
      case 'task':
        var task = _.find(tasks, {_id: targetId});
        if(!task) return res.json(404, {err: 'Task "' + targetId + '" not found.'});

        spell.cast(user, task);
        done(null, user, tasks);
        break;

      case 'self':
        // IMPORTANT NOTE we attach {tasks, dailys, todos, habits, rewards}
        // to the user object to maintain compatibility with the cast functions
        // in common/scripts/content/index.coffee even though they are not part anymore
        // of the user object, Mongoose will remove them as soon as the user is saved
        user.tasks = tasks;
        user.habits = []; user.dailys = []; user.todos = []; user.rewards = [];
        tasks.forEach(function(task){
          user[task.type + 's'] = task;
        });
        
        spell.cast(user);
        done(null, user, tasks);
        break;

      case 'party':
      case 'user':
        async.waterfall([
          function(cb){
            Group.findOne({type: 'party', members: {'$in': [user._id]}}).populate('members', 'profile.name stats achievements items.special').exec(cb);
          },
          function(group, cb) {
            // Solo player? let's just create a faux group for simpler code
            var g = group ? group : {members:[user]};
            var series = [], found;
            if (targetType == 'party') {
              spell.cast(user, g.members);
              series = _.transform(g.members, function(m,v,k){
                m.push(function(cb2){v.save(cb2)});
              });
            } else {
              found = _.find(g.members, {_id: targetId})
              spell.cast(user, found);
              series.push(function(cb2){found.save(cb2)});
            }

            if (group && !spell.silent) {
              series.push(function(cb2){
                var message = '`'+user.profile.name+' casts '+spell.text() + (targetType=='user' ? ' on '+found.profile.name : ' for the party')+'.`';
                group.sendChat(message);
                group.save(cb2);
              })
            }

            series.push(function(cb2){g = group = series = found = null;cb2();})

            async.series(series, cb);
          }
        ], function(err) {
          done(err, user, tasks);
        });
        break;
    }

  });

}

// It supports guild too now but we'll stick to partyInvite for backward compatibility
api.sessionPartyInvite = function(req,res,next){
  if (!req.session.partyInvite) return next();
  var inv = res.locals.user.invitations;
  if (inv.party && inv.party.id) return next(); // already invited to a party
  async.waterfall([
    function(cb){
      Group.findOne({_id:req.session.partyInvite.id, members:{$in:[req.session.partyInvite.inviter]}})
      .select('invites members type').exec(cb);
    },
    function(group, cb){
      if (!group){
        // Don't send error as it will prevent users from using the site
        delete req.session.partyInvite;
        return cb();
      }

      if (group.type == 'guild'){
        inv.guilds.push(req.session.partyInvite);
      } else{
        //req.body.type in 'guild', 'party'
        inv.party = req.session.partyInvite;
      }
      inv.party = req.session.partyInvite;
      delete req.session.partyInvite;
      if (!~group.invites.indexOf(res.locals.user._id))
        group.invites.push(res.locals.user._id); //$addToSt
      group.save(cb);
    },
    function(saved, cb){
      res.locals.user.save(cb);
    }
  ], next);
}

// Migrated from common because new user model doesn't have access to tasks under user object
// Code is shared where possible, otherwise copied, make sure you update the logic in both places
api.reset = function(req, res, next) {
  var user = res.locals.user;

  user.fns.resetUser();

  user.tasksOrder = [];

  async.parallel({
    saveUser: user.save.bind(user),
    removeTasks: function(cb) {
      Task.remove({ // TODO what about challenge tasks? we shouldn't remove them!
        userId: user._id
      }, cb);
    }
  }, function(err, results){
    if(err) return next(err);

    results.saveUser[0].getTransformedData(function(err, userTransformed){
      if(err) return next(err);

      res.json(userTransformed);
    });
  });
};

api.reroll = function(req, res, next) {
  var user = res.locals.user;

  if(user.balance < 1){
    return res.json(401, {err: shared.i18n.t('notEnoughGems', req.language)})
  }

  user.balance--;

  // TODO don't load rewards
  user.getTasks(function(err, tasks){
    if(err) return next(err);

    tasks.forEach(function(task){
      if(task.type !== 'reward'){
        task.value = 0;
      }
    });

    var analyticsData = {
      uuid: user._id,
      acquireMethod: 'Gems',
      gemCost: 4,
      category: 'behavior'
    };
    analytics.track('Fortify Potion', analyticsData);

    async.parallel({
      saveUser: user.save.bind(user),
      saveTasks: function(cb) {
        // async.each doesn't support passing the index of the item being processed,
        // so we convert it to an object of {index, value}
        // taken from https://github.com/caolan/async/issues/669#issuecomment-65004297
        var tasksMap = tasks.map(function(task, index){
          return {index: index, value: task};
        });
        async.each(tasksMap, function(item, cb1){
          var task = tasks[item.index]
          if(task.isModified()){
            task.save(function(err, savedTask){
              if(err) return cb1(err);
              tasks[item.index] = savedTask;
              cb1();
            });
          }else{
            cb1();
          }
        }, cb);
      }
    }, function(err, results){
      if(err) return next(err);

      res.json(results.saveUser[0].addTasksToUser(tasks));
    });
  });
};

api.rebirth = function(req, res, next) {
  user.fns.rebirthUser(req, function(err){
    if(err) return res.json(err.code, {err: err.message});

    user.getTasks(function(err, tasks){
      if(err) return next(err);

      tasks.forEach(function(task){
        if(task.type === 'reward') return;

        task.value = 0;
        if(task.type === 'daily') task.streak = 0;
      });

      async.parallel({
        saveUser: user.save.bind(user),
        saveTasks: function(cb) {
          // async.each doesn't support passing the index of the item being processed,
          // so we convert it to an object of {index, value}
          // taken from https://github.com/caolan/async/issues/669#issuecomment-65004297
          var tasksMap = tasks.map(function(task, index){
            return {index: index, value: task};
          });
          async.each(tasksMap, function(item, cb1){
            var task = tasks[item.index]
            if(task.isModified()){
              task.save(function(err, savedTask){
                if(err) return cb1(err);
                tasks[item.index] = savedTask;
                cb1();
              });
            }else{
              cb1();
            }
          }, cb);
        }
      }, function(err, results){
        if(err) return next(err);

        res.json(results.saveUser[0].addTasksToUser(tasks));
      });
    });
  }, analytics);
};

api.clearCompleted = function(req, res, next) {
  var user = res.locals.user;

  Task.find({
    userId: user._id,
    type: 'todo'
  }, function(err, todos) {
    if(err) return next(err);

    var completed = [];
    var uncompleted = [];

    todos.forEach(function(todo){
      todo.completed ? completed.push(todo) : uncompleted.push(todo);
    });

    _.pull.apply(null, [user.tasksOrder.todos].concat(completed));
    async.parallel({
      user: user.save.bind(user),
      tasks: function(cb){
        async.each(completed, function(todo, cb1){
          todo.remove(cb1);
        }, cb);
      }
    }, function(err){
      if(err) return next(err);

      res.json(uncompleted);
    });
  });
};

// TODO sortTask
api.sortTask = function(req, res, next) {
  var id = req.params && req.params.id;
  var to = req.query && req.query.to;
  var from = req.query && req.query.from;

  if(!id) return res.json(400, {err: 'Missing task id parameter.'});
  if(!to || !from) return res.json(400, {err: '?to=__&from=__ are required'});

  var user = res.locals.user;
  Task.findOne({
    _id: id,
    userId: user._id
  }, '_id type', function(err, task){
    if(err) return next(err);
    if(!task) return res.json(404, shared.i18n.t('messageTaskNotFound', req.language));
    // TODO should fail in case of id of task at position !== from req.params.id
    var orders = user.tasksOrder[task.type + 's'];
    // In case of task not ordered, do not move any existing task
    var movedTask = orders[from] ? orders.splice(from, 1)[0] : task._id;
    if (to === -1) { // we've used the Push To Bottom feature
      orders.push(movedTask);
    } else { // any other sort method uses only positive 'to' values
      // If task moved to non existing index, just push at the bottom
      orders[to] ? orders.splice(to, 0, movedTask) : order.push(tasksOrder);
    }

    async.parallel({
      getTasks: function(cb){
        Task.find({
          type: task.type,
          userId: user._id
        }, cb)
      },
      user: user.save.bind(user)
    }, function(err, results){
      if(err) return next(err);

      res.json(results.getTasks[0]);
    });
  });
};

api.updateTask = function(req, res, next) {
  var user = res.locals.user;

  Task.findOne({
    _id: req.params.id,
    userId: user._id
  }, function(err, task) {
    if(err) return next(err);
    if(!task) return res.json(404, {err: 'Task not found.'})

    req.task = task;
    user.ops.updateTask(req, function(err) {
      if(err) return res.json(err.code, {err: err.message});

      task.save(function(err, task){
        if(err) return next(err);

        return res.json(task);
      });
    });
  });
};

api.deleteTask = function(req, res, next) {
  var user = res.locals.user;
  if(!req.params || !req.params.id) return res.json(404, shared.i18n.t('messageTaskNotFound', req.language));

  var id = req.params.id;
  // Try removing from all orders since we don't know the task's type
  var removeTaskFromOrder = function(array) {
    _.pull(array, id);
  };

  ['habits', 'dailys', 'todos', 'rewards'].forEach(function (type){
    removeTaskFromOrder(user.tasksOrder[type])
  });

  async.parallel({
    user: user.save.bind(user),
    task: function(cb) {
      Task.remove({_id: id, userId: user._id}, cb);
    }
  }, function(err, results) {
    if(err) return next(err);

    if(results.task.result.n < 1){
      return res.json(404, {err: shared.i18n.t('messageTaskNotFound', req.language)})
    }

    res.json(200, {});
  });
};

api.addTask = function(req, res, next) {
  var user = res.locals.user;
  
  // Support passing custom id
  if(req.body.id) req.body._id = req.body.id;
  var task = new Task(req.body);

  // Very rudimentary existence test ported from index.coffee to avoid duplicates errors
  if(user.tasksOrder[task.type + 's'].indexOf(task._id) !== -1) {
    return res.json(409, {err: shared.i18n.t('messageDuplicateTaskID', req.language)});
  }

  task.userId = user._id;
  user.tasksOrder[task.type + 's'].push(task._id);

  async.parallel({
    task: task.save.bind(task),
    user: user.save.bind(user)
  }, function(err, results){
    if(err) return next(err);

    res.json(results.task[0]);
  });
};

/**
 * All other user.ops which can easily be mapped to habitrpg-shared/index.coffee, not requiring custom API-wrapping
 */
_.each(shared.wrap({}).ops, function(op,k){
  if (!api[k]) {
    api[k] = function(req, res, next) {
      res.locals.user.ops[k](req,function(err, response){
        // If we want to send something other than 500, pass err as {code: 200, message: "Not enough GP"}
        if (err) {
          if (!err.code) return next(err);
          if (err.code >= 400) return res.json(err.code,{err:err.message});
          // In the case of 200s, they're friendly alert messages like "You're pet has hatched!" - still send the op
        }
        res.locals.user.save(function(err){
          if (err) return next(err);
          res.json(200,response);
        })
      }, analytics);
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
  if (_.isEmpty(req.body)) req.body = []; // cases of {} or null

  var user = res.locals.user;
  var oldSend = res.send;
  var oldJson = res.json;

  // Stash user.save, we'll queue the save op till the end (so we don't overload the server)
  var oldSave = user.save;
  user.save = function(cb){cb(null,user)}

  // Setup the array of functions we're going to call in parallel with async
  res.locals.ops = [];
  var ops = _.transform(req.body, function(m,_req){
    if (_.isEmpty(_req)) return;
    _req.language = req.language;

    m.push(function() {
      var cb = arguments[arguments.length-1];
      res.locals.ops.push(_req);
      res.send = res.json = function(code, data) {
        if (_.isNumber(code) && code >= 500)
          return cb(code+": "+ (data.message ? data.message : data.err ? data.err : JSON.stringify(data)));
        return cb();
      };
      if(!api[_req.op]) { return cb(_req.op + ' operation not found'); }
      api[_req.op](_req, res, cb);
    });
  })
  // Finally, save user at the end
  .concat(function(){
    user.save = oldSave;
    user.save(arguments[arguments.length-1]);
  });

  // call all the operations, then return the user object to the requester
  async.waterfall(ops, function(err,_user) {
    res.json = oldJson;
    res.send = oldSend;
    if (err) return next(err);

    var response;
    // return only drops & streaks
    if (_user._tmp && _user._tmp.drop){
      response = _user.toJSON();
      res.json(200, {_tmp: {drop: response._tmp.drop}, _v: response._v});

    // Fetch full user object
    } else if (res.locals.wasModified){
      // Preen 3-day past-completed To-Dos from Angular & mobile app
      _user.getTransformedData(function(err, transformedData){
        response = transformedData;

        response.todos = shared.preenTodos(response.todos);
        res.json(200, response);
      });

    // return only the version number
    } else{
      response = _user.toJSON();
      res.json(200, {_v: response._v});
    }

    user.fns.nullify();
    user = res.locals.user = oldSend = oldJson = oldSave = null;
  });
};

function _generateWebhookTaskData(task, direction, delta, stats, user) {
  var extendedStats = _.extend(stats, {
    toNextLevel: shared.tnl(user.stats.lvl),
    maxHealth: shared.maxHealth,
    maxMP: user._statsComputed.maxMP
  });

  var userData = {
    _id: user._id,
    _tmp: user._tmp,
    stats: extendedStats
  };

  var taskData = {
    details: task,
    direction: direction,
    delta: delta
  }

  return {
    task: taskData,
    user: userData
  }
}
