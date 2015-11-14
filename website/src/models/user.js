// User schema and model
import mongoose from 'mongoose';
import shared from '../../../common';
import _ from 'lodash';
import moment from 'moment';
import TaskSchemas from './task';
// import {model as Challenge} from './challenge';

let Schema = mongoose.Schema;

// User schema definition
export let schema = new Schema({
  // The user _id, stored as a string
  // TODO validation
  _id: {
    type: String,
    default: shared.uuid,
  },
  // TODO validation
  apiToken: {
    type: String,
    default: shared.uuid,
  },

  auth: {
    blocked: Boolean,
    facebook: Schema.Types.Mixed, // TODO validate
    local: {
      email: String,
      hashed_password: String, // eslint-disable-line camelcase
      salt: String,
      username: String,
      // Store a lowercase version of username to check for duplicates
      lowerCaseUsername: String,
    },
    timestamps: {
      created: {type: Date, default: Date.now},
      loggedin: {type: Date, default: Date.now},
    },
  },

  // We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  // have been updated (http://goo.gl/gQLz41), but we want *every* update
  _v: { type: Number, default: 0 },

  achievements: {
    originalUser: Boolean,
    habitSurveys: Number,
    ultimateGearSets: Schema.Types.Mixed, // TODO remove, use dictionary?
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
    seafoam: Number,
    streak: Number,
    challenges: Array,
    quests: Schema.Types.Mixed, // TODO remove, use dictionary?
    rebirths: Number,
    rebirthLevel: Number,
    perfect: Number,
    habitBirthdays: Number,
    valentine: Number,
    costumeContest: Boolean,
    nye: Number,
    habiticaDays: Number,
    greeting: Number,
    thankyou: Number,
  },

  backer: {
    tier: Number,
    npc: String,
    tokensApplied: Boolean,
  },

  contributor: {
    // 1-9, see https://trello.com/c/wkFzONhE/277-contributor-gear https://github.com/HabitRPG/habitrpg/issues/3801
    // TODO validate
    level: Number,
    admin: Boolean,
    sudo: Boolean,
    // Artisan, Friend, Blacksmith, etc
    text: String,
    // a markdown textarea to list their contributions + links
    contributions: String,
    critical: String,
  },

  balance: {type: Number, default: 0},
  filters: {type: Schema.Types.Mixed, default: {}}, // TODO dictionary

  purchased: {
    ads: {type: Boolean, default: false},
    // eg, {skeleton: true, pumpkin: true, eb052b: true}
    // TODO dictionary
    skin: {type: Schema.Types.Mixed, default: {}},
    hair: {type: Schema.Types.Mixed, default: {}},
    shirt: {type: Schema.Types.Mixed, default: {}},
    background: {type: Schema.Types.Mixed, default: {}},
    txnCount: {type: Number, default: 0},
    mobileChat: Boolean,
    plan: {
      planId: String,
      paymentMethod: String, // enum: ['Paypal','Stripe', 'Gift', 'Amazon Payments', '']}
      customerId: String, // Billing Agreement Id in case of Amazon Payments
      dateCreated: Date,
      dateTerminated: Date,
      dateUpdated: Date,
      extraMonths: {type: Number, default: 0},
      gemsBought: {type: Number, default: 0},
      mysteryItems: {type: Array, default: []},
      lastBillingDate: Date, // Used only for Amazon Payments to keep track of billing date
      consecutive: {
        count: {type: Number, default: 0},
        offset: {type: Number, default: 0}, // when gifted subs, offset++ for each month. offset-- each new-month (cron). count doesn't ++ until offset==0
        gemCapExtra: {type: Number, default: 0},
        trinkets: {type: Number, default: 0},
      },
    },
  },

  flags: {
    customizationsNotification: {type: Boolean, default: false},
    showTour: {type: Boolean, default: true},
    tour: {
      // -1 indicates "uninitiated", -2 means "complete", any other number is the current tour step (0-index)
      intro: {type: Number, default: -1},
      classes: {type: Number, default: -1},
      stats: {type: Number, default: -1},
      tavern: {type: Number, default: -1},
      party: {type: Number, default: -1},
      guilds: {type: Number, default: -1},
      challenges: {type: Number, default: -1},
      market: {type: Number, default: -1},
      pets: {type: Number, default: -1},
      mounts: {type: Number, default: -1},
      hall: {type: Number, default: -1},
      equipment: {type: Number, default: -1},
    },
    tutorial: {
      common: {
        habits: {type: Boolean, default: false},
        dailies: {type: Boolean, default: false},
        todos: {type: Boolean, default: false},
        rewards: {type: Boolean, default: false},
        party: {type: Boolean, default: false},
        pets: {type: Boolean, default: false},
        gems: {type: Boolean, default: false},
        skills: {type: Boolean, default: false},
        classes: {type: Boolean, default: false},
        tavern: {type: Boolean, default: false},
        equipment: {type: Boolean, default: false},
        items: {type: Boolean, default: false},
        inviteParty: {type: Boolean, default: false},
      },
      ios: {
        addTask: {type: Boolean, default: false},
        editTask: {type: Boolean, default: false},
        deleteTask: {type: Boolean, default: false},
        filterTask: {type: Boolean, default: false},
        groupPets: {type: Boolean, default: false},
      },
    },
    dropsEnabled: {type: Boolean, default: false},
    itemsEnabled: {type: Boolean, default: false},
    newStuff: {type: Boolean, default: false},
    rewrite: {type: Boolean, default: true},
    contributor: Boolean,
    classSelected: {type: Boolean, default: false},
    mathUpdates: Boolean,
    rebirthEnabled: {type: Boolean, default: false},
    levelDrops: {type: Schema.Types.Mixed, default: {}},
    chatRevoked: Boolean,
    // Used to track the status of recapture emails sent to each user,
    // can be 0 - no email sent - 1, 2, 3 or 4 - 4 means no more email will be sent to the user
    recaptureEmailsPhase: {type: Number, default: 0},
    // Needed to track the tip to send inside the email
    weeklyRecapEmailsPhase: {type: Number, default: 0},
    // Used to track when the next weekly recap should be sent
    lastWeeklyRecap: {type: Date, default: Date.now},
    // Used to enable weekly recap emails as users login
    lastWeeklyRecapDiscriminator: Boolean,
    communityGuidelinesAccepted: {type: Boolean, default: false},
    cronCount: {type: Number, default: 0},
    welcomed: {type: Boolean, default: false},
    armoireEnabled: {type: Boolean, default: false},
    armoireOpened: {type: Boolean, default: false},
    armoireEmpty: {type: Boolean, default: false},
    cardReceived: {type: Boolean, default: false},
    warnedLowHealth: {type: Boolean, default: false},
  },

  history: {
    // TODO absolutely preen these for everyone
    exp: Array, // [{date: Date, value: Number}], // big peformance issues if these are defined
    todos: Array, // [{data: Date, value: Number}] // big peformance issues if these are defined
  },

  invitations: {
    guilds: {type: Array, default: []},
    party: Schema.Types.Mixed, // TODO dictionary
  },

  items: {
    gear: {
      owned: _.transform(shared.content.gear.flat, (m, v) => {
        m[v.key] = {type: Boolean};
        if (v.key.match(/[armor|head|shield]_warrior_0/)) {
          m[v.key].default = true;
        }
      }),

      equipped: {
        weapon: String,
        armor: {type: String, default: 'armor_base_0'},
        head: {type: String, default: 'head_base_0'},
        shield: {type: String, default: 'shield_base_0'},
        back: String,
        headAccessory: String,
        eyewear: String,
        body: String,
      },
      costume: {
        weapon: String,
        armor: {type: String, default: 'armor_base_0'},
        head: {type: String, default: 'head_base_0'},
        shield: {type: String, default: 'shield_base_0'},
        back: String,
        headAccessory: String,
        eyewear: String,
        body: String,
      },
    },

    special: {
      snowball: {type: Number, default: 0},
      spookDust: {type: Number, default: 0},
      shinySeed: {type: Number, default: 0},
      seafoam: {type: Number, default: 0},
      valentine: Number,
      valentineReceived: Array, // array of strings, by sender name
      nye: Number,
      nyeReceived: Array,
      greeting: Number,
      greetingReceived: Array,
      thankyou: Number,
      thankyouReceived: Array,
    },

    // -------------- Animals -------------------
    // Complex bit here. The result looks like:
    // pets: {
    //   'Wolf-Desert': 0, // 0 means does not own
    //   'PandaCub-Red': 10, // Number represents "Growth Points"
    //   etc...
    // }
    pets: _.defaults(
      // First transform to a 1D eggs/potions mapping
      _.transform(shared.content.pets, (m, v, k) => m[k] = Number),
      // Then add additional pets (quest, backer, contributor, premium)
      _.transform(shared.content.questPets, (m, v, k) => m[k] = Number),
      _.transform(shared.content.specialPets, (m, v, k) => m[k] = Number),
      _.transform(shared.content.premiumPets, (m, v, k) => m[k] = Number)
    ),
    currentPet: String, // Cactus-Desert

    // eggs: {
    //  'PandaCub': 0, // 0 indicates "doesn't own"
    //  'Wolf': 5 // Number indicates "stacking"
    // }
    eggs: _.transform(shared.content.eggs, (m, v, k) => m[k] = Number),

    // hatchingPotions: {
    //  'Desert': 0, // 0 indicates "doesn't own"
    //  'CottonCandyBlue': 5 // Number indicates "stacking"
    // }
    hatchingPotions: _.transform(shared.content.hatchingPotions, (m, v, k) => m[k] = Number),

    // Food: {
    //  'Watermelon': 0, // 0 indicates "doesn't own"
    //  'RottenMeat': 5 // Number indicates "stacking"
    // }
    food: _.transform(shared.content.food, (m, v, k) => m[k] = Number),

    // mounts: {
    //  'Wolf-Desert': true,
    //  'PandaCub-Red': false,
    //  etc...
    // }
    mounts: _.defaults(
      // First transform to a 1D eggs/potions mapping
      _.transform(shared.content.pets, (m, v, k) => m[k] = Boolean),
      // Then add quest and premium pets
      _.transform(shared.content.questPets, (m, v, k) => m[k] = Boolean),
      _.transform(shared.content.premiumPets, (m, v, k) => m[k] = Boolean),
      // Then add additional mounts (backer, contributor)
      _.transform(shared.content.specialMounts, (m, v, k) => m[k] = Boolean)
    ),
    currentMount: String,

    // Quests: {
    //  'boss_0': 0, // 0 indicates "doesn't own"
    //  'collection_honey': 5 // Number indicates "stacking"
    // }
    quests: _.transform(shared.content.quests, (m, v, k) => m[k] = Number),

    lastDrop: {
      date: {type: Date, default: Date.now},
      count: {type: Number, default: 0},
    },
  },

  lastCron: {type: Date, default: Date.now},

  // {GROUP_ID: Boolean}, represents whether they have unseen chat messages
  newMessages: {type: Schema.Types.Mixed, default: {}},

  party: {
    // id // FIXME can we use a populated doc instead of fetching party separate from user?
    order: {type: String, default: 'level'},
    orderAscending: {type: String, default: 'ascending'},
    quest: {
      key: String,
      progress: {
        up: {type: Number, default: 0},
        down: {type: Number, default: 0},
        collect: {type: Schema.Types.Mixed, default: {}}, // {feather:1, ingot:2}
      },
      completed: String, // When quest is done, we move it from key => completed, and it's a one-time flag (for modal) that they unset by clicking "ok" in browser
      RSVPNeeded: {type: Boolean, default: false}, // Set to true when invite is pending, set to false when quest invite is accepted or rejected, quest starts, or quest is cancelled
    },
  },
  preferences: {
    dayStart: {type: Number, default: 0, min: 0, max: 23},
    size: {type: String, enum: ['broad', 'slim'], default: 'slim'},
    hair: {
      color: {type: String, default: 'red'},
      base: {type: Number, default: 3},
      bangs: {type: Number, default: 1},
      beard: {type: Number, default: 0},
      mustache: {type: Number, default: 0},
      flower: {type: Number, default: 1},
    },
    hideHeader: {type: Boolean, default: false},
    skin: {type: String, default: '915533'},
    shirt: {type: String, default: 'blue'},
    timezoneOffset: Number,
    sound: {type: String, default: 'off', enum: ['off', 'danielTheBard', 'gokulTheme', 'luneFoxTheme', 'wattsTheme']},
    language: String,
    automaticAllocation: Boolean,
    allocationMode: {type: String, enum: ['flat', 'classbased', 'taskbased'], default: 'flat'},
    autoEquip: {type: Boolean, default: true},
    costume: Boolean,
    dateFormat: {type: String, enum: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'], default: 'MM/dd/yyyy'},
    sleep: {type: Boolean, default: false},
    stickyHeader: {type: Boolean, default: true},
    disableClasses: {type: Boolean, default: false},
    newTaskEdit: {type: Boolean, default: false},
    dailyDueDefaultView: {type: Boolean, default: false},
    tagsCollapsed: {type: Boolean, default: false},
    advancedCollapsed: {type: Boolean, default: false},
    toolbarCollapsed: {type: Boolean, default: false},
    background: String,
    displayInviteToPartyWhenPartyIs1: {type: Boolean, default: true},
    webhooks: {type: Schema.Types.Mixed, default: {}},
    // For the following fields make sure to use strict comparison when searching for falsey values (=== false)
    // As users who didn't login after these were introduced may have them undefined/null
    emailNotifications: {
      unsubscribeFromAll: {type: Boolean, default: false},
      newPM: {type: Boolean, default: true},
      kickedGroup: {type: Boolean, default: true},
      wonChallenge: {type: Boolean, default: true},
      giftedGems: {type: Boolean, default: true},
      giftedSubscription: {type: Boolean, default: true},
      invitedParty: {type: Boolean, default: true},
      invitedGuild: {type: Boolean, default: true},
      questStarted: {type: Boolean, default: true},
      invitedQuest: {type: Boolean, default: true},
      // remindersToLogin: {type: Boolean, default: true},
      // importantAnnouncements are in fact the recapture emails
      importantAnnouncements: {type: Boolean, default: true},
      weeklyRecaps: {type: Boolean, default: true},
    },
    suppressModals: {
      levelUp: {type: Boolean, default: false},
      hatchPet: {type: Boolean, default: false},
      raisePet: {type: Boolean, default: false},
      streak: {type: Boolean, default: false},
    },
  },
  profile: {
    blurb: String,
    imageUrl: String,
    name: String,
  },
  stats: {
    hp: {type: Number, default: shared.maxHealth},
    mp: {type: Number, default: 10},
    exp: {type: Number, default: 0},
    gp: {type: Number, default: 0},
    lvl: {type: Number, default: 1},

    // Class System
    class: {type: String, enum: ['warrior', 'rogue', 'wizard', 'healer'], default: 'warrior'},
    points: {type: Number, default: 0},
    str: {type: Number, default: 0},
    con: {type: Number, default: 0},
    int: {type: Number, default: 0},
    per: {type: Number, default: 0},
    buffs: {
      str: {type: Number, default: 0},
      int: {type: Number, default: 0},
      per: {type: Number, default: 0},
      con: {type: Number, default: 0},
      stealth: {type: Number, default: 0},
      streaks: {type: Boolean, default: false},
      snowball: {type: Boolean, default: false},
      spookDust: {type: Boolean, default: false},
      shinySeed: {type: Boolean, default: false},
      seafoam: {type: Boolean, default: false},
    },
    training: {
      int: {type: Number, default: 0},
      per: {type: Number, default: 0},
      str: {type: Number, default: 0},
      con: {type: Number, default: 0},
    },
  },

  tags: {type: [{
    _id: false,
    id: {type: String, default: shared.uuid},
    name: String,
    challenge: String,
  }]},

  challenges: [{type: String, ref: 'Challenge'}],

  inbox: {
    newMessages: {type: Number, default: 0},
    blocks: {type: Array, default: []},
    messages: {type: Schema.Types.Mixed, default: {}},
    optOut: {type: Boolean, default: false},
  },

  habits: {type: [TaskSchemas.HabitSchema]},
  dailys: {type: [TaskSchemas.DailySchema]},
  todos: {type: [TaskSchemas.TodoSchema]},
  rewards: {type: [TaskSchemas.RewardSchema]},

  extra: Schema.Types.Mixed,

  pushDevices: {
    type: [{
      regId: {type: String},
      type: {type: String},
    }],
    default: [],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.methods.deleteTask = function deleteTask (tid) {
  this.ops.deleteTask({params: {id: tid}}, () => {}); // TODO remove this whole method, since it just proxies, and change all references to this method
};

schema.methods.toJSON = function toJSON () {
  let doc = this.toObject();

  doc.id = doc._id;

  // FIXME? Is this a reference to `doc.filters` or just disabled code? Remove?
  doc.filters = {};
  doc._tmp = this._tmp; // be sure to send down drop notifs

  return doc;
};

// schema.virtual('tasks').get(function () {
//   var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
//   var tasks = _.object(_.pluck(tasks,'id'), tasks);
//   return tasks;
// });

schema.post('init', function postInitUser (doc) {
  shared.wrap(doc);
});

function _populateDefaultTasks (user, taskTypes) {
  _.each(taskTypes, (taskType) => {
    user[taskType] = _.map(shared.content.userDefaults[taskType], (task) => {
      let newTask = _.cloneDeep(task);

      // Render task's text and notes in user's language
      if (taskType === 'tags') {
        // tasks automatically get id=helpers.uuid() from TaskSchema id.default, but tags are Schema.Types.Mixed - so we need to manually invoke here
        newTask.id = shared.uuid();
        newTask.name = newTask.name(user.preferences.language);
      } else {
        newTask.text = newTask.text(user.preferences.language);
        if (newTask.notes) {
          newTask.notes = newTask.notes(user.preferences.language);
        }

        if (newTask.checklist) {
          newTask.checklist = _.map(newTask.checklist, (checklistItem) => {
            checklistItem.text = checklistItem.text(user.preferences.language);
            return checklistItem;
          });
        }
      }

      return newTask;
    });
  });
}

function _populateDefaultsForNewUser (user) {
  let taskTypes;

  if (user.registeredThrough === 'habitica-web') {
    taskTypes = ['habits', 'dailys', 'todos', 'rewards', 'tags'];

    let tutorialCommonSections = [
      'habits',
      'dailies',
      'todos',
      'rewards',
      'party',
      'pets',
      'gems',
      'skills',
      'classes',
      'tavern',
      'equipment',
      'items',
      'inviteParty',
    ];

    _.each(tutorialCommonSections, (section) => {
      user.flags.tutorial.common[section] = true;
    });
  } else {
    taskTypes = ['todos', 'tags'];

    user.flags.showTour = false;

    let tourSections = [
      'showTour',
      'intro',
      'classes',
      'stats',
      'tavern',
      'party',
      'guilds',
      'challenges',
      'market',
      'pets',
      'mounts',
      'hall',
      'equipment',
    ];

    _.each(tourSections, (section) => {
      user.flags.tour[section] = -2;
    });
  }

  _populateDefaultTasks(user, taskTypes);
}

function _setProfileName (user) {
  let fb = user.auth.facebook;

  let localUsername = user.auth.local && user.auth.local.username;
  let facebookUsername = fb && (fb.displayName || fb.name || fb.username || `${fb.first_name && fb.first_name} ${fb.last_name}`);
  let anonymous = 'Anonymous';

  return localUsername || facebookUsername || anonymous;
}

schema.pre('save', function postSaveUser (next) {
  // Populate new users with default content
  if (this.isNew) {
    _populateDefaultsForNewUser(this);
  }

  // this.markModified('tasks');
  if (_.isNaN(this.preferences.dayStart) || this.preferences.dayStart < 0 || this.preferences.dayStart > 23) {
    this.preferences.dayStart = 0;
  }

  if (!this.profile.name) {
    this.profile.name = _setProfileName(this);
  }

  // Determines if Beast Master should be awarded
  let beastMasterProgress = shared.count.beastMasterProgress(this.items.pets);

  if (beastMasterProgress >= 90 || this.achievements.beastMasterCount > 0) {
    this.achievements.beastMaster = true;
  }

  // Determines if Mount Master should be awarded
  let mountMasterProgress = shared.count.mountMasterProgress(this.items.mounts);

  if (mountMasterProgress >= 90 || this.achievements.mountMasterCount > 0) {
    this.achievements.mountMaster = true;
  }

  // Determines if Triad Bingo should be awarded

  let dropPetCount = shared.count.dropPetsCurrentlyOwned(this.items.pets);
  let qualifiesForTriad = dropPetCount >= 90 && mountMasterProgress >= 90;

  if (qualifiesForTriad || this.achievements.triadBingoCount > 0) {
    this.achievements.triadBingo = true;
  }

  // Enable weekly recap emails for old users who sign in
  if (this.flags.lastWeeklyRecapDiscriminator) {
    // Enable weekly recap emails in 24 hours
    this.flags.lastWeeklyRecap = moment().subtract(6, 'days').toDate();
    // Unset the field so this is run only once
    this.flags.lastWeeklyRecapDiscriminator = undefined;
  }

  // EXAMPLE CODE for allowing all existing and new players to be
  // automatically granted an item during a certain time period:
  // if (!this.items.pets['JackOLantern-Base'] && moment().isBefore('2014-11-01'))
  // this.items.pets['JackOLantern-Base'] = 5;

  // our own version incrementer
  if (_.isNaN(this._v) || !_.isNumber(this._v)) this._v = 0;
  this._v++;

  next();
});

schema.methods.unlink = function unlink (options, cb) {
  let cid = options.cid;
  let keep = options.keep;
  let tid = options.tid;

  if (!cid) {
    return cb('Could not remove challenge tasks. Please delete them manually.');
  }

  let self = this;

  if (keep === 'keep') {
    self.tasks[tid].challenge = {};
  } else if (keep === 'remove') {
    self.deleteTask(tid);
  } else if (keep === 'keep-all') {
    _.each(self.tasks, (t) => {
      if (t.challenge && t.challenge.id === cid) {
        t.challenge = {};
      }
    });
  } else if (keep === 'remove-all') {
    _.each(self.tasks, (t) => {
      if (t.challenge && t.challenge.id === cid) {
        self.deleteTask(t.id);
      }
    });
  }

  self.markModified('habits');
  self.markModified('dailys');
  self.markModified('todos');
  self.markModified('rewards');
  self.save(cb);
};

export let model = mongoose.model('User', schema);

// Initially export an empty object so external requires will get
// the right object by reference when it's defined later
// Otherwise it would remain undefined if requested before the query executes
export let mods = [];

mongoose.model('User')
  .find({'contributor.admin': true})
  .sort('-contributor.level -backer.npc profile.name')
  .select('profile contributor backer')
  .exec()
  .then((foundMods) => {
    // Using push to maintain the reference to mods
    mods.push(...foundMods);
  }, (err) => { // TODO replace with .catch which for some reason was throwing an error
    throw err; // TODO ?
  });
