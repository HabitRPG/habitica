// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('habitrpg-shared');
var _ = require('lodash');
var TaskSchemas = require('./task');
var Challenge = require('./challenge').model;

// User Schema
// -----------

var eggPotionMapping = _.transform(shared.content.eggs, function(m, egg){
  _.defaults(m, _.transform(shared.content.hatchingPotions, function(m2, pot){
    m2[egg.name + '-' + pot.name] = true;
  }));
})

var specialPetsMapping = shared.content.specialPets; // may need to revisit if we add additional information about the special pets

var UserSchema = new Schema({
  // ### UUID and API Token
  _id: {
    type: String,
    'default': shared.uuid
  },
  apiToken: {
    type: String,
    'default': shared.uuid
  },

  // ### Mongoose Update Object
  // We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  // have been updated (http://goo.gl/gQLz41), but we want *every* update
  _v: { type: Number, 'default': 0 },
  achievements: {
    originalUser: Boolean,
    helpedHabit: Boolean,
    ultimateGear: Boolean,
    beastMaster: Boolean,
    veteran: Boolean,
    streak: Number,
    challenges: Array
  },
  auth: {
    facebook: Schema.Types.Mixed,
    local: {
      email: String,
      hashed_password: String,
      salt: String,
      username: String
    },
    timestamps: {
      created: {type: Date,'default': Date.now},
      loggedin: {type: Date,'default': Date.now}
    }
  },

  backer: {
    tier: Number,
    //admin: Boolean, // FIXME migrate to contributor.admin
    npc: String,
    //contributor: String, // FIXME migrate to contributor.text
    tokensApplied: Boolean
  },

  contributor: {
    level: Number, // 1-7, see https://trello.com/c/wkFzONhE/277-contributor-gear
    admin: Boolean,
    text: String, // Artisan, Friend, Blacksmith, etc
    contributions: String // a markdown textarea to list their contributions + links
  },

  balance: Number,
  filters: {type: Schema.Types.Mixed, 'default': {}},

  purchased: {
    ads: {type: Boolean, 'default': false},
    skin: {type: Schema.Types.Mixed, 'default': {}}, // eg, {skeleton: true, pumpkin: true, eb052b: true}
    hair: {type: Schema.Types.Mixed, 'default': {}}
  },

  flags: {
    customizationsNotification: {type: Boolean, 'default': false},
    showTour: {type: Boolean, 'default': true},
    dropsEnabled: {type: Boolean, 'default': false},
    itemsEnabled: {type: Boolean, 'default': false},
    newStuff: {type: Boolean, 'default': false},
    rewrite: {type: Boolean, 'default': true},
    partyEnabled: Boolean, // FIXME do we need this?
    rest: {type: Boolean, 'default': false}, // fixme - change to preferences.resting once we're off derby
    contributor: Boolean,
    classSelected: {type: Boolean, 'default': false}
  },
  history: {
    exp: Array, // [{date: Date, value: Number}], // big peformance issues if these are defined
    todos: Array //[{data: Date, value: Number}] // big peformance issues if these are defined
  },

  // FIXME remove?
  invitations: {
    guilds: {type: Array, 'default': []},
    party: Schema.Types.Mixed
  },
  items: {
    gear: {
      owned: _.transform(shared.content.gear.flat, function(m,v,k){
        m[v.key] = {type: Boolean};
        if (v.key.match(/[weapon|armor|head|shield]_warrior_0/))
          m[v.key]['default'] = true;
      }),

      equipped: {
        weapon: {type: String, 'default': 'weapon_warrior_0'},
        armor: {type: String, 'default': 'armor_base_0'},
        head: {type: String, 'default': 'head_base_0'},
        shield: {type: String, 'default': 'shield_base_0'}
      },
      costume: {
        weapon: {type: String, 'default': 'weapon_base_0'},
        armor: {type: String, 'default': 'armor_base_0'},
        head: {type: String, 'default': 'head_base_0'},
        shield: {type: String, 'default': 'shield_base_0'}
      },
    },

    // -------------- Animals ------------------- 
    // Complex bit here. The result looks like:
    // pets: {
    //   'Wolf-Desert': 0, // 0 means does not own
    //   'PandaCub-Red': 10, // Number represents "Growth Points"
    //   etc...
    // }
    pets:
    _.defaults(
      // First transform to a 1D eggs/potions mapping
      _.transform(eggPotionMapping, function(m,v,k){ m[k] = Number; }),
      // Then add additional pets (backer, contributor)
      _.transform(specialPetsMapping, function(m,v,k){ m[k] = Number; })
    ),
    currentPet: String, // Cactus-Desert

    // eggs: {
    //  'PandaCub': 0, // 0 indicates "doesn't own"
    //  'Wolf': 5 // Number indicates "stacking"
    // }
    eggs: _.transform(shared.content.eggs, function(m,v,k){ m[k] = Number; }),

    // hatchingPotions: {
    //  'Desert': 0, // 0 indicates "doesn't own"
    //  'CottonCandyBlue': 5 // Number indicates "stacking"
    // }
    hatchingPotions: _.transform(shared.content.hatchingPotions, function(m,v,k){ m[k] = Number; }),

    // Food: {
    //  'Watermelon': 0, // 0 indicates "doesn't own"
    //  'RottenMeat': 5 // Number indicates "stacking"
    // }
    food: _.transform(shared.content.food, function(m,v,k){ m[k] = Number; }),

    // mounts: {
    //  'Wolf-Desert': true,
    //  'PandaCub-Red': false,
    //  etc...
    // }
    mounts: _.defaults(
      // First transform to a 1D eggs/potions mapping
      _.transform(eggPotionMapping, function(m,v,k){ m[k] = Boolean; }),
      // Then add additional pets (backer, contributor)
      {
        'LionCub-Ethereal': Boolean,
        'BearCub-Polar': Boolean
      }
    ),
    currentMount: String,

    lastDrop: {
      date: {type: Date, 'default': Date.now},
      count: {type: Number, 'default': 0}
    }
  },

  lastCron: {
    type: Date,
    'default': Date.now
  },

  // FIXME remove?
  party: {
    //party._id // FIXME make these populate docs?
    current: String, // party._id
    invitation: String, // party._id
    lastMessageSeen: String,
    leader: Boolean,
    order: {type:String, 'default':'level'}
  },
  preferences: {
    armorSet: String,
    dayStart: {type:Number, 'default': 0},
    size: {type:String, enum: ['broad','slim'], 'default': 'broad'},
    hair: {
      color: {type: String, 'default': 'blond'},
      base: {type: Number, 'default': 0},
      bangs: {type: Number, 'default': 0},
      beard: {type: Number, 'default': 0},
      mustach: {type: Number, 'default': 0},
    },
    hideHeader: {type:Boolean, 'default':false},
    skin: {type:String, 'default':'white'},
    timezoneOffset: Number,
    language: String,
    automaticAllocation: Boolean,
    useCostume: Boolean
  },
  profile: {
    blurb: String,
    imageUrl: String,
    name: String,
  },
  stats: {
    hp: {type: Number, 'default': 50},
    mp: {type: Number, 'default': 10},
    exp: {type: Number, 'default': 0},
    gp: {type: Number, 'default': 0},
    lvl: {type: Number, 'default': 1},

    // Class System
    'class': {type: String, enum: ['warrior','rogue','wizard','healer'], 'default': 'warrior'},
    points: {type: Number, 'default': 0},
    str: {type: Number, 'default': 0},
    con: {type: Number, 'default': 0},
    int: {type: Number, 'default': 0},
    per: {type: Number, 'default': 0},
    buffs: {
      str: Number,
      def: Number,
      per: Number,
      stealth: Number
    }
  },
  tags: [
    {
      id: String,
      name: String,
      challenge: String
    }
  ],

  challenges: [{type: 'String', ref:'Challenge'}],

  habits:   [TaskSchemas.HabitSchema],
  dailys:   [TaskSchemas.DailySchema],
  todos:    [TaskSchemas.TodoSchema],
  rewards:  [TaskSchemas.RewardSchema],

}, {
  strict: true,
  minimize: false // So empty objects are returned
});

