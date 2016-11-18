import mongoose from 'mongoose';
import shared from '../../../common';
import _ from 'lodash';
import validator from 'validator';
import { schema as TagSchema } from '../tag';
import { schema as PushDeviceSchema } from '../pushDevice';
import { schema as WebhookSchema } from '../webhook';
import {
  schema as UserNotificationSchema,
} from '../userNotification';

const Schema = mongoose.Schema;

const INVALID_DOMAINS = Object.freeze(['habitica.com', 'habitrpg.com']);

// User schema definition
let schema = new Schema({
  apiToken: {
    type: String,
    default: shared.uuid,
  },

  auth: {
    blocked: Boolean,
    facebook: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    google: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    local: {
      email: {
        type: String,
        validate: [{
          validator: validator.isEmail,
          message: shared.i18n.t('invalidEmail'),
        }, {
          validator (email) {
            let lowercaseEmail = email.toLowerCase();

            return INVALID_DOMAINS.every((domain) => {
              return !lowercaseEmail.endsWith(`@${domain}`);
            });
          },
          message: shared.i18n.t('invalidEmailDomain', { domains: INVALID_DOMAINS.join(', ')}),
        }],
      },
      username: {
        type: String,
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
  migration: String,
  achievements: {
    originalUser: Boolean,
    habitSurveys: Number,
    ultimateGearSets: {
      healer: {type: Boolean, default: false},
      wizard: {type: Boolean, default: false},
      rogue: {type: Boolean, default: false},
      warrior: {type: Boolean, default: false},
    },
    beastMaster: Boolean,
    beastMasterCount: Number,
    mountMaster: Boolean,
    mountMasterCount: Number,
    triadBingo: Boolean,
    triadBingoCount: Number,
    veteran: Boolean,
    snowball: Number,
    spookySparkles: Number,
    shinySeed: Number,
    seafoam: Number,
    streak: Number,
    challenges: Array,
    quests: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
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
    birthday: Number,
    partyUp: Boolean,
    partyOn: Boolean,
  },

  backer: {
    tier: Number,
    npc: String,
    tokensApplied: Boolean,
  },

  contributor: {
    // 1-9, see https://trello.com/c/wkFzONhE/277-contributor-gear https://github.com/HabitRPG/habitrpg/issues/3801
    level: {
      type: Number,
      min: 0,
      max: 9,
    },
    admin: Boolean,
    sudo: Boolean,
    // Artisan, Friend, Blacksmith, etc
    text: String,
    // a markdown textarea to list their contributions + links
    contributions: String,
    critical: String,
  },

  balance: {type: Number, default: 0},

  purchased: {
    ads: {type: Boolean, default: false},
    // eg, {skeleton: true, pumpkin: true, eb052b: true}
    skin: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    hair: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    shirt: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    background: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
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
      mysteryItems: {type: Array, default: () => []},
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
        mounts: {type: Boolean, default: false},
        inbox: {type: Boolean, default: false},
      },
      ios: {
        addTask: {type: Boolean, default: false},
        editTask: {type: Boolean, default: false},
        deleteTask: {type: Boolean, default: false},
        filterTask: {type: Boolean, default: false},
        groupPets: {type: Boolean, default: false},
        inviteParty: {type: Boolean, default: false},
        reorderTask: {type: Boolean, default: false},
      },
    },
    dropsEnabled: {type: Boolean, default: false},
    itemsEnabled: {type: Boolean, default: false},
    newStuff: {type: Boolean, default: false},
    rewrite: {type: Boolean, default: true},
    classSelected: {type: Boolean, default: false},
    mathUpdates: Boolean,
    rebirthEnabled: {type: Boolean, default: false},
    levelDrops: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
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
    exp: Array, // [{date: Date, value: Number}], // big peformance issues if these are defined
    todos: Array, // [{data: Date, value: Number}] // big peformance issues if these are defined
  },

  items: {
    gear: {
      owned: _.transform(shared.content.gear.flat, (m, v) => {
        m[v.key] = {type: Boolean};
        if (v.key.match(/[armor|head|shield]_warrior_0/) || v.gearSet === 'glasses') {
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
      spookySparkles: {type: Number, default: 0},
      shinySeed: {type: Number, default: 0},
      seafoam: {type: Number, default: 0},
      valentine: {type: Number, default: 0},
      valentineReceived: Array, // array of strings, by sender name
      nye: {type: Number, default: 0},
      nyeReceived: Array,
      greeting: {type: Number, default: 0},
      greetingReceived: Array,
      thankyou: {type: Number, default: 0},
      thankyouReceived: Array,
      birthday: {type: Number, default: 0},
      birthdayReceived: Array,
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
  _cronSignature: {type: String, default: 'NOT_RUNNING'}, // Private property used to avoid double cron

  // {GROUP_ID: Boolean}, represents whether they have unseen chat messages
  newMessages: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},

  challenges: [{type: String, ref: 'Challenge', validate: [validator.isUUID, 'Invalid uuid.']}],

  invitations: {
    // Using an array without validation because otherwise mongoose treat this as a subdocument and applies _id by default
    // Schema is (id, name, inviter)
    // TODO one way to fix is http://mongoosejs.com/docs/guide.html#_id
    guilds: {type: Array, default: () => []},
    // Using a Mixed type because otherwise user.invitations.party = {} // to reset invitation, causes validation to fail TODO
    // schema is the same as for guild invitations (id, name, inviter)
    party: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
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
        collect: {type: Schema.Types.Mixed, default: () => {
          return {};
        }},
        collectedItems: {type: Number, default: 0},
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
    timezoneOffset: {type: Number, default: 0},
    sound: {type: String, default: 'rosstavoTheme', enum: ['off', 'danielTheBard', 'gokulTheme', 'luneFoxTheme', 'wattsTheme', 'rosstavoTheme', 'dewinTheme']},
    chair: {type: String, default: 'none'},
    timezoneOffsetAtLastCron: Number,
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
    webhooks: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
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
    pushNotifications: {
      unsubscribeFromAll: {type: Boolean, default: false},
      newPM: {type: Boolean, default: true},
      wonChallenge: {type: Boolean, default: true},
      giftedGems: {type: Boolean, default: true},
      giftedSubscription: {type: Boolean, default: true},
      invitedParty: {type: Boolean, default: true},
      invitedGuild: {type: Boolean, default: true},
      questStarted: {type: Boolean, default: true},
      invitedQuest: {type: Boolean, default: true},
    },
    suppressModals: {
      levelUp: {type: Boolean, default: false},
      hatchPet: {type: Boolean, default: false},
      raisePet: {type: Boolean, default: false},
      streak: {type: Boolean, default: false},
    },
    improvementCategories: {
      type: Array,
      validate: (categories) => {
        const validCategories = ['work', 'exercise', 'healthWellness', 'school', 'teams', 'chores', 'creativity'];
        let isValidCategory = categories.every(category => validCategories.indexOf(category) !== -1);
        return isValidCategory;
      },
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
    class: {type: String, enum: ['warrior', 'rogue', 'wizard', 'healer'], default: 'warrior', required: true},
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
      spookySparkles: {type: Boolean, default: false},
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

  notifications: [UserNotificationSchema],
  tags: [TagSchema],

  inbox: {
    newMessages: {type: Number, default: 0},
    blocks: {type: Array, default: () => []},
    messages: {type: Schema.Types.Mixed, default: () => {
      return {};
    }},
    optOut: {type: Boolean, default: false},
  },
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
  },
  extra: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},
  pushDevices: [PushDeviceSchema],
  _ABtest: {type: String},
  webhooks: [WebhookSchema],
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

module.exports = schema;
