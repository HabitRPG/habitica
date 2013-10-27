// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');

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
  _v: {
    type: Number,
    'default': 0
  },
  achievements: {
    originalUser: Boolean,
    helpedHabit: Boolean,
    ultimateGear: Boolean,
    beastMaster: Boolean,
    streak: {type: Number, 'default': 0}
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
      created: {
        type: Date,
        'default': Date.now
      },
      loggedin: Date
    }
  },

  backer: {
    tier: Number,
    admin: Boolean,
    npc: String,
    contributor: String,
    tokensApplied: Boolean
  },

  balance: Number,
  habitIds: Array,
  dailyIds: Array,
  todoIds: Array,
  rewardIds: Array,
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
    rest: {type: Boolean, 'default': false} // fixme - change to preferences.resting once we're off derby
  },
  history: {
    exp: [
      {
        date: Date,
        value: Number
      }
    ],
    todos: [
      {
        data: Date,
        value: Number
      }
    ]
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
  // FIXME store as Date?

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
    timezoneOffset: Number
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
      // FIXME use refs?
      id: String,
      name: String
    }
  ],

  // ### Tasks Definition
  // We can't define `tasks` until we move off Derby, since Derby requires dictionary of objects. When we're off, migrate
  // to array of subdocs

  tasks: Schema.Types.Mixed
  /*
  # history: {date, value}
  # id
  # notes
  # tags { "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true },
  # text
  # type
  # up
  # down
  # value
  # completed
  # priority: '!!'
  # repeat {m: true, t: true}
  # streak
  */

}, {
  strict: true
});

// Legacy Derby Function?
// ----------------------
// Derby requires a strange storage format for somethign called "refLists". Here we hook into loading the data, so we
// can provide a more "expected" storage format for our various helper methods. Since the attributes are passed by reference,
// the underlying data will be modified too - so when we save back to the database, it saves it in the way Derby likes.
// This will go away after the rewrite is complete

function transformTaskLists(doc) {
  _.each(['habit', 'daily', 'todo', 'reward'], function(type) {
    // we use _.transform instead of a simple _.where in order to maintain sort-order
    doc[type + "s"] = _.reduce(doc[type + "Ids"], function(m, tid) {
      if (!doc.tasks[tid]) return m; // FIXME tmp hotfix, people still have null tasks?
      if (!doc.tasks[tid].tags) doc.tasks[tid].tags = {}; // FIXME remove this when we switch tasks to subdocs and can define tags default in schema
      m.push(doc.tasks[tid]);
      return m;
    }, []);
  });
}

UserSchema.post('init', function(doc) {
  transformTaskLists(doc);
});

UserSchema.methods.toJSON = function() {
  var doc = this.toObject();
  doc.id = doc._id;
  transformTaskLists(doc); // we need to also transform for our server-side routes

  // FIXME? Is this a reference to `doc.filters` or just disabled code? Remove?
  /*
  // Remove some unecessary data as far as client consumers are concerned
  //_.each(['habit', 'daily', 'todo', 'reward'], function(type) {
  //  delete doc["#{type}Ids"]
  //});
  //delete doc.tasks
  */
  doc.filters = {};
  doc._tmp = this._tmp; // be sure to send down drop notifs

  return doc;
};

 // FIXME - since we're using special @post('init') above, we need to flag when the original path was modified.
 // Custom setter/getter virtuals?

UserSchema.pre('save', function(next) {
  this.markModified('tasks');
  //our own version incrementer
  this._v++;
  next();
});

module.exports.schema = UserSchema;
module.exports.model = mongoose.model("User", UserSchema);