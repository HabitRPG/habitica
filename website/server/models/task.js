import mongoose from 'mongoose';
import shared from '../../../common';
import validator from 'validator';
import moment from 'moment';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';
import { preenHistory } from '../libs/api-v3/preening';

const Schema = mongoose.Schema;

let discriminatorOptions = {
  discriminatorKey: 'type', // the key that distinguishes task types
};
let subDiscriminatorOptions = _.defaults(_.cloneDeep(discriminatorOptions), {
  _id: false,
  minimize: false, // So empty objects are returned
});

export let tasksTypes = ['habit', 'daily', 'todo', 'reward'];

// Important
// When something changes here remember to update the client side model at common/script/libs/taskDefaults
export let TaskSchema = new Schema({
  _legacyId: String, // TODO Remove when v2 is deprecated
  type: {type: String, enum: tasksTypes, required: true, default: tasksTypes[0]},
  text: {type: String, required: true},
  notes: {type: String, default: ''},
  tags: [{
    type: String,
    validate: [validator.isUUID, 'Invalid uuid.'],
  }],
  value: {type: Number, default: 0, required: true}, // redness or cost for rewards Required because it must be settable (for rewards)
  priority: {
    type: Number,
    default: 1,
    required: true,
    validate: [
      (val) => [0.1, 1, 1.5, 2].indexOf(val) !== -1,
      'Valid priority values are 0.1, 1, 1.5, 2.',
    ],
  },
  attribute: {type: String, default: 'str', enum: ['str', 'con', 'int', 'per']},
  userId: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.']}, // When not set it belongs to a challenge

  challenge: {
    id: {type: String, ref: 'Challenge', validate: [validator.isUUID, 'Invalid uuid.']}, // When set (and userId not set) it's the original task
    taskId: {type: String, ref: 'Task', validate: [validator.isUUID, 'Invalid uuid.']}, // When not set but challenge.id defined it's the original task
    broken: {type: String, enum: ['CHALLENGE_DELETED', 'TASK_DELETED', 'UNSUBSCRIBED', 'CHALLENGE_CLOSED', 'CHALLENGE_TASK_NOT_FOUND']}, // CHALLENGE_TASK_NOT_FOUND comes from v3 migration
    winner: String, // user.profile.name of the winner
  },

  reminders: [{
    _id: false,
    id: {type: String, validate: [validator.isUUID, 'Invalid uuid.'], default: shared.uuid, required: true},
    startDate: {type: Date},
    time: {type: Date, required: true},
  }],
}, _.defaults({
  minimize: false, // So empty objects are returned
  strict: true,
}, discriminatorOptions));

TaskSchema.plugin(baseModel, {
  noSet: ['challenge', 'userId', 'completed', 'history', 'dateCompleted', '_legacyId'],
  sanitizeTransform (taskObj) {
    if (taskObj.type && taskObj.type !== 'reward') { // value should be settable directly only for rewards
      delete taskObj.value;
    }

    return taskObj;
  },
  private: [],
  timestamps: true,
});

// Sanitize user tasks linked to a challenge
// See http://habitica.wikia.com/wiki/Challenges#Challenge_Participant.27s_Permissions for more info
TaskSchema.statics.sanitizeUserChallengeTask = function sanitizeUserChallengeTask (taskObj) {
  let initialSanitization = this.sanitize(taskObj);

  return _.pick(initialSanitization, ['streak', 'checklist', 'attribute', 'reminders', 'tags', 'notes']);
};

// Sanitize checklist objects (disallowing id)
TaskSchema.statics.sanitizeChecklist = function sanitizeChecklist (checklistObj) {
  delete checklistObj.id;
  return checklistObj;
};

// Sanitize reminder objects (disallowing id)
TaskSchema.statics.sanitizeReminder = function sanitizeReminder (reminderObj) {
  delete reminderObj.id;
  return reminderObj;
};

