var url = require('url');
var ipn = require('paypal-ipn');
var _ = require('lodash');
var nconf = require('nconf');
var asyncM = require('async');
var shared = require('../../../../common');
import {
  model as User,
} from '../../models/user';
import { model as Tag } from '../../models/tag';
import * as Tasks from '../../models/task';
import Q from 'q';
import {removeFromArray} from './../../libs/api-v3/collectionManipulators';
var utils = require('./../../libs/api-v2/utils');
var analytics = utils.analytics;
import {
  basicFields as basicGroupFields,
  model as Group,
} from '../../models/group';
import {
  model as Challenge,
} from '../../models/challenge';
var moment = require('moment');
var logging = require('./../../libs/api-v2/logging');
var acceptablePUTPaths;
let restrictedPUTSubPaths;

let i18n = shared.i18n;

var api = module.exports;
var firebase = require('../../libs/api-v2/firebase');
var webhook = require('../../libs/api-v2/webhook');

// api.purchase // Shared.ops

api.getContent = function(req, res, next) {
  var language = 'en';

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

  Tasks.Task.findOne({
    _id: id,
    userId: user._id
  }, function(err, task){
    if(err) return next(err);

    // If exists already, score it
    if (!task) {
      // If it doesn't exist, this is likely a 3rd party up/down - create a new one, then score it
      // Defaults. Other defaults are handled in user.ops.addTask()
      task = new Tasks.Task({
        _id: id, // TODO this might easily lead to conflicts as ids are now unique db-wide
        type: body.type,
        text: body.text,
        userId: user._id,
        notes: body.notes || "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task." // TODO translate
      });

      user.tasksOrder[task.type + 's'].unshift(task._id);
    }

    // Set completed if type is daily or todo
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up';
    }

    var delta = shared.ops.scoreTask({
      user,
      task,
      direction,
    }, req);

    asyncM.parallel({
      task: task.save.bind(task),
      user: user.save.bind(user)
    }, function(err, results){
      if(err) return next(err);

      // FIXME this is suuuper strange, sometimes results.user is an array, sometimes user directly
      var saved = Array.isArray(results.user) ? results.user[0] : results.user;
      var task = Array.isArray(results.task) ? results.task[0] : results.task;

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

        Tasks.Task.findOne({
          '_id': task.challenge.taskId,
          userId: {$exists: false}
        }, function(err, chalTask){
          if(err) return; //FIXME
          // this task was removed from the challenge, notify user
          if(!chalTask) {
            // TODO finish
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

  user.getTasks(req.query.type, function (err, tasks) {
    if (err) return next(err);
    res.status(200).json(tasks.map(task => task.toJSONV2()));
  });
};

/**
 * Get Task
 */
api.getTask = function(req, res, next) {
  var user = res.locals.user;

  Tasks.Task.findOne({
    userId: user._id,
    _id: req.params.id,
  }, function (err, task) {
    if (err) return next(err);
    if (!task) return res.status(404).json({err: shared.i18n.t('messageTaskNotFound')});
    res.status(200).json(task.toJSONV2());
  });
};

/*
  ------------------------------------------------------------------------
  Items
  ------------------------------------------------------------------------
*/
// api.buy // handled in Shard.ops

api.getBuyList = function (req, res, next) {
   var list = shared.updateStore(res.locals.user);
   return res.status(200).json(list);
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
    user.stats.toNextLevel = shared.tnl(user.stats.lvl);
    user.stats.maxHealth = shared.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;
    delete user.apiToken;
    if (user.auth && user.auth.local) {
      delete user.auth.local.hashed_password;
      delete user.auth.local.salt;
    }
    return res.status(200).json(user);
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

    return res.status(200).json(user);
  });
};

/**
 * This tells us for which paths users can call `PUT /user` (or batch-update equiv, which use `User.set()` on our client).
 * The trick here is to only accept leaf paths, not root/intermediate paths (see http://goo.gl/OEzkAs)
 * FIXME - one-by-one we want to widdle down this list, instead replacing each needed set path with API operations
 */
acceptablePUTPaths = _.reduce(require('./../../models/user').schema.paths, (m, v, leaf) => {
  let updatablePaths = 'achievements filters flags invitations lastCron party preferences profile stats inbox'.split(' ');
  let found = _.find(updatablePaths, (rootPath) => {
    return leaf.indexOf(rootPath) === 0;
  });

  if (found) m[leaf] = true;

  return m;
}, {});

restrictedPUTSubPaths = 'stats.class'.split(' ');

_.each(restrictedPUTSubPaths, (removePath) => {
  delete acceptablePUTPaths[removePath];
});

let requiresPurchase = {
  'preferences.background': 'background',
  'preferences.shirt': 'shirt',
  'preferences.size': 'size',
  'preferences.skin': 'skin',
  'preferences.chair': 'chair',
  'preferences.hair.bangs': 'hair.bangs',
  'preferences.hair.base': 'hair.base',
  'preferences.hair.beard': 'hair.beard',
  'preferences.hair.color': 'hair.color',
  'preferences.hair.flower': 'hair.flower',
  'preferences.hair.mustache': 'hair.mustache',
};

let checkPreferencePurchase = (user, path, item) => {
  let itemPath = `${path}.${item}`;
  let appearance = _.get(shared.content.appearances, itemPath)
  if (!appearance) return false;
  if (appearance.price === 0) return true;

  return _.get(user.purchased, itemPath);
};

/**
 * Update user
 * Send up PUT /user as `req.body={path1:val, path2:val, etc}`. Example:
 * PUT /user {'stats.hp':50, 'tasks.TASK_ID.repeat.m':false}
 * See acceptablePUTPaths for which user paths are supported
*/
api.update = (req, res, next) => {
  let user = res.locals.user;
  let errors = [];

  if (_.isEmpty(req.body)) return res.status(200).json(user);

  _.each(req.body, (v, k) => {
    let purchasable = requiresPurchase[k];

    if (purchasable && !checkPreferencePurchase(user, purchasable, v)) {
      return errors.push(`Must purchase ${v} to set it on ${k}`);
    }

    if (acceptablePUTPaths[k]) {
      user.fns.dotSet(k, v);
    } else {
      errors.push(shared.i18n.t('messageUserOperationProtected', { operation: k }));
    }
    return true;
  });

  user.save((err) => {
    if (!_.isEmpty(errors)) return res.status(401).json({err: errors});
    if (err) {
      if (err.name == 'ValidationError') {
        let errorMessages = _.map(_.values(err.errors), (error) => {
          return error.message;
        });
        return res.status(400).json({err: errorMessages});
      }
      return next(err);
    }

    res.status(200).json(user);
    user = errors = null;
  });
};

api.cron = require('../../middlewares/api-v3/cron');

// api.reroll // Shared.ops
// api.reset // Shared.ops

api.delete = function(req, res, next) {
  var user = res.locals.user;
  var plan = user.purchased.plan;

  if (plan && plan.customerId && !plan.dateTerminated){
    return res.status(400).json({err:"You have an active subscription, cancel your plan before deleting your account."});
  }

  let types = ['party', 'publicGuilds', 'privateGuilds'];
  let groupFields = basicGroupFields.concat(' leader memberCount');

  Group.getGroups({user, types, groupFields})
  .then(groups => {
    return Q.all(groups.map((group) => {
      return group.leave(user, 'remove-all');
    }));
  })
  .then(() => {
    return Tasks.Task.remove({
      userId: user._id,
    }).exec();
  })
  .then(() => {
    return user.remove();
  })
  .then(() => {
    firebase.deleteUser(user._id);
    res.sendStatus(200);
  })
  .catch(next);
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
      res.sendStatus(204);
    });
  };

  api.addHourglass = function(req, res, next) {
    var user = res.locals.user;

    user.purchased.plan.consecutive.trinkets += 1;

    user.save(function(err){
      if (err) return next(err);
      res.sendStatus(204);
    });
  };
}

/*
 ------------------------------------------------------------------------
 Tags
 ------------------------------------------------------------------------
 */

api.getTags = function (req, res, next) {
  res.json(res.locals.user.tags.toObject().map(tag => {
    return {
      name: tag.name,
      id: tag._id,
      challenge: tag.challenge,
    }
  }));
};

api.getTag = function (req, res, next) {
  let tag = res.locals.user.tags.id(req.params.id);
  if (!tag) {
    return res.status(404).json({err: i18n.t('messageTagNotFound', req.language)});
  }

  res.json({
    name: tag.name,
    id: tag._id,
    challenge: tag.challenge,
  });
};

api.addTag = function (req, res, next) {
  let user = res.locals.user;

  user.tags.push(Tag.sanitize(req.body));
  user.save(function (err, user) {
    if (err) return next(err);

    res.json(user.tags.toObject().map(tag => {
      return {
        name: tag.name,
        id: tag._id,
        challenge: tag.challenge,
      }
    }));
  });
};

api.updateTag = function (req, res, next) {
  let user = res.locals.user;

  let tag = user.tags.id(req.params.id);
  if (!tag) {
    return res.status(404).json({err: i18n.t('messageTagNotFound', req.language)});
  }

  tag.name = req.body.tag;
  user.save(function (err, user) {
    if (err) return next(err);

    res.json({
      name: tag.name,
      id: tag._id,
      challenge: tag.challenge,
    });
  });
}

api.sortTag = function (req, res, next) {
  var ref = req.query;
  var to = ref.to;
  var from = ref.from;
  let user = res.locals.user;

  if (!((to != null) && (from != null))) {
    return res.statu(500).json('?to=__&from=__ are required');
  }

  user.tags.splice(to, 0, user.tags.splice(from, 1)[0]);
  user.save(function (err, user) {
    if (err) return next(err);

    res.json(user.tags.toObject().map(tag => {
      return {
        name: tag.name,
        id: tag._id,
        challenge: tag.challenge,
      }
    }));
  });
}

api.deleteTag = function (req, res, next) {
  let user = res.locals.user;

  let tag = user.tags.id(req.params.id);
  if (!tag) {
    return res.status(404).json({err: i18n.t('messageTagNotFound', req.language)});
  }

  tag.remove();

  Tasks.Task.update({
    userId: user._id,
  }, {
    $pull: {
      tags: tag._id,
    },
  }, {multi: true}).exec();

  user.save(function (err, user) {
    if (err) return next(err);

    res.json(user.tags.toObject().map(tag => {
      return {
        name: tag.name,
        id: tag._id,
        challenge: tag.challenge,
      }
    }));
  });
}

/*
 ------------------------------------------------------------------------
 Spells
 ------------------------------------------------------------------------
 */
api.cast = async function(req, res, next) {
  try {
    let user = res.locals.user;
    let spellId = req.params.spellId;
    let targetId = req.query.targetId;

    let klass = common.content.spells.special[spellId] ? 'special' : user.stats.class;
    let spell = common.content.spells[klass][spellId];

    if (!spell) return res.status(404).json({err: 'Spell "' + req.params.spell + '" not found.'});
    if (spell.mana > user.stats.mp) return res.status(400).json({err: 'Not enough mana to cast spell'});

    let targetType = spell.target;

    if (targetType === 'task') {
      let task = await Tasks.Task.findOne({
        _id: targetId,
        userId: user._id,
      }).exec();
      if (!task) {
        return res.status(404).json({err: 'Task "' + targetId + '" not found.'});
      }

      spell.cast(user, task, req);
      await task.save();
    } else if (targetType === 'self') {
      spell.cast(user, null, req);
      await user.save();
    } else if (targetType === 'tasks') { // new target type when all the user's tasks are necessary
      let tasks = await Tasks.Task.find({
        userId: user._id,
        'challenge.id': {$exists: false}, // exclude challenge tasks
        $or: [ // Exclude completed todos
          {type: 'todo', completed: false},
          {type: {$in: ['habit', 'daily', 'reward']}},
        ],
      }).exec();

      spell.cast(user, tasks, req);

      let toSave = tasks.filter(t => t.isModified());
      let isUserModified = user.isModified();
      toSave.unshift(user.save());
      let saved = await Q.all(toSave);
    } else if (targetType === 'party' || targetType === 'user') {
      let party = await Group.getGroup({groupId: 'party', user});
      // arrays of users when targetType is 'party' otherwise single users
      let partyMembers;

      if (targetType === 'party') {
        if (!party) {
          partyMembers = [user]; // Act as solo party
        } else {
          partyMembers = await User.find({'party._id': party._id}).select(partyMembersFields).exec();
        }

        spell.cast(user, partyMembers, req);
        await Q.all(partyMembers.map(m => m.save()));
      } else {
        if (!party && (!targetId || user._id === targetId)) {
          partyMembers = user;
        } else {
          partyMembers = await User.findOne({_id: targetId, 'party._id': party._id}).select(partyMembersFields).exec();
        }

        if (!partyMembers) throw new NotFound(res.t('userWithIDNotFound', {userId: targetId}));
        spell.cast(user, partyMembers, req);
        await partyMembers.save();
      }

      if (party && !spell.silent) {
        let message = `\`${user.profile.name} casts ${spell.text()}${targetType === 'user' ? ` on ${partyMembers.profile.name}` : ' for the party'}.\``;
        party.sendChat(message);
        await party.save();
      }
    }

    user.getTransformedData(function (err, transformedUser) {
      if (err) next(err);
      res.json(transformedUser);
    });
  } catch (e) {
    return res.status(500).json({err: 'An error happened'});
  }
}

// It supports guild too now but we'll stick to partyInvite for backward compatibility
api.sessionPartyInvite = function(req,res,next){
  if (!req.session.partyInvite) return next();
  var inv = res.locals.user.invitations;
  if (inv.party && inv.party.id) return next(); // already invited to a party
  asyncM.waterfall([
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

api.clearCompleted = function(req, res, next) {
  var user = res.locals.user;

  Tasks.Task.remove({
    userId: user._id,
    type: 'todo',
    completed: true,
    'challenge.id': {$exists: false},
  }, function (err) {
    if (err) return next(err);

    Tasks.Task.find({
      userId: user._id,
      type: 'todo',
      completed: false,
    }, function (err, uncompleted) {
      if (err) return next(err);
      res.json(uncompleted);
    });
  });
};

api.sortTask = async function (req, res, next) {
  try {
    let user = res.locals.user;
    let to = Number(req.query.to);

    let task = await Tasks.Task.findOne({
      _id: req.params.id,
      userId: user._id,
    }).exec();

    if (!task) return res.status(404).json(i18n.t('messageTaskNotFound', req.language));
    if (task.type !== 'todo' || !task.completed) {
      let order = user.tasksOrder[`${task.type}s`];
      let currentIndex = order.indexOf(task._id);

      // If for some reason the task isn't ordered (should never happen), push it in the new position
      // if the task is moved to a non existing position
      // or if the task is moved to position -1 (push to bottom)
      // -> push task at end of list
      if (!order[to] && to !== -1) {
        order.push(task._id);
      } else {
        if (currentIndex !== -1) order.splice(currentIndex, 1);
        if (to === -1) {
          order.push(task._id);
        } else {
          order.splice(to, 0, task._id);
        }
      }
      await user.save();
    }

    user.getTasks(function (err, userTasks) {
      if(err) return next(err);
      res.json(userTasks);
    });
  } catch (e) {
    res.status(500).json({err: 'An error happened.'});
  }
}

api.deleteTask = function(req, res, next) {
  var user = res.locals.user;
  if(!req.params || !req.params.id) return res.json(404, shared.i18n.t('messageTaskNotFound', req.language));

  var id = req.params.id;
  // Try removing from all orders since we don't know the task's type
  var removeTaskFromOrder = function(array) {
    removeFromArray(array, id);
  };

  ['habits', 'dailys', 'todos', 'rewards'].forEach(function (type){
    removeTaskFromOrder(user.tasksOrder[type])
  });

  asyncM.parallel({
    user: user.save.bind(user),
    task: function(cb) {
      Tasks.Task.remove({_id: id, userId: user._id}, cb);
    }
  }, function(err, results) {
    if(err) return next(err);

    if(results.task.result.n < 1){
      return res.status(404).json({err: shared.i18n.t('messageTaskNotFound', req.language)})
    }

    res.status(200).json({});
  });
};

api.updateTask = function(req, res, next) {
  var user = res.locals.user;

  Tasks.Task.findOne({
    _id: req.params.id,
    userId: user._id
  }, function(err, task) {
    if(err) return next(err);
    if(!task) return res.status(404).json({err: 'Task not found.'})

    try {
      _.assign(task, shared.ops.updateTask(task.toObject(), req));
      task.save(function(err, task){
        if(err) return next(err);

        return res.json(task.toJSONV2());
      });
    } catch (err) {
      return res.status(err.code).json({err: err.message});
    }
  });
};

api.addTask = function(req, res, next) {
  var user = res.locals.user;
  req.body.type = req.body.type || 'habit';
  req.body.text = req.body.text || 'text';

  var task = new Tasks[req.body.type](Tasks.Task.sanitizeCreate(req.body));

  task.userId = user._id;
  user.tasksOrder[task.type + 's'].unshift(task._id);

  // Validate that the task is valid and throw if it isn't
  // otherwise since we're saving user/challenge and task in parallel it could save the user/challenge with a tasksOrder that doens't match reality
  let validationErrors = task.validateSync();
  if (validationErrors) return next(validationErrors);

  Q.all([
    user.save(),
    task.save({validateBeforeSave: false}) // already done ^
  ]).then(results => {
    res.status(200).json(results[1].toJSONV2());
  }).catch(next);
};

/**
 * All other user.ops which can easily be mapped to common/script/index.js, not requiring custom API-wrapping
 */
_.each(shared.ops, function(op,k){
  if (!api[k]) {
    api[k] = function(req, res, next) {
      var opResponse;
      try {
        opResponse = shared.ops[k](res.locals.user, req, analytics);
      } catch (err) {
        if (!err.code) return next(err);
        if (err.code >= 400) return res.status(err.code).json({err:err.message});
      }

      // If we want to send something other than 500, pass err as {code: 200, message: "Not enough GP"}
      res.locals.user.save(function(err){
        if (err) return next(err);
        res.status(200).json(response);
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
  if (_.isEmpty(req.body)) req.body = []; // cases of {} or null
  if (req.body[0] && req.body[0].data)
    return res.status(501).json({err: "API has been updated, please refresh your browser or upgrade your mobile app."})

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
      if(!api[_req.op]) { return cb(shared.i18n.t('messageUserOperationNotFound', { operation: _req.op })); }

      api[_req.op](_req, res, cb);
    });
  })
  // Finally, save user at the end
  .concat(function(){
    user.save = oldSave;
    user.save(arguments[arguments.length-1]);
  });

  // call all the operations, then return the user object to the requester
  asyncM.waterfall(ops, function(err,_user) {
    res.json = oldJson;
    res.send = oldSend;
    if (err) return next(err);

    var response;

    // return only drops & streaks
    if (_user._tmp && _user._tmp.drop){
      response = _user.toJSON();
      res.status(200).json({_tmp: {drop: response._tmp.drop}, _v: response._v});

    // Fetch full user object
    } else if (res.locals.wasModified){
      // Preen 3-day past-completed To-Dos from Angular & mobile app
      _user.getTransformedData(function(err, transformedData){
        if (err) next(err);
        response = transformedData;

        response.todos = shared.preenTodos(response.todos);
        res.status(200).json(response);
      });
    // return only the version number
    } else{
      response = _user.toJSON();
      res.status(200).json({_v: response._v});
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
