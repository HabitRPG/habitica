/* @see ./routes.coffee for routing*/

var url = require('url');
var ipn = require('paypal-ipn');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('../../../common');
var User = require('./../models/user').model;
var utils = require('./../utils');
var ga = utils.ga;
var Group = require('./../models/group').model;
var Challenge = require('./../models/challenge').model;
var moment = require('moment');
var logging = require('./../logging');
var acceptablePUTPaths;
var api = module.exports;
var qs = require('qs');
var request = require('request');
var validator = require('validator');

// api.purchase // Shared.ops

api.getContent = function(req, res, next) {
  var language = 'en';

  if(typeof req.query.language != 'undefined')
    language = req.query.language.toString(); //|| 'en' in i18n

  var content = _.cloneDeep(shared.content);
  var walk = function(obj, lang){
    _.each(obj, function(item, key, source){
      if(_.isPlainObject(item) || _.isArray(item)) return walk(item, lang);
      if(_.isFunction(item) && item.i18nLangFunc) source[key] = item(lang);
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
  Local Methods
  ---------------
*/

var findTask = function(req, res) {
  return res.locals.user.tasks[req.params.id];
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

  var clearMemory = function(){user = task = id = direction = null;}

  // Send error responses for improper API call
  if (!id) return res.json(400, {err: ':id required'});
  if (direction !== 'up' && direction !== 'down') {
    if (direction == 'unlink' || direction == 'sort') return next();
    return res.json(400, {err: ":direction must be 'up' or 'down'"});
  }
  // If exists already, score it
  if (task = user.tasks[id]) {
    // Set completed if type is daily or todo and task exists
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up';
    }
  } else {
    // If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it
    // Defaults. Other defaults are handled in user.ops.addTask()
    task = {
      id: id,
      type: req.body && req.body.type,
      text: req.body && req.body.text,
      notes: (req.body && req.body.notes) || "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
    };

    if (task.type === 'daily' || task.type === 'todo')
      task.completed = direction === 'up';
      
    task = user.ops.addTask({body:task});
  }
  var delta = user.ops.score({params:{id:task.id, direction:direction}, language: req.language});

  user.save(function(err,saved){
    if (err) return next(err);
    // TODO this should be return {_v,task,stats,_tmp}, instead of merging everything togther at top-level response
    // However, this is the most commonly used API route, and changing it will mess with all 3rd party consumers. Bad idea :(
    res.json(200, _.extend({
      delta: delta,
      _tmp: user._tmp
    }, saved.toJSON().stats));

    // Webhooks
    _.each(user.preferences.webhooks, function(h){
      if (!h.enabled || !validator.isURL(h.url)) return;
      request.post({
        url: h.url,
        //form: {task: task, delta: delta, user: _.pick(user, ['stats', '_tmp'])} // this is causing "Maximum Call Stack Exceeded"
        body: {direction:direction, task: task, delta: delta, user: _.pick(user, ['_id', 'stats', '_tmp'])}, json:true
      });
    });

    if (
      (!task.challenge || !task.challenge.id || task.challenge.broken) // If it's a challenge task, sync the score. Do it in the background, we've already sent down a response and the user doesn't care what happens back there
      || (task.type == 'reward') // we don't want to update the reward GP cost
    ) return clearMemory();
    Challenge.findById(task.challenge.id, 'habits dailys todos rewards', function(err, chal){
      if (err) return next(err);
      if (!chal) {
        task.challenge.broken = 'CHALLENGE_DELETED';
        user.save();
        return clearMemory();
      }
      var t = chal.tasks[task.id];
      // this task was removed from the challenge, notify user
      if (!t) {
        chal.syncToUser(user);
        return clearMemory();
      }
      t.value += delta;
      if (t.type == 'habit' || t.type == 'daily')
        t.history.push({value: t.value, date: +new Date});
      chal.save();
      clearMemory();
    });
  });
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
  var task = findTask(req,res);
  if (!task) return res.json(404, {err: "No task found."});
  return res.json(200, task);
};


/*
  Update Task
*/

//api.deleteTask // see Shared.ops
// api.updateTask // handled in Shared.ops
// api.addTask // handled in Shared.ops
// api.sortTask // handled in Shared.ops #TODO updated api, mention in docs

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
  var user = res.locals.user.toJSON();
  user.stats.toNextLevel = shared.tnl(user.stats.lvl);
  user.stats.maxHealth = 50;
  user.stats.maxMP = res.locals.user._statsComputed.maxMP;
  delete user.apiToken;
  if (user.auth) {
    delete user.auth.hashed_password;
    delete user.auth.salt;
  }
  return res.json(200, user);
};

/**
 * Get anonymized User
 */
api.getUserAnonymized = function(req, res, next) {
  var user = res.locals.user.toJSON();
  user.stats.toNextLevel = shared.tnl(user.stats.lvl);
  user.stats.maxHealth = 50;
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

//// Uncomment this if we we want to disable GP-restoring (eg, holiday events)
//_.each('stats.gp'.split(' '), function(removePath){
//  delete acceptablePUTPaths[removePath];
//})

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
      errors.push("path `" + k + "` was not saved, as it's a protected path. See https://github.com/HabitRPG/habitrpg/blob/develop/API.md for PUT /api/v2/user.");
    return true;
  });
  user.save(function(err) {
    if (!_.isEmpty(errors)) return res.json(401, {err: errors});
    if (err) return next(err);
    res.json(200, user);
    user = errors = null;
  });
};

