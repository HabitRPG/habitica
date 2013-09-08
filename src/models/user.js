var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');

var UserSchema = new Schema({
  _id: {
    type: String,
    'default': helpers.uuid
  },
  apiToken: {
    type: String,
    'default': helpers.uuid
  },
  /*
  # We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  # have been updated (http://goo.gl/gQLz41), but we want *every* update
  */

  _v: {
    type: Number,
    'default': 0
  },
  achievements: {
    originalUser: Boolean,
    helpedHabit: Boolean,
    ultimateGear: Boolean,
    beastMaster: Boolean,
    streak: Number
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
  /* TODO*/

  backer: Schema.Types.Mixed,
  /*
  #    tier: Number
  #    admin: Boolean
  #    contributor: Boolean
  #    tokensApplieds: Boolean
  */

  balance: Number,
  habitIds: Array,
  dailyIds: Array,
  todoIds: Array,
  rewardIds: Array,
  /* Removed `filters`, no longer persisting to the database*/

  flags: {
    ads: String,
    dropsEnabled: Boolean,
    itemsEnabled: Boolean,
    newStuff: String, //FIXME to boolean (currently show/hide)
    rewrite: Boolean,
    partyEnabled: Boolean,
    petsEnabled: Boolean,
    rest: Boolean // fixme - change to preferences.resting once we're off derby
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
    guilds: Array,
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

    // FIXME revert this back to definition once we've replaced Derby and can run a migration to remove all corrupt eggs
    eggs: Schema.Types.Mixed,
//      [
//        {
//          text: String, // Wolf
//          name: String, // Wolf
//          value: Number, //3
//          notes: String, //Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.
//          //type: String, //Egg // this is forcing mongoose to return object as "[object Object]", but I don't think this is needed anyway?
//          dialog: String //You've found a Wolf Egg! Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet
//        }
//      ],
    hatchingPotions: Array, //["Base", "Skeleton",...]
    lastDrop: {
      date: Date,
      count: Number
    },
    /* ["BearCub-Base", "Cactus-Base", ...]*/

    pets: Array
  },
  /*FIXME store as Date?*/

  lastCron: {
    type: Date,
    'default': new Date
  },
  /* FIXME remove?*/

  party: {
    /*party._id FIXME make these populate docs?*/

    current: String,
    /*party._id*/

    invitation: String,
    /*party._id*/

    lastMessageSeen: String,
    leader: Boolean
  },
  preferences: {
    armorSet: String,
    dayStart: Number,
    gender: String,
    hair: String,
    hideHeader: Boolean,
    showHelm: Boolean,
    skin: String,
    timezoneOffset: Number
  },
  profile: {
    blurb: String,
    imageUrl: String,
    name: String,
    /*["http://ocdevel.com" ]*/

    websites: Array
  },
  stats: {
    hp: Number,
    exp: Number,
    gp: Number,
    lvl: Number
  },
  tags: [
    {
      /* FIXME use refs?*/

      id: String,
      name: String
    }
  ],
  /*
  # We can't define `tasks` until we move off Derby, since Derby requires dictionary of objects. When we're off, migrate
  # to array of subdocs
  */

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

/*
  Derby requires a strange storage format for somethign called "refLists". Here we hook into loading the data, so we
  can provide a more "expected" storage format for our various helper methods. Since the attributes are passed by reference,
  the underlying data will be modified too - so when we save back to the database, it saves it in the way Derby likes.
  This will go away after the rewrite is complete
*/


UserSchema.post('init', function(doc) {
  /* Fix corrupt values, FIXME we can remove this after off Derby*/

  if (doc.items && doc.items.eggs) {
    doc.items.eggs = _.filter(doc.items.eggs,function(egg){
      return !_.isString(egg);
    })
  }

  _.each(doc.tasks, function(task, k) {
    if (!task || !task.id) {
      return delete doc.tasks[k];
    }
    if (isNaN(+task.value)) {
      return task.value = 0;
    }
  });
  _.each(doc.stats, function(v, k) {
    if (isNaN(+v)) {
      return doc.stats[k] = 0;
    }
  });

  _.each(['habit', 'daily', 'todo', 'reward'], function(type) {
    // we use _.transform instead of a simple _.where in order to maintain sort-order
    doc[type + "s"] = _.transform(doc[type + "Ids"], function(result, tid) {
      result.push(doc.tasks[tid]);
    });
  });
});

/*UserSchema.virtual('id').get () -> @_id*/


UserSchema.methods.toJSON = function() {
  var doc = this.toObject();
  doc.id = doc._id;
  _.each(['habit', 'daily', 'todo', 'reward'], function(type) {
    // we use _.transform instead of a simple _.where in order to maintain sort-order
    doc["" + type + "s"] = _.transform(doc["" + type + "Ids"], function(result, tid) {
      result.push(doc.tasks[tid]);
    });
    //delete doc["#{type}Ids"]
  });
  //delete doc.tasks
  doc.filters = {};
  return doc;
};

/*
# FIXME - since we're using special @post('init') above, we need to flag when the original path was modified.
# Custom setter/getter virtuals?
*/
UserSchema.pre('save', function(next) {
  this.markModified('tasks');
  //our own version incrementer
  this._v++;
  next();
});

module.exports.schema = UserSchema;
module.exports.model = mongoose.model("User", UserSchema);