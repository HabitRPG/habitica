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


api.refPush = importedLibs.refPush;

api.planGemLimits = importedLibs.planGemLimits;

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
      rebirth: _.partial(importedOps.reroll, user),
      allocateNow: _.partial(importedOps.reroll, user),
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
