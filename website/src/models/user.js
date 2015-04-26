// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');
var _ = require('lodash');
var TaskSchemas = require('./task');
var Challenge = require('./challenge').model;
var moment = require('moment');

// User Schema
// -----------

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
    helpedHabit: Boolean, //TODO: Deprecate this. Superseded by habitSurveys
    habitSurveys: Number,
    ultimateGear: Boolean,
    beastMaster: Boolean,
    beastMasterCount: Number,
    mountMaster: Boolean,
    mountMasterCount: Number,
    triadBingo: Boolean,
    triadBingoCount: Number,
    veteran: Boolean,
    snowball: Number,
    spookDust: Number,
    shinySeed: Number,
    streak: Number,
    challenges: Array,
    quests: Schema.Types.Mixed,
    rebirths: Number,
    rebirthLevel: Number,
    perfect: Number,
    habitBirthday: Boolean, // TODO: Deprecate this. Superseded by habitBirthdays
    habitBirthdays: Number,
    valentine: Number,
    costumeContest: Boolean,
    nye: Number
  },
  auth: {
    blocked: Boolean,
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
    npc: String,
    tokensApplied: Boolean
  },

  contributor: {
    level: Number, // 1-9, see https://trello.com/c/wkFzONhE/277-contributor-gear https://github.com/HabitRPG/habitrpg/issues/3801
    admin: Boolean,
    sudo: Boolean,
    text: String, // Artisan, Friend, Blacksmith, etc
    contributions: String, // a markdown textarea to list their contributions + links
    critical: String
  },

  balance: {type: Number, 'default':0},
  filters: {type: Schema.Types.Mixed, 'default': {}},

  purchased: {
    ads: {type: Boolean, 'default': false},
    skin: {type: Schema.Types.Mixed, 'default': {}}, // eg, {skeleton: true, pumpkin: true, eb052b: true}
    hair: {type: Schema.Types.Mixed, 'default': {}},
    shirt: {type: Schema.Types.Mixed, 'default': {}},
    background: {type: Schema.Types.Mixed, 'default': {}},
    txnCount: {type: Number, 'default':0},
    mobileChat: Boolean,
    plan: {
      planId: String,
      paymentMethod: String, //enum: ['Paypal','Stripe', 'Gift', '']}
      customerId: String,
      dateCreated: Date,
      dateTerminated: Date,
      dateUpdated: Date,
      extraMonths: {type:Number, 'default':0},
      gemsBought: {type: Number, 'default': 0},
      mysteryItems: {type: Array, 'default': []},
      consecutive: {
        count: {type:Number, 'default':0},
        offset: {type:Number, 'default':0}, // when gifted subs, offset++ for each month. offset-- each new-month (cron). count doesn't ++ until offset==0
        gemCapExtra: {type:Number, 'default':0},
        trinkets: {type:Number, 'default':0}
      }
    }
  },

  flags: {
    customizationsNotification: {type: Boolean, 'default': false},
    showTour: {type: Boolean, 'default': true},
    tour: {
      // -1 indicates "uninitiated", -2 means "complete", any other number is the current tour step (0-index)
      intro: {type: Number,       'default': -1},
      classes: {type: Number,     'default': -1},
      stats: {type: Number,       'default': -1},
      tavern: {type: Number,      'default': -1},
      party: {type: Number,       'default': -1},
      guilds: {type: Number,      'default': -1},
      challenges: {type: Number,  'default': -1},
      market: {type: Number,      'default': -1}
    },
    dropsEnabled: {type: Boolean, 'default': false},
    itemsEnabled: {type: Boolean, 'default': false},
    newStuff: {type: Boolean, 'default': false},
    rewrite: {type: Boolean, 'default': true},
    partyEnabled: Boolean, // FIXME do we need this?
    contributor: Boolean,
    classSelected: {type: Boolean, 'default': false},
    mathUpdates: Boolean,
    rebirthEnabled: {type: Boolean, 'default': false},
    freeRebirth: {type: Boolean, 'default': false},
    levelDrops: {type:Schema.Types.Mixed, 'default':{}},
    chatRevoked: Boolean,
    // Used to track the status of recapture emails sent to each user,
    // can be 0 - no email sent - 1, 2, 3 or 4 - 4 means no more email will be sent to the user
    recaptureEmailsPhase: {type: Number, 'default': 0},
    // Needed to track the tip to send inside the email
    weeklyRecapEmailsPhase: {type: Number, 'default': 0},
    communityGuidelinesAccepted: {type: Boolean, 'default': false},
    cronCount: {type:Number, 'default':0}
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
        if (v.key.match(/[armor|head|shield]_warrior_0/))
          m[v.key]['default'] = true;
      }),

      equipped: {
        weapon: String,
        armor: {type: String, 'default': 'armor_base_0'},
        head: {type: String, 'default': 'head_base_0'},
        shield: {type: String, 'default': 'shield_base_0'},
        back: String,
        headAccessory: String,
        eyewear: String,
        body: String
      },
      costume: {
        weapon: String,
        armor: {type: String, 'default': 'armor_base_0'},
        head: {type: String, 'default': 'head_base_0'},
        shield: {type: String, 'default': 'shield_base_0'},
        back: String,
        headAccessory: String,
        eyewear: String,
        body: String
      }
    },

    special:{
      snowball: {type: Number, 'default': 0},
      spookDust: {type: Number, 'default': 0},
      shinySeed: {type: Number, 'default': 0},
      valentine: Number,
      valentineReceived: Array, // array of strings, by sender name
      nye: Number,
      nyeReceived: Array
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
      _.transform(shared.content.pets, function(m,v,k){ m[k] = Number; }),
      // Then add quest pets
      _.transform(shared.content.questPets, function(m,v,k){ m[k] = Number; }),
      // Then add additional pets (backer, contributor)
      _.transform(shared.content.specialPets, function(m,v,k){ m[k] = Number; })
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
      _.transform(shared.content.pets, function(m,v,k){ m[k] = Boolean; }),
      // Then add quest pets
      _.transform(shared.content.questPets, function(m,v,k){ m[k] = Boolean; }),
      // Then add additional pets (backer, contributor)
      _.transform(shared.content.specialMounts, function(m,v,k){ m[k] = Boolean; })
    ),
    currentMount: String,

    // Quests: {
    //  'boss_0': 0, // 0 indicates "doesn't own"
    //  'collection_honey': 5 // Number indicates "stacking"
    // }
    quests: _.transform(shared.content.quests, function(m,v,k){ m[k] = Number; }),

    lastDrop: {
      date: {type: Date, 'default': Date.now},
      count: {type: Number, 'default': 0}
    }
  },

  lastCron: {type: Date, 'default': Date.now},

  // {GROUP_ID: Boolean}, represents whether they have unseen chat messages
  newMessages: {type: Schema.Types.Mixed, 'default': {}},

  party: {
    // id // FIXME can we use a populated doc instead of fetching party separate from user?
    order: {type:String, 'default':'level'},
    orderAscending: {type:String, 'default':'ascending'},
    quest: {
      key: String,
      progress: {
        up: {type: Number, 'default': 0},
        down: {type: Number, 'default': 0},
        collect: {type: Schema.Types.Mixed, 'default': {}} // {feather:1, ingot:2}
      },
      completed: String // When quest is done, we move it from key => completed, and it's a one-time flag (for modal) that they unset by clicking "ok" in browser
    }
  },
  preferences: {
    armorSet: String,
    dayStart: {type:Number, 'default': 0, min: 0, max: 23},
    size: {type:String, enum: ['broad','slim'], 'default': 'slim'},
    hair: {
      color: {type: String, 'default': 'red'},
      base: {type: Number, 'default': 3},
      bangs: {type: Number, 'default': 1},
      beard: {type: Number, 'default': 0},
      mustache: {type: Number, 'default': 0},
      flower: {type: Number, 'default': 1}
    },
    hideHeader: {type:Boolean, 'default':false},
    skin: {type:String, 'default':'915533'},
    shirt: {type: String, 'default': 'blue'},
    timezoneOffset: Number,
    sound: {type:String, 'default':'off', enum: ['off','danielTheBard', 'wattsTheme']},
    language: String,
    automaticAllocation: Boolean,
    allocationMode: {type:String, enum: ['flat','classbased','taskbased'], 'default': 'flat'},
    costume: Boolean,
    dateFormat: {type: String, enum:['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'], 'default': 'MM/dd/yyyy'},
    sleep: {type: Boolean, 'default': false},
    stickyHeader: {type: Boolean, 'default': true},
    disableClasses: {type: Boolean, 'default': false},
    newTaskEdit: {type: Boolean, 'default': false},
    dailyDueDefaultView: {type: Boolean, 'default': false},
    tagsCollapsed: {type: Boolean, 'default': false},
    advancedCollapsed: {type: Boolean, 'default': false},
    toolbarCollapsed: {type:Boolean, 'default':false},
    background: String,
    webhooks: {type: Schema.Types.Mixed, 'default': {}},
    // For this fields make sure to use strict comparison when searching for falsey values (=== false)
    // As users who didn't login after these were introduced may have them undefined/null
    emailNotifications: {
      unsubscribeFromAll: {type: Boolean, 'default': false},
      newPM: {type: Boolean, 'default': true},
      kickedGroup: {type: Boolean, 'default': true},
      wonChallenge: {type: Boolean, 'default': true},
      giftedGems: {type: Boolean, 'default': true},
      giftedSubscription: {type: Boolean, 'default': true},
      invitedParty: {type: Boolean, 'default': true},
      invitedGuild: {type: Boolean, 'default': true},
      questStarted: {type: Boolean, 'default': true},
      invitedQuest: {type: Boolean, 'default': true},
      //remindersToLogin: {type: Boolean, 'default': true},
      // Those importantAnnouncements are in fact the recapture emails
      importantAnnouncements: {type: Boolean, 'default': true},
      weeklyRecaps: {type: Boolean, 'default': true}
    }
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
      str: {type: Number, 'default': 0},
      int: {type: Number, 'default': 0},
      per: {type: Number, 'default': 0},
      con: {type: Number, 'default': 0},
      stealth: {type: Number, 'default': 0},
      streaks: {type: Boolean, 'default': false},
      snowball: {type: Boolean, 'default': false},
      spookDust: {type: Boolean, 'default': false},
      shinySeed: {type: Boolean, 'default': false}
    },
    training: {
      int: {type: Number, 'default': 0},
      per: {type: Number, 'default': 0},
      str: {type: Number, 'default': 0},
      con: {type: Number, 'default': 0}
    }
  },

  tags: {type: [{
    _id: false,
    id: { type: String, 'default': shared.uuid },
    name: String,
    challenge: String
  }]},

  challenges: [{type: 'String', ref:'Challenge'}],

  inbox: {
    newMessages: {type:Number, 'default':0},
    blocks: {type:Array, 'default':[]},
    messages: {type:Schema.Types.Mixed, 'default':{}}, //reflist
    optOut: {type:Boolean, 'default':false}
  },

  habits:   {type:[TaskSchemas.HabitSchema]},
  dailys:   {type:[TaskSchemas.DailySchema]},
  todos:    {type:[TaskSchemas.TodoSchema]},
  rewards:  {type:[TaskSchemas.RewardSchema]},

  extra: Schema.Types.Mixed

}, {
  strict: true,
  minimize: false // So empty objects are returned
});