TaskSchema.methods.scoreChallengeTask = async function scoreChallengeTask (delta) {
  let chalTask = this;

  chalTask.value += delta;

  if (chalTask.type === 'habit' || chalTask.type === 'daily') {
    // Add only one history entry per day
    let lastChallengHistoryIndex = chalTask.history.length - 1;

    if (chalTask.history[lastChallengHistoryIndex] &&
      moment(chalTask.history[lastChallengHistoryIndex].date).isSame(new Date(), 'day')) {
      chalTask.history[lastChallengHistoryIndex] = {
        date: Number(new Date()),
        value: chalTask.value,
      };
      chalTask.markModified(`history.${lastChallengHistoryIndex}`);
    } else {
      chalTask.history.push({
        date: Number(new Date()),
        value: chalTask.value,
      });

      // Only preen task history once a day when the task is scored first
      if (chalTask.history.length > 365) {
        chalTask.history = preenHistory(chalTask.history, true); // true means the challenge will retain as much entries as a subscribed user
      }
    }
  }

  await chalTask.save();
};


// Methods to adapt the new schema to API v2 responses (mostly tasks inside the user model)
// These will be removed once API v2 is discontinued

// toJSON for API v2
TaskSchema.methods.toJSONV2 = function toJSONV2 () {
  let toJSON = this.toJSON();
  if (toJSON._legacyId) {
    toJSON.id = toJSON._legacyId;
  } else {
    toJSON.id = toJSON._id;
  }

  if (!toJSON.challenge) toJSON.challenge = {};

  let v3Tags = this.tags;

  toJSON.tags = {};
  v3Tags.forEach(tag => {
    toJSON.tags[tag] = true;
  });

  toJSON.dateCreated = this.createdAt;

  return toJSON;
};

TaskSchema.statics.fromJSONV2 = function fromJSONV2 (taskObj) {
  if (taskObj.id) taskObj._id = taskObj.id;

  let v2Tags = taskObj.tags || {};

  taskObj.tags = [];
  taskObj.tags = _.map(v2Tags, (tag, key) => key);

  return taskObj;
};

// END of API v2 methods

export let Task = mongoose.model('Task', TaskSchema);

// habits and dailies shared fields
let habitDailySchema = () => {
  return {history: Array}; // [{date:Date, value:Number}], // this causes major performance problems
};

// dailys and todos shared fields
let dailyTodoSchema = () => {
  return {
    completed: {type: Boolean, default: false},
    // Checklist fields (dailies and todos)
    collapseChecklist: {type: Boolean, default: false},
    checklist: [{
      completed: {type: Boolean, default: false},
      text: {type: String, required: false, default: ''}, // required:false because it can be empty on creation
      _id: false,
      id: {type: String, default: shared.uuid, required: true, validate: [validator.isUUID, 'Invalid uuid.']},
    }],
  };
};

export let HabitSchema = new Schema(_.defaults({
  up: {type: Boolean, default: true},
  down: {type: Boolean, default: true},
}, habitDailySchema()), subDiscriminatorOptions);
export let habit = Task.discriminator('habit', HabitSchema);

export let DailySchema = new Schema(_.defaults({
  frequency: {type: String, default: 'weekly', enum: ['daily', 'weekly']},
  everyX: {type: Number, default: 1}, // e.g. once every X weeks
  startDate: {
    type: Date,
    default () {
      return moment().startOf('day').toDate();
    },
  },
  repeat: { // used only for 'weekly' frequency,
    m: {type: Boolean, default: true},
    t: {type: Boolean, default: true},
    w: {type: Boolean, default: true},
    th: {type: Boolean, default: true},
    f: {type: Boolean, default: true},
    s: {type: Boolean, default: true},
    su: {type: Boolean, default: true},
  },
  streak: {type: Number, default: 0},
}, habitDailySchema(), dailyTodoSchema()), subDiscriminatorOptions);
export let daily = Task.discriminator('daily', DailySchema);

export let TodoSchema = new Schema(_.defaults({
  dateCompleted: Date,
  // TODO we're getting parse errors, people have stored as "today" and "3/13". Need to run a migration & put this back to type: Date see http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
  date: String, // due date for todos
}, dailyTodoSchema()), subDiscriminatorOptions);
export let todo = Task.discriminator('todo', TodoSchema);

export let RewardSchema = new Schema({}, subDiscriminatorOptions);
export let reward = Task.discriminator('reward', RewardSchema);
