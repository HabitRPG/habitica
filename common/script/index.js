import {
  daysSince,
  shouldDo,
} from '../../common/script/cron';
import {
  MAX_HEALTH,
  MAX_LEVEL,
  MAX_STAT_POINTS,
} from './constants';
import * as statHelpers from './statHelpers';

var $w, _, api, content, i18n, preenHistory, moment, sortOrder,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

moment = require('moment');

_ = require('lodash');

content = require('./content/index');

i18n = require('./i18n');

api = module.exports = {};

api.i18n = i18n;
api.shouldDo = shouldDo;

api.maxLevel = MAX_LEVEL;
api.capByLevel = statHelpers.capByLevel;
api.maxHealth = MAX_HEALTH;
api.tnl = statHelpers.toNextLevel;
api.diminishingReturns = statHelpers.diminishingReturns;

$w = api.$w = function(s) {
  return s.split(' ');
};

api.dotSet = function(obj, path, val) {
  var arr;
  arr = path.split('.');
  return _.reduce(arr, (function(_this) {
    return function(curr, next, index) {
      if ((arr.length - 1) === index) {
        curr[next] = val;
      }
      return curr[next] != null ? curr[next] : curr[next] = {};
    };
  })(this), obj);
};

api.dotGet = function(obj, path) {
  return _.reduce(path.split('.'), ((function(_this) {
    return function(curr, next) {
      return curr != null ? curr[next] : void 0;
    };
  })(this)), obj);
};


/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use these helper functions:
 */

api.refPush = function(reflist, item, prune) {
  if (prune == null) {
    prune = 0;
  }
  item.sort = _.isEmpty(reflist) ? 0 : _.max(reflist, 'sort').sort + 1;
  if (!(item.id && !reflist[item.id])) {
    item.id = api.uuid();
  }
  return reflist[item.id] = item;
};

api.planGemLimits = {
  convRate: 20,
  convCap: 25
};

/*
Preen history for users with > 7 history entries
This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
 */

preenHistory = function(history) {
  var newHistory, preen, thisMonth;
  history = _.filter(history, function(h) {
    return !!h;
  });
  newHistory = [];
  preen = function(amount, groupBy) {
    var groups;
    groups = _.chain(history).groupBy(function(h) {
      return moment(h.date).format(groupBy);
    }).sortBy(function(h, k) {
      return k;
    }).value();
    groups = groups.slice(-amount);
    groups.pop();
    return _.each(groups, function(group) {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, (function(m, obj) {
          return m + obj.value;
        }), 0) / group.length
      });
      return true;
    });
  };
  preen(50, "YYYY");
  preen(moment().format('MM'), "YYYYMM");
  thisMonth = moment().format('YYYYMM');
  newHistory = newHistory.concat(_.filter(history, function(h) {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));
  return newHistory;
};

/*
  Preen 3-day past-completed To-Dos from Angular & mobile app
 */

api.preenTodos = function(tasks) {
  return _.filter(tasks, function(t) {
    return !t.completed || (t.challenge && t.challenge.id) || moment(t.dateCompleted).isAfter(moment().subtract({
      days: 3
    }));
  });
};

/*
  Update the in-browser store with new gear. FIXME this was in user.fns, but it was causing strange issues there
 */

sortOrder = _.reduce(content.gearTypes, (function(m, v, k) {
  m[v] = k;
  return m;
}), {});

api.updateStore = function(user) {
  var changes;
  if (!user) {
    return;
  }
  changes = [];
  _.each(content.gearTypes, function(type) {
    var found;
    found = _.find(content.gear.tree[type][user.stats["class"]], function(item) {
      return !user.items.gear.owned[item.key];
    });
    if (found) {
      changes.push(found);
    }
    return true;
  });
  changes = changes.concat(_.filter(content.gear.flat, function(v) {
    var ref;
    return ((ref = v.klass) === 'special' || ref === 'mystery' || ref === 'armoire') && !user.items.gear.owned[v.key] && (typeof v.canOwn === "function" ? v.canOwn(user) : void 0);
  }));
  return _.sortBy(changes, function(c) {
    return sortOrder[c.type];
  });
};


/*
------------------------------------------------------
Content
------------------------------------------------------
 */

api.content = content;


/*
------------------------------------------------------
Misc Helpers
------------------------------------------------------
 */

api.uuid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r, v;
    r = Math.random() * 16 | 0;
    v = (c === "x" ? r : r & 0x3 | 0x8);
    return v.toString(16);
  });
};

api.countExists = function(items) {
  return _.reduce(items, (function(m, v) {
    return m + (v ? 1 : 0);
  }), 0);
};


/*
Even though Mongoose handles task defaults, we want to make sure defaults are set on the client-side before
sending up to the server for performance
 */

api.taskDefaults = function(task) {
  var defaults, ref, ref1, ref2;
  if (task == null) {
    task = {};
  }
  if (!(task.type && ((ref = task.type) === 'habit' || ref === 'daily' || ref === 'todo' || ref === 'reward'))) {
    task.type = 'habit';
  }
  defaults = {
    id: api.uuid(),
    text: task.id != null ? task.id : '',
    notes: '',
    priority: 1,
    challenge: {},
    attribute: 'str',
    dateCreated: new Date()
  };
  _.defaults(task, defaults);
  if (task.type === 'habit') {
    _.defaults(task, {
      up: true,
      down: true
    });
  }
  if ((ref1 = task.type) === 'habit' || ref1 === 'daily') {
    _.defaults(task, {
      history: []
    });
  }
  if ((ref2 = task.type) === 'daily' || ref2 === 'todo') {
    _.defaults(task, {
      completed: false
    });
  }
  if (task.type === 'daily') {
    _.defaults(task, {
      streak: 0,
      repeat: {
        su: true,
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true
      }
    }, {
      startDate: new Date(),
      everyX: 1,
      frequency: 'weekly'
    });
  }
  task._id = task.id;
  if (task.value == null) {
    task.value = task.type === 'reward' ? 10 : 0;
  }
  if (!_.isNumber(task.priority)) {
    task.priority = 1;
  }
  return task;
};

api.percent = function(x, y, dir) {
  var roundFn;
  switch (dir) {
    case "up":
      roundFn = Math.ceil;
      break;
    case "down":
      roundFn = Math.floor;
      break;
    default:
      roundFn = Math.round;
  }
  if (x === 0) {
    x = 1;
  }
  return Math.max(0, roundFn(x / y * 100));
};


/*
Remove whitespace #FIXME are we using this anywwhere? Should we be?
 */

api.removeWhitespace = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/\s/g, '');
};


/*
Encode the download link for .ics iCal file
 */

api.encodeiCalLink = function(uid, apiToken) {
  var loc, ref;
  loc = (typeof window !== "undefined" && window !== null ? window.location.host : void 0) || (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.BASE_URL : void 0 : void 0) || '';
  return encodeURIComponent("http://" + loc + "/v1/users/" + uid + "/calendar.ics?apiToken=" + apiToken);
};


/*
Gold amount from their money
 */

api.gold = function(num) {
  if (num) {
    return Math.floor(num);
  } else {
    return "0";
  }
};


/*
Silver amount from their money
 */

api.silver = function(num) {
  if (num) {
    return ("0" + Math.floor((num - Math.floor(num)) * 100)).slice(-2);
  } else {
    return "00";
  }
};


/*
Task classes given everything about the class
 */

api.taskClasses = function(task, filters, dayStart, lastCron, showCompleted, main) {
  var classes, completed, enabled, filter, priority, ref, repeat, type, value;
  if (filters == null) {
    filters = [];
  }
  if (dayStart == null) {
    dayStart = 0;
  }
  if (lastCron == null) {
    lastCron = +(new Date);
  }
  if (showCompleted == null) {
    showCompleted = false;
  }
  if (main == null) {
    main = false;
  }
  if (!task) {
    return;
  }
  type = task.type, completed = task.completed, value = task.value, repeat = task.repeat, priority = task.priority;
  if (main) {
    if (!task._editing) {
      for (filter in filters) {
        enabled = filters[filter];
        if (enabled && !((ref = task.tags) != null ? ref[filter] : void 0)) {
          return 'hidden';
        }
      }
    }
  }
  classes = type;
  if (task._editing) {
    classes += " beingEdited";
  }
  if (type === 'todo' || type === 'daily') {
    if (completed || (type === 'daily' && !shouldDo(+(new Date), task, {
      dayStart: dayStart
    }))) {
      classes += " completed";
    } else {
      classes += " uncompleted";
    }
  } else if (type === 'habit') {
    if (task.down && task.up) {
      classes += ' habit-wide';
    }
    if (!task.down && !task.up) {
      classes += ' habit-narrow';
    }
  }
  if (priority === 0.1) {
    classes += ' difficulty-trivial';
  } else if (priority === 1) {
    classes += ' difficulty-easy';
  } else if (priority === 1.5) {
    classes += ' difficulty-medium';
  } else if (priority === 2) {
    classes += ' difficulty-hard';
  }
  if (value < -20) {
    classes += ' color-worst';
  } else if (value < -10) {
    classes += ' color-worse';
  } else if (value < -1) {
    classes += ' color-bad';
  } else if (value < 1) {
    classes += ' color-neutral';
  } else if (value < 5) {
    classes += ' color-good';
  } else if (value < 10) {
    classes += ' color-better';
  } else {
    classes += ' color-best';
  }
  return classes;
};


/*
Friendly timestamp
 */

api.friendlyTimestamp = function(timestamp) {
  return moment(timestamp).format('MM/DD h:mm:ss a');
};


/*
Does user have new chat messages?
 */

api.newChatMessages = function(messages, lastMessageSeen) {
  if (!((messages != null ? messages.length : void 0) > 0)) {
    return false;
  }
  return (messages != null ? messages[0] : void 0) && (messages[0].id !== lastMessageSeen);
};


/*
are any tags active?
 */

api.noTags = function(tags) {
  return _.isEmpty(tags) || _.isEmpty(_.filter(tags, function(t) {
    return t;
  }));
};


