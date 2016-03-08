import moment from 'moment';
import _ from 'lodash';

import {
  daysSince,
  shouldDo,
} from './cron';
import {
  MAX_HEALTH,
  MAX_LEVEL,
  MAX_STAT_POINTS,
} from './constants';
import * as statHelpers from './statHelpers';

import importedLibs from './libs';

var $w, preenHistory, sortOrder,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

import content from './content/index';
import i18n from './i18n';

let api = module.exports = {};

api.i18n = i18n;
api.shouldDo = shouldDo;

api.maxLevel = MAX_LEVEL;
api.capByLevel = statHelpers.capByLevel;
api.maxHealth = MAX_HEALTH;
api.tnl = statHelpers.toNextLevel;
api.diminishingReturns = statHelpers.diminishingReturns;

$w = api.$w = importedLibs.splitWhitespace;
api.dotSet = importedLibs.dotSet;
api.dotGet = importedLibs.dotGet;
api.refPush = importedLibs.refPush;
api.planGemLimits = importedLibs.planGemLimits;

preenHistory = importedLibs.preenHistory;

/*
  Preen 3-day past-completed To-Dos from Angular & mobile app
 */

api.preenTodos = importedLibs.preenTodos;

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

api.uuid = importedLibs.uuid;

api.countExists = function(items) {
  return _.reduce(items, (function(m, v) {
    return m + (v ? 1 : 0);
  }), 0);
};

api.taskDefaults = importedLibs.taskDefaults;

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

import count from './count';
api.count = count;


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

import importedOps from './ops';
import importedFns from './fns';

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
      update: _.partial(importedOps.update, user),
      sleep: _.partial(importedOps.sleep, user),
      revive: _.partial(importedOps.revive, user),
      reset: _.partial(importedOps.reset, user),
      reroll: _.partial(importedOps.reroll, user),
      rebirth: _.partial(importedOps.rebirth, user),
      allocateNow: _.partial(importedOps.allocateNow, user),
      clearCompleted: _.partial(importedOps.clearCompleted, user),
      sortTask: _.partial(importedOps.sortTask, user),
      updateTask: _.partial(importedOps.updateTask, user),
      deleteTask: _.partial(importedOps.deleteTask, user),
      addTask: _.partial(importedOps.addTask, user),
      addTag: _.partial(importedOps.addTag, user),
      sortTag: _.partial(importedOps.sortTag, user),
      getTags: _.partial(importedOps.getTags, user),
      getTag: _.partial(importedOps.getTag, user),
      updateTag: _.partial(importedOps.updateTag, user),
      deleteTag: _.partial(importedOps.deleteTag, user),
      addWebhook: _.partial(importedOps.addWebhook, user),
      updateWebhook: _.partial(importedOps.updateWebhook, user),
      deleteWebhook: _.partial(importedOps.deleteWebhook, user),
      addPushDevice: _.partial(importedOps.addPushDevice, user),
      clearPMs: _.partial(importedOps.clearPMs, user),
      deletePM: _.partial(importedOps.deletePM, user),
      blockUser: _.partial(importedOps.blockUser, user),
      feed: _.partial(importedOps.feed, user),
      buySpecialSpell: _.partial(importedOps.buySpecialSpell, user),
      purchase: _.partial(importedOps.purchase, user),
      releasePets: _.partial(importedOps.releasePets, user),
      releaseMounts: _.partial(importedOps.releaseMounts, user),
      releaseBoth: _.partial(importedOps.releaseBoth, user),
      buy: _.partial(importedOps.buy, user),
      buyQuest: _.partial(importedOps.buyQuest, user),
      buyMysterySet: _.partial(importedOps.buyMysterySet, user),
      hourglassPurchase: _.partial(importedOps.hourglassPurchase, user),
      sell: _.partial(importedOps.sell, user),
      equip: _.partial(importedOps.equip, user),
      hatch: _.partial(importedOps.hatch, user),
      unlock: _.partial(importedOps.unlock, user),
      changeClass: _.partial(importedOps.changeClass, user),
      disableClasses: _.partial(importedOps.disableClasses, user),
      allocate: _.partial(importedOps.allocate, user),
      readCard: _.partial(importedOps.readCard, user),
      openMysteryItem: _.partial(importedOps.openMysteryItem, user),
      score: _.partial(importedOps.score, user),
    };
  }
  user.fns = {
    getItem: _.partial(importedFns.getItem, user),
    handleTwoHanded: _.partial(importedFns.handleTwoHanded, user),
    predictableRandom: _.partial(importedFns.predictableRandom, user),
    crit: _.partial(importedFns.crit, user),
    randomVal: _.partial(importedFns.randomVal, user),
    dotSet: _.partial(importedFns.dotSet, user),
    dotGet: _.partial(importedFns.dotGet, user),
    randomDrop: _.partial(importedFns.randomDrop, user),
    autoAllocate: _.partial(importedFns.autoAllocate, user),
    updateStats: _.partial(importedFns.updateStats, user),
    cron: _.partial(importedFns.cron, user),
    preenUserHistory: _.partial(importedFns.preenUserHistory, user),
    ultimateGear: _.partial(importedFns.ultimateGear, user),
    nullify: _.partial(importedFns.nullify, user),
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