UserSchema.methods.deleteTask = function(tid) {
  //user[t.type+'s'].id(t.id).remove();
  var task = this.tasks[tid];
  var i = this[task.type+'s'].indexOf(task);
  if (~i) this[task.type+'s'].splice(i,1);
}

UserSchema.methods.toJSON = function() {
  var doc = this.toObject();
  doc.id = doc._id;

  // FIXME? Is this a reference to `doc.filters` or just disabled code? Remove?
  doc.filters = {};
  doc._tmp = this._tmp; // be sure to send down drop notifs

  return doc;
};

//UserSchema.virtual('tasks').get(function () {
//  var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
//  var tasks = _.object(_.pluck(tasks,'id'), tasks);
//  return tasks;
//});

UserSchema.post('init', function(doc){
  shared.wrap(doc);
})

UserSchema.pre('save', function(next) {

  // Populate new users with default content
  if (this.isNew){
    //TODO for some reason this doesn't work here: `_.merge(this, shared.content.userDefaults);`
    this.habits = shared.content.userDefaults.habits;
    this.dailys = shared.content.userDefaults.dailys;
    this.todos = shared.content.userDefaults.todos;
    this.rewards = shared.content.userDefaults.rewards;
    this.tags = shared.content.userDefaults.tags;
    // tasks automatically get id=helpers.uuid() from TaskSchema id.default, but tags are Schema.Types.Mixed - so we need to manually invoke here
    _.each(this.tags, function(tag){tag.id = shared.uuid();})
  }

  //this.markModified('tasks');
  if (_.isNaN(this.preferences.dayStart) || this.preferences.dayStart < 0 || this.preferences.dayStart > 24) {
    this.preferences.dayStart = 0;
  }

  if (!this.profile.name) {
    var fb = this.auth.facebook;
    this.profile.name =
      (this.auth.local && this.auth.local.username) ||
      (fb && (fb.displayName || fb.name || fb.username || (fb.first_name && fb.first_name + ' ' + fb.last_name))) ||
      'Anonymous';
  }

  // FIXME handle this on level-up instead, and come up with how we're going to handle retroactively
  // Actually, can this be used as an attr default? (schema {type: ..., 'default': function(){}})
  this.stats.points = this.stats.lvl - (this.stats.con + this.stats.str + this.stats.per + this.stats.int);

  var petCount = shared.countPets(_.reduce(this.items.pets,function(m,v){
    //HOTFIX - Remove when solution is found, the first argument passed to reduce is a function
    if(_.isFunction(v)) return m;
    return m+(v?1:0)},0), this.items.pets);

  this.achievements.beastMaster = petCount >= 90;

  //our own version incrementer
  this._v++;
  next();
});