UserSchema.methods.deleteTask = function(tid) {
  this.ops.deleteTask({params:{id:tid}},function(){}); // TODO remove this whole method, since it just proxies, and change all references to this method
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
    var self = this;
    _.each(['habits', 'dailys', 'todos', 'rewards', 'tags'], function(taskType){
      self[taskType] = _.map(shared.content.userDefaults[taskType], function(task){
        var newTask = _.cloneDeep(task);

        // Render task's text and notes in user's language
        if(taskType === 'tags'){
          // tasks automatically get id=helpers.uuid() from TaskSchema id.default, but tags are Schema.Types.Mixed - so we need to manually invoke here
          newTask.id = shared.uuid();
          newTask.name = newTask.name(self.preferences.language);
        }else{
          newTask.text = newTask.text(self.preferences.language);
          newTask.notes = newTask.notes(self.preferences.language);

          if(newTask.checklist){
            newTask.checklist = _.map(newTask.checklist, function(checklistItem){
              checklistItem.text = checklistItem.text(self.preferences.language);
              return checklistItem;
            });
          }
        }

        return newTask;
      });
    });
  }

  //this.markModified('tasks');
  if (_.isNaN(this.preferences.dayStart) || this.preferences.dayStart < 0 || this.preferences.dayStart > 23) {
    this.preferences.dayStart = 0;
  }

  if (!this.profile.name) {
    var fb = this.auth.facebook;
    this.profile.name =
      (this.auth.local && this.auth.local.username) ||
      (fb && (fb.displayName || fb.name || fb.username || (fb.first_name && fb.first_name + ' ' + fb.last_name))) ||
      'Anonymous';
  }

  // Determines if Beast Master should be awarded
  var petCount = shared.countPets(_.reduce(this.items.pets,function(m,v){
    //HOTFIX - Remove when solution is found, the first argument passed to reduce is a function
    if(_.isFunction(v)) return m;
    return m+(v?1:0)},0), this.items.pets);

  if (petCount >= 90 || this.achievements.beastMasterCount > 0) {
    this.achievements.beastMaster = true
  }

  // Determines if Mount Master should be awarded
  var mountCount = shared.countMounts(_.reduce(this.items.mounts,function(m,v){
    //HOTFIX - Remove when solution is found, the first argument passed to reduce is a function
    if(_.isFunction(v)) return m;
    return m+(v?1:0)},0), this.items.mounts);

  if (mountCount >= 90 || this.achievements.mountMasterCount > 0) {
    this.achievements.mountMaster = true
  }

  // Determines if Triad Bingo should be awarded

  var triadCount = shared.countTriad(this.items.pets);

  if ((mountCount >= 90 && triadCount >= 90) || this.achievements.triadBingoCount > 0) {
    this.achievements.triadBingo = true;
  }

  // EXAMPLE CODE for allowing all existing and new players to be
  // automatically granted an item during a certain time period:
  // if (!this.items.pets['JackOLantern-Base'] && moment().isBefore('2014-11-01'))
    // this.items.pets['JackOLantern-Base'] = 5;

  //our own version incrementer
  if (_.isNaN(this._v) || !_.isNumber(this._v)) this._v = 0;
  this._v++;

  next();
});

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

mongoose.model("User")
  .find({'contributor.admin':true})
  .sort('-contributor.level -backer.npc profile.name')
  .select('profile contributor backer')
  .exec(function(err,mods){
    module.exports.mods = mods
});
