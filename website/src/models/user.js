import mongoose from 'mongoose';
import shared from '../../../common';
import _ from 'lodash';
import validator from 'validator';
import moment from 'moment';
import * as Tasks from './task';
import Q from 'q';
import { schema as TagSchema } from './tag';
import { removeFromArray } from '../libs/api-v3/collectionManipulators';
import baseModel from '../libs/api-v3/baseModel';
// import {model as Challenge} from './challenge';

let Schema = mongoose.Schema;

// User schema definition
export let schema = new Schema({
  apiToken: {
    type: String,
    default: shared.uuid,
  },

  auth: {
    blocked: Boolean,
    facebook: {type: Schema.Types.Mixed, default: {}}, // TODO validate, IMPORTANT make sure the {} default isn't shared across all user objects
    local: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, shared.i18n.t('invalidEmail')], // TODO translate error messages here, use preferences.language?
      },
      username: {
        type: String,
        trim: true,
      },
      // Store a lowercase version of username to check for duplicates
      lowerCaseUsername: String,
      hashed_password: String, // eslint-disable-line camelcase
      salt: String,
    },
    timestamps: {
      created: {type: Date, default: Date.now},
      loggedin: {type: Date, default: Date.now},
    },
  },
  // We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  // have been updated (http://goo.gl/gQLz41), but we want *every* update
  _v: { type: Number, default: 0 },
  // TODO give all this a default of 0?
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
    perfect: {type: Number, default: 0},
    habitBirthdays: Number,
    valentine: Number,
    costumeContest: Boolean, // Superseded by costumeContests
    nye: Number,
    habiticaDays: Number,
    greeting: Number,
    thankyou: Number,
    costumeContests: Number,
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
      },
      ios: {
        addTask: {type: Boolean, default: false},
        editTask: {type: Boolean, default: false},
        deleteTask: {type: Boolean, default: false},
        filterTask: {type: Boolean, default: false},
        groupPets: {type: Boolean, default: false},
        inviteParty: {type: Boolean, default: false},
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

  // TODO we're storing too many fields here, find a way to reduce them
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
  newMessages: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},

  challenges: [{type: String, ref: 'Challenge', validate: [validator.isUUID, 'Invalid uuid.']}],

  invitations: {
    guilds: {type: Array}, // TODO what are we storing here
    party: Schema.Types.Mixed, // TODO dictionary TODO what are we storing here?
  },

  guilds: [{type: String, ref: 'Group', validate: [validator.isUUID, 'Invalid uuid.']}],

  party: {
    _id: {type: String, validate: [validator.isUUID, 'Invalid uuid.'], ref: 'Group'},
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
    reverseChatOrder: {type: Boolean, default: false},
    background: String,
    displayInviteToPartyWhenPartyIs1: {type: Boolean, default: true},
    webhooks: {type: Schema.Types.Mixed, default: {}}, // TODO array? and proper controller... unless VersionError becomes problematic
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

  tags: [TagSchema],

  inbox: {
    newMessages: {type: Number, default: 0},
    blocks: {type: Array, default: []},
    messages: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    optOut: {type: Boolean, default: false},
  },
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    completedTodos: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
  },
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
  minimize: false, // So empty objects are returned TODO make sure it's in every model
});

schema.plugin(baseModel, {
  // TODO revisit a lot of things are missing. Given how many attributes we do have here we should white-list the ones that can be updated
  noSet: ['_id', 'apiToken', 'auth.blocked', 'auth.timestamps', 'lastCron', 'auth.local.hashed_password',
    'auth.local.salt', 'tasksOrder', 'tags', 'stats', 'challenges', 'guilds', 'party._id', 'party.quest',
    'invitations', 'balance', 'backer', 'contributor'],
  private: ['auth.local.hashed_password', 'auth.local.salt'],
  toJSONTransform: function userToJSON (doc) {
    // FIXME? Is this a reference to `doc.filters` or just disabled code? Remove?
    // TODO this works?
    // doc.filters = {};
    // doc._tmp = this._tmp; // be sure to send down drop notifs

    return doc;
  },
});

// A list of publicly accessible fields (not everything from preferences because there are also a lot of settings tha should remain private)
// TODO is all party data meant to be public?
export let publicFields = `preferences.size preferences.hair preferences.skin preferences.shirt
  preferences.costume preferences.sleep preferences.background profile stats achievements party
  backer contributor auth.timestamps items`;