UserSchema.methods.syncScoreToChallenge = function(task, delta){
  if (!task.challenge || !task.challenge.id || task.challenge.broken) return;
  if (task.type == 'reward') return; // we don't want to update the reward GP cost
  var self = this;
  Challenge.findById(task.challenge.id, function(err, chal){
    if (err) throw err;
    var t = chal.tasks[task.id];
    if (!t) return chal.syncToUser(self); // this task was removed from the challenge, notify user
    t.value += delta;
    if (t.type == 'habit' || t.type == 'daily') {
      t.history.push({value: t.value, date: +new Date});
    }
    chal.save();
  });
}

UserSchema.methods.unlink = function(options, cb) {
  var cid = options.cid, keep = options.keep, tid = options.tid;
  var self = this;
  switch (keep) {
    case 'keep':
      self.tasks[tid].challenge = {};
      break;
    case 'remove':
      self.deleteTask(tid);
      break;
    case 'keep-all':
      _.each(self.tasks, function(t){
        if (t.challenge && t.challenge.id == cid) {
          t.challenge = {};
        }
      });
      break;
    case 'remove-all':
      _.each(self.tasks, function(t){
        if (t.challenge && t.challenge.id == cid) {
          self.deleteTask(t.id);
        }
      })
      break;
  }
  self.markModified('habits');
  self.markModified('dailys');
  self.markModified('todos');
  self.markModified('rewards');
  self.save(cb);
}

module.exports.schema = UserSchema;
module.exports.model = mongoose.model("User", UserSchema);