/*
Are there tags applied?
 */

api.appliedTags = function(userTags, taskTags) {
  var arr;
  arr = [];
  _.each(userTags, function(t) {
    if (t == null) {
      return;
    }
    if (taskTags != null ? taskTags[t.id] : void 0) {
      return arr.push(t.name);
    }
  });
  return arr.join(', ');
};


/*
Various counting functions
 */

api.count = require('./count');


/*
------------------------------------------------------
User (prototype wrapper to give it ops, helper funcs, and virtuals
------------------------------------------------------
 */


/*
User is now wrapped (both on client and server), adding a few new properties:
  * getters (_statsComputed, tasks, etc)
  * user.fns, which is a bunch of helper functions
    These were originally up above, but they make more sense belonging to the user object so we don't have to pass
    the user object all over the place. In fact, we should pull in more functions such as cron(), updateStats(), etc.
  * user.ops, which is super important:

If a function is inside user.ops, it has magical properties. If you call it on the client it updates the user object in
the browser and when it's done it automatically POSTs to the server, calling src/controllers/user.js#OP_NAME (the exact same name
of the op function). The first argument req is {query, body, params}, it's what the express controller function
expects. This means we call our functions as if we were calling an Express route. Eg, instead of score(task, direction),
we call score({params:{id:task.id,direction:direction}}). This also forces us to think about our routes (whether to use
params, query, or body for variables). see http://stackoverflow.com/questions/4024271/rest-api-best-practices-where-to-put-parameters

If `src/controllers/user.js#OP_NAME` doesn't exist on the server, it's automatically added. It runs the code in user.ops.OP_NAME
to update the user model server-side, then performs `user.save()`. You can see this in action for `user.ops.buy`. That
function doesn't exist on the server - so the client calls it, it updates user in the browser, auto-POSTs to server, server
handles it by calling `user.ops.buy` again (to update user on the server), and then saves. We can do this for
everything that doesn't need any code difference from what's in user.ops.OP_NAME for special-handling server-side. If we
*do* need special handling, just add `src/controllers/user.js#OP_NAME` to override the user.ops.OP_NAME, and be
sure to call user.ops.OP_NAME at some point within the overridden function.

TODO
  * Is this the best way to wrap the user object? I thought of using user.prototype, but user is an object not a Function.
    user on the server is a Mongoose model, so we can use prototype - but to do it on the client, we'd probably have to
    move to $resource for user
  * Move to $resource!
 */