api.cron = function(req, res, next) {
  var user = res.locals.user,
    progress = user.fns.cron({ga:ga, mixpanel:utils.mixpanel}),
    ranCron = user.isModified(),
    quest = shared.content.quests[user.party.quest.key];

  if (ranCron) res.locals.wasModified = true;
  if (!ranCron) return next(null,user);
  Group.tavernBoss(user,progress);
  if (!quest) return user.save(next);

  // If user is on a quest, roll for boss & player, or handle collections
  // FIXME this saves user, runs db updates, loads user. Is there a better way to handle this?
  async.waterfall([
    function(cb){
      user.save(cb); // make sure to save the cron effects
    },
    function(saved, count, cb){
      var type = quest.boss ? 'boss' : 'collect';
      Group[type+'Quest'](user,progress,cb);
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
};

// api.reroll // Shared.ops
// api.reset // Shared.ops

api['delete'] = function(req, res, next) {
  var plan = res.locals.user.purchased.plan;
  if (plan && plan.customerId && !plan.dateTerminated)
    return res.json(400,{err:"You have an active subscription, cancel your plan before deleting your account."});
  res.locals.user.remove(function(err){
    if (err) return next(err);
    res.send(200);
  })
}

/*
 ------------------------------------------------------------------------
 Gems
 ------------------------------------------------------------------------
 */

// api.unlock // see Shared.ops

api.addTenGems = function(req, res, next) {
  var user = res.locals.user;
  user.balance += 2.5;
  user.save(function(err){
    if (err) return next(err);
    res.send(204);
  })
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

  var done = function(){
    var err = arguments[0];
    var saved = _.size(arguments == 3) ? arguments[2] : arguments[1];
    if (err) return next(err);
    res.json(saved);
    user = targetType = targetId = klass = spell = null;
  }

  switch (targetType) {
    case 'task':
      if (!user.tasks[targetId]) return res.json(404, {err: 'Task "' + targetId + '" not found.'});
      spell.cast(user, user.tasks[targetId]);
      user.save(done);
      break;

    case 'self':
      spell.cast(user);
      user.save(done);
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
        },
        function(whatever, cb){
          user.save(cb);
        }
      ], done);
      break;
  }
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

      if(group.type == 'guild'){
        inv.guilds.push(req.session.partyInvite);
      }else{
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
      }, ga);
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
  if (req.body[0] && req.body[0].data)
    return res.json(501, {err: "API has been updated, please refresh your browser or upgrade your mobile app."})

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

    var response = _user.toJSON();
    response.wasModified = res.locals.wasModified;

    user.fns.nullify();
    user = res.locals.user = oldSend = oldJson = oldSave = null;

    // return only drops & streaks
    if (response._tmp && response._tmp.drop){
      res.json(200, {_tmp: {drop: response._tmp.drop}, _v: response._v});

    // Fetch full user object
    }else if(response.wasModified){
      // Preen 3-day past-completed To-Dos from Angular & mobile app
      response.todos = _.where(response.todos, function(t) {
        return !t.completed || (t.challenge && t.challenge.id) || moment(t.dateCompleted).isAfter(moment().subtract({days:3}));
      });
      res.json(200, response);

    // return only the version number
    }else{
      res.json(200, {_v: response._v});
    }
  });
};