// The minimum amount of data needed when populating multiple users
export let nameFields = `profile.name`;

schema.post('init', function postInitUser (doc) {
  shared.wrap(doc);
});

function _populateDefaultTasks (user, taskTypes) {
  let tagsI = taskTypes.indexOf('tag');

  if (tagsI !== -1) {
    user.tags = _.map(shared.content.userDefaults.tags, (tag) => {
      let newTag = _.cloneDeep(tag);

      // tasks automatically get _id=helpers.uuid() from TaskSchema id.default, but tags are Schema.Types.Mixed - so we need to manually invoke here
      newTag.id = shared.uuid();
      // Render tag's name in user's language
      newTag.name = newTag.name(user.preferences.language);
      return newTag;
    });
  }

  let tasksToCreate = [];

  if (tagsI !== -1) {
    taskTypes = _.clone(taskTypes);
    taskTypes.splice(tagsI, 1);
  }

  _.each(taskTypes, (taskType) => {
    let tasksOfType = _.map(shared.content.userDefaults[`${taskType}s`], (taskDefaults) => {
      let newTask = new Tasks[taskType](taskDefaults);

      newTask.userId = user._id;
      newTask.text = taskDefaults.text(user.preferences.language);
      if (newTask.notes) newTask.notes = taskDefaults.notes(user.preferences.language);
      if (taskDefaults.checklist) {
        newTask.checklist = _.map(taskDefaults.checklist, (checklistItem) => {
          checklistItem.text = checklistItem.text(user.preferences.language);
          return checklistItem;
        });
      }

      return newTask.save();
    });

    tasksToCreate.push(...tasksOfType); // TODO find better way since this creates each task individually
  });

  return Q.all(tasksToCreate)
    .then((tasksCreated) => {
      _.each(tasksCreated, (task) => {
        user.tasksOrder[`${task.type}s`].push(task._id);
      });
    });
}

function _populateDefaultsForNewUser (user) {
  let taskTypes;
  let iterableFlags = user.flags.toObject();

  if (user.registeredThrough === 'habitica-web' || user.registeredThrough === 'habitica-android') {
    taskTypes = ['habit', 'daily', 'todo', 'reward', 'tag'];

    _.each(iterableFlags.tutorial.common, (val, section) => {
      user.flags.tutorial.common[section] = true;
    });
  } else {
    taskTypes = ['todo', 'tag'];
    user.flags.showTour = false;

    _.each(iterableFlags.tour, (val, section) => {
      user.flags.tour[section] = -2;
    });
  }

  return _populateDefaultTasks(user, taskTypes);
}

function _setProfileName (user) {
  let fb = user.auth.facebook;

  let localUsername = user.auth.local && user.auth.local.username;
  let facebookUsername = fb && (fb.displayName || fb.name || fb.username || `${fb.first_name && fb.first_name} ${fb.last_name}`);
  let anonymous = 'Anonymous';

  return localUsername || facebookUsername || anonymous;
}

schema.pre('save', true, function preSaveUser (next, done) {
  next();

  // TODO remove all unnecessary checks
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

  // Populate new users with default content
  if (this.isNew) {
    _populateDefaultsForNewUser(this)
      .then(() => done())
      .catch(done);
  } else {
    done();
  }
});

// TODO unit test this?
schema.methods.isSubscribed = function isSubscribed () {
  return !!this.purchased.plan.customerId; // eslint-disable-line no-implicit-coercion
};

// Unlink challenges tasks (and the challenge itself) from user
schema.methods.unlinkChallengeTasks = async function unlinkChallengeTasks (challengeId, keep) {
  let user = this;
  let findQuery = {
    userId: user._id,
    'challenge.id': challengeId,
  };

  removeFromArray(user.challenges, challengeId);

  if (keep === 'keep-all') {
    await Tasks.Task.update(findQuery, {
      $set: {challenge: {}}, // TODO what about updatedAt?
    }, {multi: true}).exec();

    await user.save();
  } else { // keep = 'remove-all'
    let tasks = await Tasks.Task.find(findQuery).select('_id type completed').exec();
    let taskPromises = tasks.map(task => {
      // Remove task from user.tasksOrder and delete them
      if (task.type !== 'todo' || !task.completed) {
        removeFromArray(user.tasksOrder[`${task.type}s`], task._id);
      }

      return task.remove();
    });

    taskPromises.push(user.save());
    return Q.all(taskPromises);
  }
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
