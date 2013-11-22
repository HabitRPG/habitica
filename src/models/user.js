// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');
var TaskSchema = require('./task').schema;
var Challenge = require('./challenge').model;

// User Schema
// -----------

var UserSchema = new Schema({
  // ### UUID and API Token
  _id: {
    type: String,
    'default': helpers.uuid
  },
  apiToken: {
    type: String,
    'default': helpers.uuid
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
    petsEnabled: {type: Boolean, 'default': false},
    rest: {type: Boolean, 'default': false}, // fixme - change to preferences.resting once we're off derby
    contributor: Boolean
  },
  history: {
    exp: Array, // [{date: Date, value: Number}], // big peformance issues if these are defined
    todos: Array //[{data: Date, value: Number}] // big peformance issues if these are defined
  },

  /* FIXME remove?*/
  invitations: {
    guilds: {type: Array, 'default': []},
    party: Schema.Types.Mixed
  },
  items: {
    armor: Number,
    weapon: Number,
    head: Number,
    shield: Number,

    /*FIXME - tidy this up, not the best way to store current pet*/

    currentPet: {
      /*Cactus*/

      text: String,
      /*Cactus*/

      name: String,
      /*3*/

      value: Number,
      /*"Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.",*/

      notes: String,
      /*Skeleton*/

      modifier: String,
      /*Cactus-Skeleton*/

      str: String
    },

    eggs: [
      {
        // example: You've found a Wolf Egg! Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet
        dialog: String,
        // example: Wolf
        name: String, 
        // example: Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.
        notes: String,
        // example: Wolf 
        text: String, 
        /* type: String, //Egg // this is forcing mongoose to return object as "[object Object]", but I don't think this is needed anyway? */
        // example: 3
        value: Number 
      }
    ],
    hatchingPotions: Array, // ["Base", "Skeleton",...]
    lastDrop: {
      date: {type: Date, 'default': Date.now},
      count: {type: Number, 'default': 0}
    },
    // ["BearCub-Base", "Cactus-Base", ...]

    pets: Array
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
    leader: Boolean
  },
  preferences: {
    armorSet: String,
    dayStart: {type:Number, 'default': 0},
    gender: {type:String, 'default': 'm'},
    hair: {type:String, 'default':'blond'},
    hideHeader: {type:Boolean, 'default':false},
    showHelm: {type:Boolean, 'default':true},
    skin: {type:String, 'default':'white'},
    timezoneOffset: Number,
    sound: Boolean,
    soundTheme: {type:String, 'default':'browserquest'}
  },
  profile: {
    blurb: String,
    imageUrl: String,
    name: String,
    websites: Array // styled like --> ["http://ocdevel.com" ]
  },
  stats: {
    hp: Number,
    exp: Number,
    gp: Number,
    lvl: Number
  },
  tags: [
    {
      id: String,
      name: String,
      challenge: String
    }
  ],

  challenges: [{type: 'String', ref:'Challenge'}],

  habits: [TaskSchema],
  dailys: [TaskSchema],
  todos: [TaskSchema],
  rewards: [TaskSchema],

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

UserSchema.virtual('tasks').get(function () {
  var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
  var tasks = _.object(_.pluck(tasks,'id'), tasks);
  return tasks;
});

 // FIXME - since we're using special @post('init') above, we need to flag when the original path was modified.
 // Custom setter/getter virtuals?

UserSchema.pre('save', function(next) {
  //this.markModified('tasks');

  if (!this.profile.name) {
    var fb = this.auth.facebook;
    this.profile.name =
      (this.auth.local && this.auth.local.username) ||
      (fb && (fb.displayName || fb.name || fb.username || (fb.first_name && fb.first_name + ' ' + fb.last_name))) ||
      'Anonymous';
  }

  if(!this.achievements.beastMaster && this.items.pets.length >= 90){
    this.achievements.beastMaster = true;
  }

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
    t.history.push({value: t.value, date: +new Date});
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