api.wrap = function(user, main) {
  if (main == null) {
    main = true;
  }
  if (user._wrapped) {
    return;
  }
  user._wrapped = true;
  if (main) {
    user.ops = {
      update: function(req, cb) {
        _.each(req.body, function(v, k) {
          user.fns.dotSet(k, v);
          return true;
        });
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      sleep: function(req, cb) {
        user.preferences.sleep = !user.preferences.sleep;
        return typeof cb === "function" ? cb(null, {}) : void 0;
      },
      revive: function(req, cb, analytics) {
        var analyticsData, base, cl, gearOwned, item, losableItems, lostItem, lostStat;
        if (!(user.stats.hp <= 0)) {
          return typeof cb === "function" ? cb({
            code: 400,
            message: "Cannot revive if not dead"
          }) : void 0;
        }
        _.merge(user.stats, {
          hp: 50,
          exp: 0,
          gp: 0
        });
        if (user.stats.lvl > 1) {
          user.stats.lvl--;
        }
        lostStat = user.fns.randomVal(_.reduce(['str', 'con', 'per', 'int'], (function(m, k) {
          if (user.stats[k]) {
            m[k] = k;
          }
          return m;
        }), {}));
        if (lostStat) {
          user.stats[lostStat]--;
        }
        cl = user.stats["class"];
        gearOwned = (typeof (base = user.items.gear.owned).toObject === "function" ? base.toObject() : void 0) || user.items.gear.owned;
        losableItems = {};
        _.each(gearOwned, function(v, k) {
          var itm;
          if (v) {
            itm = content.gear.flat['' + k];
            if (itm) {
              if ((itm.value > 0 || k === 'weapon_warrior_0') && (itm.klass === cl || (itm.klass === 'special' && (!itm.specialClass || itm.specialClass === cl)) || itm.klass === 'armoire')) {
                return losableItems['' + k] = '' + k;
              }
            }
          }
        });
        lostItem = user.fns.randomVal(losableItems);
        if (item = content.gear.flat[lostItem]) {
          user.items.gear.owned[lostItem] = false;
          if (user.items.gear.equipped[item.type] === lostItem) {
            user.items.gear.equipped[item.type] = item.type + "_base_0";
          }
          if (user.items.gear.costume[item.type] === lostItem) {
            user.items.gear.costume[item.type] = item.type + "_base_0";
          }
        }
        if (typeof user.markModified === "function") {
          user.markModified('items.gear');
        }
        analyticsData = {
          uuid: user._id,
          lostItem: lostItem,
          gaLabel: lostItem,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('Death', analyticsData);
        }
        return typeof cb === "function" ? cb((item ? {
          code: 200,
          message: i18n.t('messageLostItem', {
            itemText: item.text(req.language)
          }, req.language)
        } : null), user) : void 0;
      },
      reset: function(req, cb) {
        var gear;
        user.habits = [];
        user.dailys = [];
        user.todos = [];
        user.rewards = [];
        user.stats.hp = 50;
        user.stats.lvl = 1;
        user.stats.gp = 0;
        user.stats.exp = 0;
        gear = user.items.gear;
        _.each(['equipped', 'costume'], function(type) {
          gear[type].armor = 'armor_base_0';
          gear[type].weapon = 'weapon_base_0';
          gear[type].head = 'head_base_0';
          return gear[type].shield = 'shield_base_0';
        });
        if (typeof gear.owned === 'undefined') {
          gear.owned = {};
        }
        _.each(gear.owned, function(v, k) {
          if (gear.owned[k]) {
            gear.owned[k] = false;
          }
          return true;
        });
        gear.owned.weapon_warrior_0 = true;
        if (typeof user.markModified === "function") {
          user.markModified('items.gear.owned');
        }
        user.preferences.costume = false;
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      reroll: function(req, cb, analytics) {
        var analyticsData;
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        user.balance--;
        _.each(user.tasks, function(task) {
          if (task.type !== 'reward') {
            return task.value = 0;
          }
        });
        user.stats.hp = 50;
        analyticsData = {
          uuid: user._id,
          acquireMethod: 'Gems',
          gemCost: 4,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('Fortify Potion', analyticsData);
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      rebirth: function(req, cb, analytics) {
        var analyticsData, flags, gear, lvl, stats;
        if (user.balance < 2 && user.stats.lvl < api.maxLevel) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        analyticsData = {
          uuid: user._id,
          category: 'behavior'
        };
        if (user.stats.lvl < api.maxLevel) {
          user.balance -= 2;
          analyticsData.acquireMethod = 'Gems';
          analyticsData.gemCost = 8;
        } else {
          analyticsData.gemCost = 0;
          analyticsData.acquireMethod = '> 100';
        }
        if (analytics != null) {
          analytics.track('Rebirth', analyticsData);
        }
        lvl = api.capByLevel(user.stats.lvl);
        _.each(user.tasks, function(task) {
          if (task.type !== 'reward') {
            task.value = 0;
          }
          if (task.type === 'daily') {
            return task.streak = 0;
          }
        });
        stats = user.stats;
        stats.buffs = {};
        stats.hp = 50;
        stats.lvl = 1;
        stats["class"] = 'warrior';
        _.each(['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'], function(value) {
          return stats[value] = 0;
        });
        // TODO during refactoring: move all gear code from rebirth() to its own function and then call it in reset() as well
        gear = user.items.gear;
        _.each(['equipped', 'costume'], function(type) {
          gear[type] = {};
          gear[type].armor = 'armor_base_0';
          gear[type].weapon = 'weapon_warrior_0';
          gear[type].head = 'head_base_0';
          return gear[type].shield = 'shield_base_0';
        });
        if (user.items.currentPet) {
          user.ops.equip({
            params: {
              type: 'pet',
              key: user.items.currentPet
            }
          });
        }
        if (user.items.currentMount) {
          user.ops.equip({
            params: {
              type: 'mount',
              key: user.items.currentMount
            }
          });
        }
        _.each(gear.owned, function(v, k) {
          if (gear.owned[k] && content.gear.flat[k].value) {
            gear.owned[k] = false;
            return true;
          }
        });
        gear.owned.weapon_warrior_0 = true;
        if (typeof user.markModified === "function") {
          user.markModified('items.gear.owned');
        }
        user.preferences.costume = false;
        flags = user.flags;
        if (!user.achievements.beastMaster) {
          flags.rebirthEnabled = false;
        }
        flags.itemsEnabled = false;
        flags.dropsEnabled = false;
        flags.classSelected = false;
        flags.levelDrops = {};
        if (!user.achievements.rebirths) {
          user.achievements.rebirths = 1;
          user.achievements.rebirthLevel = lvl;
        } else if (lvl > user.achievements.rebirthLevel || lvl === 100) {
          user.achievements.rebirths++;
          user.achievements.rebirthLevel = lvl;
        }
        user.stats.buffs = {};
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      allocateNow: function(req, cb) {
        _.times(user.stats.points, user.fns.autoAllocate);
        user.stats.points = 0;
        if (typeof user.markModified === "function") {
          user.markModified('stats');
        }
        return typeof cb === "function" ? cb(null, user.stats) : void 0;
      },
      clearCompleted: function(req, cb) {
        _.remove(user.todos, function(t) {
          var ref;
          return t.completed && !((ref = t.challenge) != null ? ref.id : void 0);
        });
        if (typeof user.markModified === "function") {
          user.markModified('todos');
        }
        return typeof cb === "function" ? cb(null, user.todos) : void 0;
      },
      sortTask: function(req, cb) {
        var from, id, movedTask, preenedTasks, ref, task, tasks, to;
        id = req.params.id;
        ref = req.query, to = ref.to, from = ref.from;
        task = user.tasks[id];
        if (!task) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        if (!((to != null) && (from != null))) {
          return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
        }
        tasks = user[task.type + "s"];
        if (task.type === 'todo' && tasks[from] !== task) {
          preenedTasks = api.preenTodos(tasks);
          if (to !== -1) {
            to = tasks.indexOf(preenedTasks[to]);
          }
          from = tasks.indexOf(preenedTasks[from]);
        }
        if (tasks[from] !== task) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        movedTask = tasks.splice(from, 1)[0];
        if (to === -1) {
          tasks.push(movedTask);
        } else {
          tasks.splice(to, 0, movedTask);
        }
        return typeof cb === "function" ? cb(null, tasks) : void 0;
      },
      updateTask: function(req, cb) {
        var ref, task;
        if (!(task = user.tasks[(ref = req.params) != null ? ref.id : void 0])) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        _.merge(task, _.omit(req.body, ['checklist', 'id', 'type']));
        if (req.body.checklist) {
          task.checklist = req.body.checklist;
        }
        if (typeof task.markModified === "function") {
          task.markModified('tags');
        }
        return typeof cb === "function" ? cb(null, task) : void 0;
      },
      deleteTask: function(req, cb) {
        var i, ref, task;
        task = user.tasks[(ref = req.params) != null ? ref.id : void 0];
        if (!task) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTaskNotFound', req.language)
          }) : void 0;
        }
        i = user[task.type + "s"].indexOf(task);
        if (~i) {
          user[task.type + "s"].splice(i, 1);
        }
        return typeof cb === "function" ? cb(null, {}) : void 0;
      },
      addTask: function(req, cb) {
        var task;
        task = api.taskDefaults(req.body);
        if (user.tasks[task.id] != null) {
          return typeof cb === "function" ? cb({
            code: 409,
            message: i18n.t('messageDuplicateTaskID', req.language)
          }) : void 0;
        }
        user[task.type + "s"].unshift(task);
        if (user.preferences.newTaskEdit) {
          task._editing = true;
        }
        if (user.preferences.tagsCollapsed) {
          task._tags = true;
        }
        if (!user.preferences.advancedCollapsed) {
          task._advanced = true;
        }
        if (typeof cb === "function") {
          cb(null, task);
        }
        return task;
      },
      addTag: function(req, cb) {
        if (user.tags == null) {
          user.tags = [];
        }
        user.tags.push({
          name: req.body.name,
          id: req.body.id || api.uuid()
        });
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      sortTag: function(req, cb) {
        var from, ref, to;
        ref = req.query, to = ref.to, from = ref.from;
        if (!((to != null) && (from != null))) {
          return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
        }
        user.tags.splice(to, 0, user.tags.splice(from, 1)[0]);
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      getTags: function(req, cb) {
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      getTag: function(req, cb) {
        var i, tid;
        tid = req.params.id;
        i = _.findIndex(user.tags, {
          id: tid
        });
        if (!~i) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTagNotFound', req.language)
          }) : void 0;
        }
        return typeof cb === "function" ? cb(null, user.tags[i]) : void 0;
      },
      updateTag: function(req, cb) {
        var i, tid;
        tid = req.params.id;
        i = _.findIndex(user.tags, {
          id: tid
        });
        if (!~i) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTagNotFound', req.language)
          }) : void 0;
        }
        user.tags[i].name = req.body.name;
        return typeof cb === "function" ? cb(null, user.tags[i]) : void 0;
      },
      deleteTag: function(req, cb) {
        var i, tag, tid;
        tid = req.params.id;
        i = _.findIndex(user.tags, {
          id: tid
        });
        if (!~i) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageTagNotFound', req.language)
          }) : void 0;
        }
        tag = user.tags[i];
        delete user.filters[tag.id];
        user.tags.splice(i, 1);
        _.each(user.tasks, function(task) {
          return delete task.tags[tag.id];
        });
        _.each(['habits', 'dailys', 'todos', 'rewards'], function(type) {
          return typeof user.markModified === "function" ? user.markModified(type) : void 0;
        });
        return typeof cb === "function" ? cb(null, user.tags) : void 0;
      },
      addWebhook: function(req, cb) {
        var wh;
        wh = user.preferences.webhooks;
        api.refPush(wh, {
          url: req.body.url,
          enabled: req.body.enabled || true,
          id: req.body.id
        });
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      updateWebhook: function(req, cb) {
        _.merge(user.preferences.webhooks[req.params.id], req.body);
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      deleteWebhook: function(req, cb) {
        delete user.preferences.webhooks[req.params.id];
        if (typeof user.markModified === "function") {
          user.markModified('preferences.webhooks');
        }
        return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
      },
      addPushDevice: function(req, cb) {
        var i, item, pd;
        if (!user.pushDevices) {
          user.pushDevices = [];
        }
        pd = user.pushDevices;
        item = {
          regId: req.body.regId,
          type: req.body.type
        };
        i = _.findIndex(pd, {
          regId: item.regId
        });
        if (i === -1) {
          pd.push(item);
        }
        return typeof cb === "function" ? cb(null, user.pushDevices) : void 0;
      },
      clearPMs: function(req, cb) {
        user.inbox.messages = {};
        if (typeof user.markModified === "function") {
          user.markModified('inbox.messages');
        }
        return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
      },
      deletePM: function(req, cb) {
        delete user.inbox.messages[req.params.id];
        if (typeof user.markModified === "function") {
          user.markModified('inbox.messages.' + req.params.id);
        }
        return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
      },
      blockUser: function(req, cb) {
        var i;
        i = user.inbox.blocks.indexOf(req.params.uuid);
        if (~i) {
          user.inbox.blocks.splice(i, 1);
        } else {
          user.inbox.blocks.push(req.params.uuid);
        }
        if (typeof user.markModified === "function") {
          user.markModified('inbox.blocks');
        }
        return typeof cb === "function" ? cb(null, user.inbox.blocks) : void 0;
      },
      feed: function(req, cb) {
        var egg, eggText, evolve, food, message, pet, petDisplayName, potion, potionText, ref, ref1, ref2, userPets;
        ref = req.params, pet = ref.pet, food = ref.food;
        food = content.food[food];
        ref1 = pet.split('-'), egg = ref1[0], potion = ref1[1];
        userPets = user.items.pets;
        potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
        eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;
        petDisplayName = i18n.t('petName', {
          potion: potionText,
          egg: eggText
        });
        if (!userPets[pet]) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messagePetNotFound', req.language)
          }) : void 0;
        }
        if (!((ref2 = user.items.food) != null ? ref2[food.key] : void 0)) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: i18n.t('messageFoodNotFound', req.language)
          }) : void 0;
        }
        if (content.specialPets[pet]) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageCannotFeedPet', req.language)
          }) : void 0;
        }
        if (user.items.mounts[pet]) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageAlreadyMount', req.language)
          }) : void 0;
        }
        message = '';
        evolve = function() {
          userPets[pet] = -1;
          user.items.mounts[pet] = true;
          if (pet === user.items.currentPet) {
            user.items.currentPet = "";
          }
          return message = i18n.t('messageEvolve', {
            egg: petDisplayName
          }, req.language);
        };
        if (food.key === 'Saddle') {
          evolve();
        } else {
          if (food.target === potion || content.hatchingPotions[potion].premium) {
            userPets[pet] += 5;
            message = i18n.t('messageLikesFood', {
              egg: petDisplayName,
              foodText: food.text(req.language)
            }, req.language);
          } else {
            userPets[pet] += 2;
            message = i18n.t('messageDontEnjoyFood', {
              egg: petDisplayName,
              foodText: food.text(req.language)
            }, req.language);
          }
          if (userPets[pet] >= 50 && !user.items.mounts[pet]) {
            evolve();
          }
        }
        user.items.food[food.key]--;
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, {
          value: userPets[pet]
        }) : void 0;
      },
      buySpecialSpell: function(req, cb) {
        var base, item, key, message;
        key = req.params.key;
        item = content.special[key];
        if (user.stats.gp < item.value) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        user.stats.gp -= item.value;
        if ((base = user.items.special)[key] == null) {
          base[key] = 0;
        }
        user.items.special[key]++;
        if (typeof user.markModified === "function") {
          user.markModified('items.special');
        }
        message = i18n.t('messageBought', {
          itemText: item.text(req.language)
        }, req.language);
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, _.pick(user, $w('items stats'))) : void 0;
      },
      purchase: function(req, cb, analytics) {
        var analyticsData, convCap, convRate, item, key, price, ref, ref1, ref2, ref3, type;
        ref = req.params, type = ref.type, key = ref.key;
        if (type === 'gems' && key === 'gem') {
          ref1 = api.planGemLimits, convRate = ref1.convRate, convCap = ref1.convCap;
          convCap += user.purchased.plan.consecutive.gemCapExtra;
          if (!((ref2 = user.purchased) != null ? (ref3 = ref2.plan) != null ? ref3.customerId : void 0 : void 0)) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "Must subscribe to purchase gems with GP"
            }, req) : void 0;
          }
          if (!(user.stats.gp >= convRate)) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "Not enough Gold"
            }) : void 0;
          }
          if (user.purchased.plan.gemsBought >= convCap) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: "You've reached the Gold=>Gem conversion cap (" + convCap + ") for this month. We have this to prevent abuse / farming. The cap will reset within the first three days of next month."
            }) : void 0;
          }
          user.balance += .25;
          user.purchased.plan.gemsBought++;
          user.stats.gp -= convRate;
          analyticsData = {
            uuid: user._id,
            itemKey: key,
            acquireMethod: 'Gold',
            goldCost: convRate,
            category: 'behavior'
          };
          if (analytics != null) {
            analytics.track('purchase gems', analyticsData);
          }
          return typeof cb === "function" ? cb({
            code: 200,
            message: "+1 Gem"
          }, _.pick(user, $w('stats balance'))) : void 0;
        }
        if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food' && type !== 'quests' && type !== 'gear') {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":type must be in [eggs,hatchingPotions,food,quests,gear]"
          }, req) : void 0;
        }
        if (type === 'gear') {
          item = content.gear.flat[key];
          if (user.items.gear.owned[key]) {
            return typeof cb === "function" ? cb({
              code: 401,
              message: i18n.t('alreadyHave', req.language)
            }) : void 0;
          }
          price = (item.twoHanded || item.gearSet === 'animal' ? 2 : 1) / 4;
        } else {
          item = content[type][key];
          price = item.value / 4;
        }
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":key not found for Content." + type
          }, req) : void 0;
        }
        if (!item.canBuy(user)) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('messageNotAvailable', req.language)
          }) : void 0;
        }
        if ((user.balance < price) || !user.balance) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        user.balance -= price;
        if (type === 'gear') {
          user.items.gear.owned[key] = true;
        } else {
          if (!(user.items[type][key] > 0)) {
            user.items[type][key] = 0;
          }
          user.items[type][key]++;
        }
        analyticsData = {
          uuid: user._id,
          itemKey: key,
          itemType: 'Market',
          acquireMethod: 'Gems',
          gemCost: item.value,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('acquire item', analyticsData);
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('items balance'))) : void 0;
      },
      releasePets: function(req, cb, analytics) {
        var analyticsData, pet;
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          user.balance -= 1;
          for (pet in content.pets) {
            user.items.pets[pet] = 0;
          }
          if (!user.achievements.beastMasterCount) {
            user.achievements.beastMasterCount = 0;
          }
          user.achievements.beastMasterCount++;
          user.items.currentPet = "";
        }
        analyticsData = {
          uuid: user._id,
          acquireMethod: 'Gems',
          gemCost: 4,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('release pets', analyticsData);
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      releaseMounts: function(req, cb, analytics) {
        var analyticsData, mount;
        if (user.balance < 1) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          user.balance -= 1;
          user.items.currentMount = "";
          for (mount in content.pets) {
            user.items.mounts[mount] = null;
          }
          if (!user.achievements.mountMasterCount) {
            user.achievements.mountMasterCount = 0;
          }
          user.achievements.mountMasterCount++;
        }
        analyticsData = {
          uuid: user._id,
          acquireMethod: 'Gems',
          gemCost: 4,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('release mounts', analyticsData);
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      releaseBoth: function(req, cb) {
        var analyticsData, animal, giveTriadBingo;
        if (user.balance < 1.5 && !user.achievements.triadBingo) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        } else {
          giveTriadBingo = true;
          if (!user.achievements.triadBingo) {
            analyticsData = {
              uuid: user._id,
              acquireMethod: 'Gems',
              gemCost: 6,
              category: 'behavior'
            };
            if (typeof analytics !== "undefined" && analytics !== null) {
              analytics.track('release pets & mounts', analyticsData);
            }
            user.balance -= 1.5;
          }
          user.items.currentMount = "";
          user.items.currentPet = "";
          for (animal in content.pets) {
            if (user.items.pets[animal] === -1) {
              giveTriadBingo = false;
            }
            user.items.pets[animal] = 0;
            user.items.mounts[animal] = null;
          }
          if (!user.achievements.beastMasterCount) {
            user.achievements.beastMasterCount = 0;
          }
          user.achievements.beastMasterCount++;
          if (!user.achievements.mountMasterCount) {
            user.achievements.mountMasterCount = 0;
          }
          user.achievements.mountMasterCount++;
          if (giveTriadBingo) {
            if (!user.achievements.triadBingoCount) {
              user.achievements.triadBingoCount = 0;
            }
            user.achievements.triadBingoCount++;
          }
        }
        return typeof cb === "function" ? cb(null, user) : void 0;
      },
      buy: function(req, cb, analytics) {
        var analyticsData, armoireExp, armoireResp, armoireResult, base, buyResp, drop, eligibleEquipment, item, key, message, name;
        key = req.params.key;
        item = key === 'potion' ? content.potion : key === 'armoire' ? content.armoire : content.gear.flat[key];
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Item '" + key + " not found (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
          }) : void 0;
        }
        if (user.stats.gp < item.value) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        if ((item.canOwn != null) && !item.canOwn(user)) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: "You can't buy this item"
          }) : void 0;
        }
        armoireResp = void 0;
        if (item.key === 'potion') {
          user.stats.hp += 15;
          if (user.stats.hp > 50) {
            user.stats.hp = 50;
          }
        } else if (item.key === 'armoire') {
          armoireResult = user.fns.predictableRandom(user.stats.gp);
          eligibleEquipment = _.filter(content.gear.flat, (function(i) {
            return i.klass === 'armoire' && !user.items.gear.owned[i.key];
          }));
          if (!_.isEmpty(eligibleEquipment) && (armoireResult < .6 || !user.flags.armoireOpened)) {
            eligibleEquipment.sort();
            drop = user.fns.randomVal(eligibleEquipment);
            user.items.gear.owned[drop.key] = true;
            user.flags.armoireOpened = true;
            message = i18n.t('armoireEquipment', {
              image: '<span class="shop_' + drop.key + ' pull-left"></span>',
              dropText: drop.text(req.language)
            }, req.language);
            if (api.count.remainingGearInSet(user.items.gear.owned, 'armoire') === 0) {
              user.flags.armoireEmpty = true;
            }
            armoireResp = {
              type: "gear",
              dropKey: drop.key,
              dropText: drop.text(req.language)
            };
          } else if ((!_.isEmpty(eligibleEquipment) && armoireResult < .8) || armoireResult < .5) {
            drop = user.fns.randomVal(_.where(content.food, {
              canDrop: true
            }));
            if ((base = user.items.food)[name = drop.key] == null) {
              base[name] = 0;
            }
            user.items.food[drop.key] += 1;
            message = i18n.t('armoireFood', {
              image: '<span class="Pet_Food_' + drop.key + ' pull-left"></span>',
              dropArticle: drop.article,
              dropText: drop.text(req.language)
            }, req.language);
            armoireResp = {
              type: "food",
              dropKey: drop.key,
              dropArticle: drop.article,
              dropText: drop.text(req.language)
            };
          } else {
            armoireExp = Math.floor(user.fns.predictableRandom(user.stats.exp) * 40 + 10);
            user.stats.exp += armoireExp;
            message = i18n.t('armoireExp', req.language);
            armoireResp = {
              "type": "experience",
              "value": armoireExp
            };
          }
        } else {
          if (user.preferences.autoEquip) {
            user.items.gear.equipped[item.type] = item.key;
            message = user.fns.handleTwoHanded(item, null, req);
          }
          user.items.gear.owned[item.key] = true;
          if (message == null) {
            message = i18n.t('messageBought', {
              itemText: item.text(req.language)
            }, req.language);
          }
          if (item.last) {
            user.fns.ultimateGear();
          }
        }
        user.stats.gp -= item.value;
        analyticsData = {
          uuid: user._id,
          itemKey: key,
          acquireMethod: 'Gold',
          goldCost: item.value,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('acquire item', analyticsData);
        }
        buyResp = _.pick(user, $w('items achievements stats flags'));
        if (armoireResp) {
          buyResp["armoire"] = armoireResp;
        }
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, buyResp) : void 0;
      },
      buyQuest: function(req, cb, analytics) {
        var analyticsData, base, item, key, message, name;
        key = req.params.key;
        item = content.quests[key];
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Quest '" + key + " not found (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
          }) : void 0;
        }
        if (!(item.category === 'gold' && item.goldValue)) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Quest '" + key + " is not a Gold-purchasable quest (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
          }) : void 0;
        }
        if (user.stats.gp < item.goldValue) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        message = i18n.t('messageBought', {
          itemText: item.text(req.language)
        }, req.language);
        if ((base = user.items.quests)[name = item.key] == null) {
          base[name] = 0;
        }
        user.items.quests[item.key] += 1;
        user.stats.gp -= item.goldValue;
        analyticsData = {
          uuid: user._id,
          itemKey: item.key,
          itemType: 'Market',
          goldCost: item.goldValue,
          acquireMethod: 'Gold',
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('acquire item', analyticsData);
        }
        return typeof cb === "function" ? cb({
          code: 200,
          message: message
        }, user.items.quests) : void 0;
      },
      buyMysterySet: function(req, cb, analytics) {
        var mysterySet, ref;
        if (!(user.purchased.plan.consecutive.trinkets > 0)) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughHourglasses', req.language)
          }) : void 0;
        }
        mysterySet = (ref = content.timeTravelerStore(user.items.gear.owned)) != null ? ref[req.params.key] : void 0;
        if ((typeof window !== "undefined" && window !== null ? window.confirm : void 0) != null) {
          if (!window.confirm(i18n.t('hourglassBuyEquipSetConfirm'))) {
            return;
          }
        }
        if (!mysterySet) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: "Mystery set not found, or set already owned"
          }) : void 0;
        }
        _.each(mysterySet.items, function(i) {
          var analyticsData;
          user.items.gear.owned[i.key] = true;
          analyticsData = {
            uuid: user._id,
            itemKey: i.key,
            itemType: 'Subscriber Gear',
            acquireMethod: 'Hourglass',
            category: 'behavior'
          };
          return analytics != null ? analytics.track('acquire item', analyticsData) : void 0;
        });
        user.purchased.plan.consecutive.trinkets--;
        return typeof cb === "function" ? cb({
          code: 200,
          message: i18n.t('hourglassPurchaseSet', req.language)
        }, _.pick(user, $w('items purchased.plan.consecutive'))) : void 0;
      },
      hourglassPurchase: function(req, cb, analytics) {
        var analyticsData, key, ref, type;
        ref = req.params, type = ref.type, key = ref.key;
        if (!content.timeTravelStable[type]) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('typeNotAllowedHourglass', req.language) + JSON.stringify(_.keys(content.timeTravelStable))
          }) : void 0;
        }
        if (!_.contains(_.keys(content.timeTravelStable[type]), key)) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t(type + 'NotAllowedHourglass', req.language)
          }) : void 0;
        }
        if (user.items[type][key]) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t(type + 'AlreadyOwned', req.language)
          }) : void 0;
        }
        if (!(user.purchased.plan.consecutive.trinkets > 0)) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('notEnoughHourglasses', req.language)
          }) : void 0;
        }
        user.purchased.plan.consecutive.trinkets--;
        if (type === 'pets') {
          user.items.pets[key] = 5;
        }
        if (type === 'mounts') {
          user.items.mounts[key] = true;
        }
        analyticsData = {
          uuid: user._id,
          itemKey: key,
          itemType: type,
          acquireMethod: 'Hourglass',
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('acquire item', analyticsData);
        }
        return typeof cb === "function" ? cb({
          code: 200,
          message: i18n.t('hourglassPurchase', req.language)
        }, _.pick(user, $w('items purchased.plan.consecutive'))) : void 0;
      },
      sell: function(req, cb) {
        var key, ref, type;
        ref = req.params, key = ref.key, type = ref.type;
        if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food') {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":type not found. Must bes in [eggs, hatchingPotions, food]"
          }) : void 0;
        }
        if (!user.items[type][key]) {
          return typeof cb === "function" ? cb({
            code: 404,
            message: ":key not found for user.items." + type
          }) : void 0;
        }
        user.items[type][key]--;
        user.stats.gp += content[type][key].value;
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats items'))) : void 0;
      },
      equip: function(req, cb) {
        var item, key, message, ref, type;
        ref = [req.params.type || 'equipped', req.params.key], type = ref[0], key = ref[1];
        switch (type) {
          case 'mount':
            if (!user.items.mounts[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this mount."
              }) : void 0;
            }
            user.items.currentMount = user.items.currentMount === key ? '' : key;
            break;
          case 'pet':
            if (!user.items.pets[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this pet."
              }) : void 0;
            }
            user.items.currentPet = user.items.currentPet === key ? '' : key;
            break;
          case 'costume':
          case 'equipped':
            item = content.gear.flat[key];
            if (!user.items.gear.owned[key]) {
              return typeof cb === "function" ? cb({
                code: 404,
                message: ":You do not own this gear."
              }) : void 0;
            }
            if (user.items.gear[type][item.type] === key) {
              user.items.gear[type][item.type] = item.type + "_base_0";
              message = i18n.t('messageUnEquipped', {
                itemText: item.text(req.language)
              }, req.language);
            } else {
              user.items.gear[type][item.type] = item.key;
              message = user.fns.handleTwoHanded(item, type, req);
            }
            if (typeof user.markModified === "function") {
              user.markModified("items.gear." + type);
            }
        }
        return typeof cb === "function" ? cb((message ? {
          code: 200,
          message: message
        } : null), user.items) : void 0;
      },
      hatch: function(req, cb) {
        var egg, hatchingPotion, pet, ref;
        ref = req.params, egg = ref.egg, hatchingPotion = ref.hatchingPotion;
        if (!(egg && hatchingPotion)) {
          return typeof cb === "function" ? cb({
            code: 400,
            message: "Please specify query.egg & query.hatchingPotion"
          }) : void 0;
        }
        if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('messageMissingEggPotion', req.language)
          }) : void 0;
        }
        if (content.hatchingPotions[hatchingPotion].premium && !content.dropEggs[egg]) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('messageInvalidEggPotionCombo', req.language)
          }) : void 0;
        }
        pet = egg + "-" + hatchingPotion;
        if (user.items.pets[pet] && user.items.pets[pet] > 0) {
          return typeof cb === "function" ? cb({
            code: 403,
            message: i18n.t('messageAlreadyPet', req.language)
          }) : void 0;
        }
        user.items.pets[pet] = 5;
        user.items.eggs[egg]--;
        user.items.hatchingPotions[hatchingPotion]--;
        return typeof cb === "function" ? cb({
          code: 200,
          message: i18n.t('messageHatched', req.language)
        }, user.items) : void 0;
      },
      unlock: function(req, cb, analytics) {
        var alreadyOwns, analyticsData, cost, fullSet, k, path, split, v;
        path = req.query.path;
        fullSet = ~path.indexOf(",");
        cost = ~path.indexOf('background.') ? fullSet ? 3.75 : 1.75 : fullSet ? 1.25 : 0.5;
        alreadyOwns = !fullSet && user.fns.dotGet("purchased." + path) === true;
        if ((user.balance < cost || !user.balance) && !alreadyOwns) {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('notEnoughGems', req.language)
          }) : void 0;
        }
        if (fullSet) {
          _.each(path.split(","), function(p) {
            if (~path.indexOf('gear.')) {
              user.fns.dotSet("" + p, true);
              true;
            } else {

            }
            user.fns.dotSet("purchased." + p, true);
            return true;
          });
        } else {
          if (alreadyOwns) {
            split = path.split('.');
            v = split.pop();
            k = split.join('.');
            if (k === 'background' && v === user.preferences.background) {
              v = '';
            }
            user.fns.dotSet("preferences." + k, v);
            return typeof cb === "function" ? cb(null, req) : void 0;
          }
          user.fns.dotSet("purchased." + path, true);
        }
        user.balance -= cost;
        if (~path.indexOf('gear.')) {
          if (typeof user.markModified === "function") {
            user.markModified('gear.owned');
          }
        } else {
          if (typeof user.markModified === "function") {
            user.markModified('purchased');
          }
        }
        analyticsData = {
          uuid: user._id,
          itemKey: path,
          itemType: 'customization',
          acquireMethod: 'Gems',
          gemCost: cost / .25,
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('acquire item', analyticsData);
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('purchased preferences items'))) : void 0;
      },
      changeClass: function(req, cb, analytics) {
        var analyticsData, klass, ref;
        klass = (ref = req.query) != null ? ref["class"] : void 0;
        if (klass === 'warrior' || klass === 'rogue' || klass === 'wizard' || klass === 'healer') {
          analyticsData = {
            uuid: user._id,
            "class": klass,
            acquireMethod: 'Gems',
            gemCost: 3,
            category: 'behavior'
          };
          if (analytics != null) {
            analytics.track('change class', analyticsData);
          }
          user.stats["class"] = klass;
          user.flags.classSelected = true;
          _.each(["weapon", "armor", "shield", "head"], function(type) {
            var foundKey;
            foundKey = false;
            _.findLast(user.items.gear.owned, function(v, k) {
              if (~k.indexOf(type + "_" + klass) && v === true) {
                return foundKey = k;
              }
            });
            user.items.gear.equipped[type] = foundKey ? foundKey : type === "weapon" ? "weapon_" + klass + "_0" : type === "shield" && klass === "rogue" ? "shield_rogue_0" : type + "_base_0";
            if (type === "weapon" || (type === "shield" && klass === "rogue")) {
              user.items.gear.owned[type + "_" + klass + "_0"] = true;
            }
            return true;
          });
        } else {
          if (user.preferences.disableClasses) {
            user.preferences.disableClasses = false;
            user.preferences.autoAllocate = false;
          } else {
            if (!(user.balance >= .75)) {
              return typeof cb === "function" ? cb({
                code: 401,
                message: i18n.t('notEnoughGems', req.language)
              }) : void 0;
            }
            user.balance -= .75;
          }
          _.merge(user.stats, {
            str: 0,
            con: 0,
            per: 0,
            int: 0,
            points: api.capByLevel(user.stats.lvl)
          });
          user.flags.classSelected = false;
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats flags items preferences'))) : void 0;
      },
      disableClasses: function(req, cb) {
        user.stats["class"] = 'warrior';
        user.flags.classSelected = true;
        user.preferences.disableClasses = true;
        user.preferences.autoAllocate = true;
        user.stats.str = api.capByLevel(user.stats.lvl);
        user.stats.points = 0;
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats flags preferences'))) : void 0;
      },
      allocate: function(req, cb) {
        var stat;
        stat = req.query.stat || 'str';
        if (user.stats.points > 0) {
          user.stats[stat]++;
          user.stats.points--;
          if (stat === 'int') {
            user.stats.mp++;
          }
        }
        return typeof cb === "function" ? cb(null, _.pick(user, $w('stats'))) : void 0;
      },
      readCard: function(req, cb) {
        var cardType;
        cardType = req.params.cardType;
        user.items.special[cardType + "Received"].shift();
        if (typeof user.markModified === "function") {
          user.markModified("items.special." + cardType + "Received");
        }
        user.flags.cardReceived = false;
        return typeof cb === "function" ? cb(null, 'items.special flags.cardReceived') : void 0;
      },
      openMysteryItem: function(req, cb, analytics) {
        var analyticsData, item, ref, ref1;
        item = (ref = user.purchased.plan) != null ? (ref1 = ref.mysteryItems) != null ? ref1.shift() : void 0 : void 0;
        if (!item) {
          return typeof cb === "function" ? cb({
            code: 400,
            message: "Empty"
          }) : void 0;
        }
        item = content.gear.flat[item];
        user.items.gear.owned[item.key] = true;
        if (typeof user.markModified === "function") {
          user.markModified('purchased.plan.mysteryItems');
        }
        item.notificationType = 'Mystery';
        analyticsData = {
          uuid: user._id,
          itemKey: item,
          itemType: 'Subscriber Gear',
          acquireMethod: 'Subscriber',
          category: 'behavior'
        };
        if (analytics != null) {
          analytics.track('open mystery item', analyticsData);
        }
        if (typeof window !== 'undefined') {
          (user._tmp != null ? user._tmp : user._tmp = {}).drop = item;
        }
        return typeof cb === "function" ? cb(null, user.items.gear.owned) : void 0;
      },
      score: function(req, cb) {
        var addPoints, calculateDelta, calculateReverseDelta, changeTaskValue, delta, direction, gainMP, id, multiplier, num, options, ref, stats, subtractPoints, task, th;
        ref = req.params, id = ref.id, direction = ref.direction;
        task = user.tasks[id];
        options = req.query || {};
        _.defaults(options, {
          times: 1,
          cron: false
        });
        user._tmp = {};
        stats = {
          gp: +user.stats.gp,
          hp: +user.stats.hp,
          exp: +user.stats.exp
        };
        task.value = +task.value;
        task.streak = ~~task.streak;
        if (task.priority == null) {
          task.priority = 1;
        }
        if (task.value > stats.gp && task.type === 'reward') {
          return typeof cb === "function" ? cb({
            code: 401,
            message: i18n.t('messageNotEnoughGold', req.language)
          }) : void 0;
        }
        delta = 0;
        calculateDelta = function() {
          var currVal, nextDelta, ref1;
          currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
          nextDelta = Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
          if (((ref1 = task.checklist) != null ? ref1.length : void 0) > 0) {
            if (direction === 'down' && task.type === 'daily' && options.cron) {
              nextDelta *= 1 - _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0) / task.checklist.length;
            }
            if (task.type === 'todo') {
              nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0);
            }
          }
          return nextDelta;
        };
        calculateReverseDelta = function() {
          var calc, closeEnough, currVal, diff, nextDelta, ref1, testVal;
          currVal = task.value < -47.27 ? -47.27 : task.value > 21.27 ? 21.27 : task.value;
          testVal = currVal + Math.pow(0.9747, currVal) * (direction === 'down' ? -1 : 1);
          closeEnough = 0.00001;
          while (true) {
            calc = testVal + Math.pow(0.9747, testVal);
            diff = currVal - calc;
            if (Math.abs(diff) < closeEnough) {
              break;
            }
            if (diff > 0) {
              testVal -= diff;
            } else {
              testVal += diff;
            }
          }
          nextDelta = testVal - currVal;
          if (((ref1 = task.checklist) != null ? ref1.length : void 0) > 0) {
            if (task.type === 'todo') {
              nextDelta *= 1 + _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0);
            }
          }
          return nextDelta;
        };
        changeTaskValue = function() {
          return _.times(options.times, function() {
            var nextDelta, ref1;
            nextDelta = !options.cron && direction === 'down' ? calculateReverseDelta() : calculateDelta();
            if (task.type !== 'reward') {
              if (user.preferences.automaticAllocation === true && user.preferences.allocationMode === 'taskbased' && !(task.type === 'todo' && direction === 'down')) {
                user.stats.training[task.attribute] += nextDelta;
              }
              if (direction === 'up') {
                user.party.quest.progress.up = user.party.quest.progress.up || 0;
                if ((ref1 = task.type) === 'daily' || ref1 === 'todo') {
                  user.party.quest.progress.up += nextDelta * (1 + (user._statsComputed.str / 200));
                }
                if (task.type === 'habit') {
                  user.party.quest.progress.up += nextDelta * (0.5 + (user._statsComputed.str / 400));
                }
              }
              task.value += nextDelta;
            }
            return delta += nextDelta;
          });
        };
        addPoints = function() {
          var _crit, afterStreak, currStreak, gpMod, intBonus, perBonus, streakBonus;
          _crit = (delta > 0 ? user.fns.crit() : 1);
          if (_crit > 1) {
            user._tmp.crit = _crit;
          }
          intBonus = 1 + (user._statsComputed.int * .025);
          stats.exp += Math.round(delta * intBonus * task.priority * _crit * 6);
          perBonus = 1 + user._statsComputed.per * .02;
          gpMod = delta * task.priority * _crit * perBonus;
          return stats.gp += task.streak ? (currStreak = direction === 'down' ? task.streak - 1 : task.streak, streakBonus = currStreak / 100 + 1, afterStreak = gpMod * streakBonus, currStreak > 0 ? gpMod > 0 ? user._tmp.streakBonus = afterStreak - gpMod : void 0 : void 0, afterStreak) : gpMod;
        };
        subtractPoints = function() {
          var conBonus, hpMod;
          conBonus = 1 - (user._statsComputed.con / 250);
          if (conBonus < .1) {
            conBonus = 0.1;
          }
          hpMod = delta * conBonus * task.priority * 2;
          return stats.hp += Math.round(hpMod * 10) / 10;
        };
        gainMP = function(delta) {
          delta *= user._tmp.crit || 1;
          user.stats.mp += delta;
          if (user.stats.mp >= user._statsComputed.maxMP) {
            user.stats.mp = user._statsComputed.maxMP;
          }
          if (user.stats.mp < 0) {
            return user.stats.mp = 0;
          }
        };
        switch (task.type) {
          case 'habit':
            changeTaskValue();
            if (delta > 0) {
              addPoints();
            } else {
              subtractPoints();
            }
            gainMP(_.max([0.25, .0025 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
            th = (task.history != null ? task.history : task.history = []);
            if (th[th.length - 1] && moment(th[th.length - 1].date).isSame(new Date, 'day')) {
              th[th.length - 1].value = task.value;
            } else {
              th.push({
                date: +(new Date),
                value: task.value
              });
            }
            if (typeof user.markModified === "function") {
              user.markModified("habits." + (_.findIndex(user.habits, {
                id: task.id
              })) + ".history");
            }
            break;
          case 'daily':
            if (options.cron) {
              changeTaskValue();
              subtractPoints();
              if (!user.stats.buffs.streaks) {
                task.streak = 0;
              }
            } else {
              changeTaskValue();
              if (direction === 'down') {
                delta = calculateDelta();
              }
              addPoints();
              gainMP(_.max([1, .01 * user._statsComputed.maxMP]) * (direction === 'down' ? -1 : 1));
              if (direction === 'up') {
                task.streak = task.streak ? task.streak + 1 : 1;
                if ((task.streak % 21) === 0) {
                  user.achievements.streak = user.achievements.streak ? user.achievements.streak + 1 : 1;
                }
              } else {
                if ((task.streak % 21) === 0) {
                  user.achievements.streak = user.achievements.streak ? user.achievements.streak - 1 : 0;
                }
                task.streak = task.streak ? task.streak - 1 : 0;
              }
            }
            break;
          case 'todo':
            if (options.cron) {
              changeTaskValue();
            } else {
              task.dateCompleted = direction === 'up' ? new Date : void 0;
              changeTaskValue();
              if (direction === 'down') {
                delta = calculateDelta();
              }
              addPoints();
              multiplier = _.max([
                _.reduce(task.checklist, (function(m, i) {
                  return m + (i.completed ? 1 : 0);
                }), 1), 1
              ]);
              gainMP(_.max([multiplier, .01 * user._statsComputed.maxMP * multiplier]) * (direction === 'down' ? -1 : 1));
            }
            break;
          case 'reward':
            changeTaskValue();
            stats.gp -= Math.abs(task.value);
            num = parseFloat(task.value).toFixed(2);
            if (stats.gp < 0) {
              stats.hp += stats.gp;
              stats.gp = 0;
            }
        }
        user.fns.updateStats(stats, req);
        if (typeof window === 'undefined') {
          if (direction === 'up') {
            user.fns.randomDrop({
              task: task,
              delta: delta
            }, req);
          }
        }
        if (typeof cb === "function") {
          cb(null, user);
        }
        return delta;
      }
    };
  }
  user.fns = {
    getItem: function(type) {
      var item;
      item = content.gear.flat[user.items.gear.equipped[type]];
      if (!item) {
        return content.gear.flat[type + "_base_0"];
      }
      return item;
    },
    handleTwoHanded: function(item, type, req) {
      var message, currentWeapon, currentShield;
      if (type == null) {
        type = 'equipped';
      }
      currentShield = content.gear.flat[user.items.gear[type].shield];
      currentWeapon = content.gear.flat[user.items.gear[type].weapon];

      if (item.type === "shield" && (currentWeapon ? currentWeapon.twoHanded : false)) {
        user.items.gear[type].weapon = 'weapon_base_0';
        message = i18n.t('messageTwoHandedUnequip', {
          twoHandedText: currentWeapon.text(req.language), offHandedText: item.text(req.language),
        }, req.language);
      } else if (item.twoHanded && (currentShield && user.items.gear[type].shield != "shield_base_0")) {
        user.items.gear[type].shield = "shield_base_0";
        message = i18n.t('messageTwoHandedEquip', {
          twoHandedText: item.text(req.language), offHandedText: currentShield.text(req.language),
        }, req.language);
      }
      return message;
    },

    /*
    Because the same op needs to be performed on the client and the server (critical hits, item drops, etc),
    we need things to be "random", but technically predictable so that they don't go out-of-sync
     */
    predictableRandom: function(seed) {
      var x;
      if (!seed || seed === Math.PI) {
        seed = _.reduce(user.stats, (function(m, v) {
          if (_.isNumber(v)) {
            return m + v;
          } else {
            return m;
          }
        }), 0);
      }
      x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    },
    crit: function(stat, chance) {
      var s;
      if (stat == null) {
        stat = 'str';
      }
      if (chance == null) {
        chance = .03;
      }
      s = user._statsComputed[stat];
      if (user.fns.predictableRandom() <= chance * (1 + s / 100)) {
        return 1.5 + 4 * s / (s + 200);
      } else {
        return 1;
      }
    },

    /*
      Get a random property from an object
      returns random property (the value)
     */
    randomVal: function(obj, options) {
      var array, rand;
      array = (options != null ? options.key : void 0) ? _.keys(obj) : _.values(obj);
      rand = user.fns.predictableRandom(options != null ? options.seed : void 0);
      array.sort();
      return array[Math.floor(rand * array.length)];
    },

    /*
    This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
    user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
    so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
    Angular sets object properties directly - in which case, this function will be used.
     */
    dotSet: function(path, val) {
      return api.dotSet(user, path, val);
    },
    dotGet: function(path) {
      return api.dotGet(user, path);
    },
    randomDrop: function(modifiers, req) {
      var acceptableDrops, base, base1, base2, chance, drop, dropK, dropMultiplier, name, name1, name2, quest, rarity, ref, ref1, ref2, ref3, task;
      task = modifiers.task;
      chance = _.min([Math.abs(task.value - 21.27), 37.5]) / 150 + .02;
      chance *= task.priority * (1 + (task.streak / 100 || 0)) * (1 + (user._statsComputed.per / 100)) * (1 + (user.contributor.level / 40 || 0)) * (1 + (user.achievements.rebirths / 20 || 0)) * (1 + (user.achievements.streak / 200 || 0)) * (user._tmp.crit || 1) * (1 + .5 * (_.reduce(task.checklist, (function(m, i) {
        return m + (i.completed ? 1 : 0);
      }), 0) || 0));
      chance = api.diminishingReturns(chance, 0.75);
      quest = content.quests[(ref = user.party.quest) != null ? ref.key : void 0];
      if ((quest != null ? quest.collect : void 0) && user.fns.predictableRandom(user.stats.gp) < chance) {
        dropK = user.fns.randomVal(quest.collect, {
          key: true
        });
        user.party.quest.progress.collect[dropK]++;
        if (typeof user.markModified === "function") {
          user.markModified('party.quest.progress');
        }
      }
      dropMultiplier = ((ref1 = user.purchased) != null ? (ref2 = ref1.plan) != null ? ref2.customerId : void 0 : void 0) ? 2 : 1;
      if ((daysSince(user.items.lastDrop.date, user.preferences) === 0) && (user.items.lastDrop.count >= dropMultiplier * (5 + Math.floor(user._statsComputed.per / 25) + (user.contributor.level || 0)))) {
        return;
      }
      if (((ref3 = user.flags) != null ? ref3.dropsEnabled : void 0) && user.fns.predictableRandom(user.stats.exp) < chance) {
        rarity = user.fns.predictableRandom(user.stats.gp);
        if (rarity > .6) {
          drop = user.fns.randomVal(_.where(content.food, {
            canDrop: true
          }));
          if ((base = user.items.food)[name = drop.key] == null) {
            base[name] = 0;
          }
          user.items.food[drop.key] += 1;
          drop.type = 'Food';
          drop.dialog = i18n.t('messageDropFood', {
            dropArticle: drop.article,
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        } else if (rarity > .3) {
          drop = user.fns.randomVal(content.dropEggs);
          if ((base1 = user.items.eggs)[name1 = drop.key] == null) {
            base1[name1] = 0;
          }
          user.items.eggs[drop.key]++;
          drop.type = 'Egg';
          drop.dialog = i18n.t('messageDropEgg', {
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        } else {
          acceptableDrops = rarity < .02 ? ['Golden'] : rarity < .09 ? ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'] : rarity < .18 ? ['Red', 'Shade', 'Skeleton'] : ['Base', 'White', 'Desert'];
          drop = user.fns.randomVal(_.pick(content.hatchingPotions, (function(v, k) {
            return indexOf.call(acceptableDrops, k) >= 0;
          })));
          if ((base2 = user.items.hatchingPotions)[name2 = drop.key] == null) {
            base2[name2] = 0;
          }
          user.items.hatchingPotions[drop.key]++;
          drop.type = 'HatchingPotion';
          drop.dialog = i18n.t('messageDropPotion', {
            dropText: drop.text(req.language),
            dropNotes: drop.notes(req.language)
          }, req.language);
        }
        user._tmp.drop = drop;
        user.items.lastDrop.date = +(new Date);
        return user.items.lastDrop.count++;
      }
    },

    /*
      Updates user stats with new stats. Handles death, leveling up, etc
      {stats} new stats
      {update} if aggregated changes, pass in userObj as update. otherwise commits will be made immediately
     */
    autoAllocate: function() {
      return user.stats[(function() {
        var diff, ideal, lvlDiv7, preference, stats, suggested;
        switch (user.preferences.allocationMode) {
          case "flat":
            stats = _.pick(user.stats, $w('con str per int'));
            return _.invert(stats)[_.min(stats)];
          case "classbased":
            lvlDiv7 = user.stats.lvl / 7;
            ideal = [lvlDiv7 * 3, lvlDiv7 * 2, lvlDiv7, lvlDiv7];
            preference = (function() {
              switch (user.stats["class"]) {
                case "wizard":
                  return ["int", "per", "con", "str"];
                case "rogue":
                  return ["per", "str", "int", "con"];
                case "healer":
                  return ["con", "int", "str", "per"];
                default:
                  return ["str", "con", "per", "int"];
              }
            })();
            diff = [user.stats[preference[0]] - ideal[0], user.stats[preference[1]] - ideal[1], user.stats[preference[2]] - ideal[2], user.stats[preference[3]] - ideal[3]];
            suggested = _.findIndex(diff, (function(val) {
              if (val === _.min(diff)) {
                return true;
              }
            }));
            if (~suggested) {
              return preference[suggested];
            } else {
              return "str";
            }
          case "taskbased":
            suggested = _.invert(user.stats.training)[_.max(user.stats.training)];
            _.merge(user.stats.training, {
              str: 0,
              int: 0,
              con: 0,
              per: 0
            });
            return suggested || "str";
          default:
            return "str";
        }
      })()]++;
    },
    updateStats (stats, req, analytics) {
      let allocatedStatPoints;
      let totalStatPoints;
      let experienceToNextLevel;

      if (stats.hp <= 0) {
        user.stats.hp = 0;
        return user.stats.hp;
      }

      user.stats.hp = stats.hp;
      user.stats.gp = stats.gp >= 0 ? stats.gp : 0;

      experienceToNextLevel = api.tnl(user.stats.lvl);

      if (stats.exp >= experienceToNextLevel) {
        user.stats.exp = stats.exp;

        while (stats.exp >= experienceToNextLevel) {
          stats.exp -= experienceToNextLevel;
          user.stats.lvl++;

          experienceToNextLevel = api.tnl(user.stats.lvl);
          user.stats.hp = MAX_HEALTH;
          allocatedStatPoints = user.stats.str + user.stats.int + user.stats.con + user.stats.per;
          totalStatPoints = allocatedStatPoints + user.stats.points;

          if (totalStatPoints >= MAX_STAT_POINTS) {
            continue; // eslint-disable-line no-continue
          }
          if (user.preferences.automaticAllocation) {
            user.fns.autoAllocate();
          } else {
            user.stats.points = user.stats.lvl - allocatedStatPoints;
            totalStatPoints = user.stats.points + allocatedStatPoints;

            if (totalStatPoints > MAX_STAT_POINTS) {
              user.stats.points = MAX_STAT_POINTS - allocatedStatPoints;
            }

            if (user.stats.points < 0) {
              user.stats.points = 0;
            }
          }
        }
      }

      user.stats.exp = stats.exp;
      user.flags = user.flags || {};

      if (!user.flags.customizationsNotification && (user.stats.exp > 5 || user.stats.lvl > 1)) {
        user.flags.customizationsNotification = true;
      }
      if (!user.flags.itemsEnabled && (user.stats.exp > 10 || user.stats.lvl > 1)) {
        user.flags.itemsEnabled = true;
      }
      if (!user.flags.dropsEnabled && user.stats.lvl >= 3) {
        user.flags.dropsEnabled = true;
        if (user.items.eggs["Wolf"] > 0) {
          user.items.eggs["Wolf"]++;
        } else {
          user.items.eggs["Wolf"] = 1;
        }
      }
      if (!user.flags.classSelected && user.stats.lvl >= 10) {
        user.flags.classSelected;
      }
      _.each({
        vice1: 30,
        atom1: 15,
        moonstone1: 60,
        goldenknight1: 40
      }, function(lvl, k) {
        var analyticsData, base, base1, ref;
        if (!((ref = user.flags.levelDrops) != null ? ref[k] : void 0) && user.stats.lvl >= lvl) {
          if ((base = user.items.quests)[k] == null) {
            base[k] = 0;
          }
          user.items.quests[k]++;
          ((base1 = user.flags).levelDrops != null ? base1.levelDrops : base1.levelDrops = {})[k] = true;
          if (typeof user.markModified === "function") {
            user.markModified('flags.levelDrops');
          }
          analyticsData = {
            uuid: user._id,
            itemKey: k,
            acquireMethod: 'Level Drop',
            category: 'behavior'
          };
          if (analytics != null) {
            analytics.track('acquire item', analyticsData);
          }
          if (!user._tmp) user._tmp = {}
          return user._tmp.drop = {
            type: 'Quest',
            key: k
          };
        }
      });
      if (!user.flags.rebirthEnabled && (user.stats.lvl >= 50 || user.achievements.beastMaster)) {
        return user.flags.rebirthEnabled = true;
      }
    },

    /*
      ------------------------------------------------------
      Cron
      ------------------------------------------------------
     */

    /*
      At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
      For incomplete Dailys, deduct experience
      Make sure to run this function once in a while as server will not take care of overnight calculations.
      And you have to run it every time client connects.
      {user}
     */
    cron: function(options) {
      var _progress, analyticsData, base, base1, base2, base3, base4, clearBuffs, dailyChecked, dailyDueUnchecked, daysMissed, expTally, lvl, lvlDiv2, multiDaysCountAsOneDay, now, perfect, plan, progress, ref, ref1, ref2, ref3, todoTally;
      if (options == null) {
        options = {};
      }
      now = +options.now || +(new Date);
      daysMissed = daysSince(user.lastCron, _.defaults({
        now: now
      }, user.preferences));
      if (!(daysMissed > 0)) {
        return;
      }
      user.auth.timestamps.loggedin = new Date();
      user.lastCron = now;
      if (user.items.lastDrop.count > 0) {
        user.items.lastDrop.count = 0;
      }
      perfect = true;
      clearBuffs = {
        str: 0,
        int: 0,
        per: 0,
        con: 0,
        stealth: 0,
        streaks: false
      };
      plan = (ref = user.purchased) != null ? ref.plan : void 0;
      if (plan != null ? plan.customerId : void 0) {
        if (typeof plan.dateUpdated === "undefined") {
          // partial compensation for bug in subscription creation - https://github.com/HabitRPG/habitrpg/issues/6682
          plan.dateUpdated = new Date();
        }
        if (moment(plan.dateUpdated).format('MMYYYY') !== moment().format('MMYYYY')) {
          plan.gemsBought = 0;
          plan.dateUpdated = new Date();
          _.defaults(plan.consecutive, {
            count: 0,
            offset: 0,
            trinkets: 0,
            gemCapExtra: 0
          });
          plan.consecutive.count++;
          if (plan.consecutive.offset > 0) {
            plan.consecutive.offset--;
          } else if (plan.consecutive.count % 3 === 0) {
            plan.consecutive.trinkets++;
            plan.consecutive.gemCapExtra += 5;
            if (plan.consecutive.gemCapExtra > 25) {
              plan.consecutive.gemCapExtra = 25;
            }
          }
        }
        if (plan.dateTerminated && moment(plan.dateTerminated).isBefore(+(new Date))) {
          _.merge(plan, {
            planId: null,
            customerId: null,
            paymentMethod: null
          });
          _.merge(plan.consecutive, {
            count: 0,
            offset: 0,
            gemCapExtra: 0
          });
          if (typeof user.markModified === "function") {
            user.markModified('purchased.plan');
          }
        }
      }
      if (user.preferences.sleep === true) {
        user.stats.buffs = clearBuffs;
        user.dailys.forEach(function(daily) {
          var completed, repeat, thatDay;
          completed = daily.completed, repeat = daily.repeat;
          thatDay = moment(now).subtract({
            days: 1
          });
          if (shouldDo(thatDay.toDate(), daily, user.preferences) || completed) {
            _.each(daily.checklist, (function(box) {
              box.completed = false;
              return true;
            }));
          }
          return daily.completed = false;
        });
        return;
      }
      multiDaysCountAsOneDay = true;
      todoTally = 0;
      user.todos.forEach(function(task) {
        var absVal, completed, delta, id;
        if (!task) {
          return;
        }
        id = task.id, completed = task.completed;
        delta = user.ops.score({
          params: {
            id: task.id,
            direction: 'down'
          },
          query: {
            times: multiDaysCountAsOneDay != null ? multiDaysCountAsOneDay : {
              1: daysMissed
            },
            cron: true
          }
        });
        absVal = completed ? Math.abs(task.value) : task.value;
        return todoTally += absVal;
      });
      dailyChecked = 0;
      dailyDueUnchecked = 0;
      if ((base = user.party.quest.progress).down == null) {
        base.down = 0;
      }
      user.dailys.forEach(function(task) {
        var EvadeTask, completed, delta, fractionChecked, id, j, n, ref1, ref2, scheduleMisses, thatDay;
        if (!task) {
          return;
        }
        id = task.id, completed = task.completed;
        EvadeTask = 0;
        scheduleMisses = daysMissed;
        if (completed) {
          dailyChecked += 1;
        } else {
          scheduleMisses = 0;
          for (n = j = 0, ref1 = daysMissed; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
            thatDay = moment(now).subtract({
              days: n + 1
            });
            if (shouldDo(thatDay.toDate(), task, user.preferences)) {
              scheduleMisses++;
              if (user.stats.buffs.stealth) {
                user.stats.buffs.stealth--;
                EvadeTask++;
              }
              if (multiDaysCountAsOneDay) {
                break;
              }
            }
          }
          if (scheduleMisses > EvadeTask) {
            perfect = false;
            if (((ref2 = task.checklist) != null ? ref2.length : void 0) > 0) {
              fractionChecked = _.reduce(task.checklist, (function(m, i) {
                return m + (i.completed ? 1 : 0);
              }), 0) / task.checklist.length;
              dailyDueUnchecked += 1 - fractionChecked;
              dailyChecked += fractionChecked;
            } else {
              dailyDueUnchecked += 1;
            }
            delta = user.ops.score({
              params: {
                id: task.id,
                direction: 'down'
              },
              query: {
                times: multiDaysCountAsOneDay != null ? multiDaysCountAsOneDay : {
                  1: scheduleMisses - EvadeTask
                },
                cron: true
              }
            });
            user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
          }
        }
        (task.history != null ? task.history : task.history = []).push({
          date: +(new Date),
          value: task.value
        });
        task.completed = false;
        if (completed || (scheduleMisses > 0)) {
          return _.each(task.checklist, (function(i) {
            i.completed = false;
            return true;
          }));
        }
      });
      user.habits.forEach(function(task) {
        if (task.up === false || task.down === false) {
          if (Math.abs(task.value) < 0.1) {
            return task.value = 0;
          } else {
            return task.value = task.value / 2;
          }
        }
      });
      ((base1 = (user.history != null ? user.history : user.history = {})).todos != null ? base1.todos : base1.todos = []).push({
        date: now,
        value: todoTally
      });
      expTally = user.stats.exp;
      lvl = 0;
      while (lvl < (user.stats.lvl - 1)) {
        lvl++;
        expTally += api.tnl(lvl);
      }
      ((base2 = user.history).exp != null ? base2.exp : base2.exp = []).push({
        date: now,
        value: expTally
      });
      if (!((ref1 = user.purchased) != null ? (ref2 = ref1.plan) != null ? ref2.customerId : void 0 : void 0)) {
        user.fns.preenUserHistory();
        if (typeof user.markModified === "function") {
          user.markModified('history');
        }
        if (typeof user.markModified === "function") {
          user.markModified('dailys');
        }
      }
      user.stats.buffs = perfect ? ((base3 = user.achievements).perfect != null ? base3.perfect : base3.perfect = 0, user.achievements.perfect++, lvlDiv2 = Math.ceil(api.capByLevel(user.stats.lvl) / 2), {
        str: lvlDiv2,
        int: lvlDiv2,
        per: lvlDiv2,
        con: lvlDiv2,
        stealth: 0,
        streaks: false
      }) : clearBuffs;
      if (dailyDueUnchecked === 0 && dailyChecked === 0) {
        dailyChecked = 1;
      }
      user.stats.mp += _.max([10, .1 * user._statsComputed.maxMP]) * dailyChecked / (dailyDueUnchecked + dailyChecked);
      if (user.stats.mp > user._statsComputed.maxMP) {
        user.stats.mp = user._statsComputed.maxMP;
      }
      progress = user.party.quest.progress;
      _progress = _.cloneDeep(progress);
      _.merge(progress, {
        down: 0,
        up: 0
      });
      progress.collect = _.transform(progress.collect, (function(m, v, k) {
        return m[k] = 0;
      }));
      if ((base4 = user.flags).cronCount == null) {
        base4.cronCount = 0;
      }
      user.flags.cronCount++;
      analyticsData = {
        category: 'behavior',
        gaLabel: 'Cron Count',
        gaValue: user.flags.cronCount,
        uuid: user._id,
        user: user,
        resting: user.preferences.sleep,
        cronCount: user.flags.cronCount,
        progressUp: _.min([_progress.up, 900]),
        progressDown: _progress.down
      };
      if ((ref3 = options.analytics) != null) {
        ref3.track('Cron', analyticsData);
      }
      return _progress;
    },
    preenUserHistory: function(minHistLen) {
      if (minHistLen == null) {
        minHistLen = 7;
      }
      _.each(user.habits.concat(user.dailys), function(task) {
        var ref;
        if (((ref = task.history) != null ? ref.length : void 0) > minHistLen) {
          task.history = preenHistory(task.history);
        }
        return true;
      });
      _.defaults(user.history, {
        todos: [],
        exp: []
      });
      if (user.history.exp.length > minHistLen) {
        user.history.exp = preenHistory(user.history.exp);
      }
      if (user.history.todos.length > minHistLen) {
        return user.history.todos = preenHistory(user.history.todos);
      }
    },
    ultimateGear: function() {
      var base, owned;
      owned = typeof window !== "undefined" && window !== null ? user.items.gear.owned : user.items.gear.owned.toObject();
      if ((base = user.achievements).ultimateGearSets == null) {
        base.ultimateGearSets = {
          healer: false,
          wizard: false,
          rogue: false,
          warrior: false
        };
      }
      content.classes.forEach(function(klass) {
        if (user.achievements.ultimateGearSets[klass] !== true) {
          return user.achievements.ultimateGearSets[klass] = _.reduce(['armor', 'shield', 'head', 'weapon'], function(soFarGood, type) {
            var found;
            found = _.find(content.gear.tree[type][klass], {
              last: true
            });
            return soFarGood && (!found || owned[found.key] === true);
          }, true);
        }
      });
      if (typeof user.markModified === "function") {
        user.markModified('achievements.ultimateGearSets');
      }
      if (_.contains(user.achievements.ultimateGearSets, true) && user.flags.armoireEnabled !== true) {
        user.flags.armoireEnabled = true;
        return typeof user.markModified === "function" ? user.markModified('flags') : void 0;
      }
    },
    nullify: function() {
      user.ops = null;
      user.fns = null;
      return user = null;
    }
  };
  Object.defineProperty(user, '_statsComputed', {
    get: function() {
      var computed;
      computed = _.reduce(['per', 'con', 'str', 'int'], (function(_this) {
        return function(m, stat) {
          m[stat] = _.reduce($w('stats stats.buffs items.gear.equipped.weapon items.gear.equipped.armor items.gear.equipped.head items.gear.equipped.shield'), function(m2, path) {
            var item, val;
            val = user.fns.dotGet(path);
            return m2 + (~path.indexOf('items.gear') ? (item = content.gear.flat[val], (+(item != null ? item[stat] : void 0) || 0) * ((item != null ? item.klass : void 0) === user.stats["class"] || (item != null ? item.specialClass : void 0) === user.stats["class"] ? 1.5 : 1)) : +val[stat] || 0);
          }, 0);
          m[stat] += Math.floor(api.capByLevel(user.stats.lvl) / 2);
          return m;
        };
      })(this), {});
      computed.maxMP = computed.int * 2 + 30;
      return computed;
    }
  });
  return Object.defineProperty(user, 'tasks', {
    get: function() {
      var tasks;
      tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards);
      return _.object(_.pluck(tasks, "id"), tasks);
    }
  });
};
