import mongoose from 'mongoose';
import shared from '../../../common';
import validator from 'validator';
import moment from 'moment';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';
import { preenHistory } from '../libs/api-v3/preening';

let Schema = mongoose.Schema;
let discriminatorOptions = {
  discriminatorKey: 'type', // the key that distinguishes task types
};
let subDiscriminatorOptions = _.defaults(_.cloneDeep(discriminatorOptions), {_id: false});

export let tasksTypes = ['habit', 'daily', 'todo', 'reward'];

// Important
// When something changes here remember to update the client side model at common/script/libs/taskDefaults
export let TaskSchema = new Schema({
  type: {type: String, enum: tasksTypes, required: true, default: tasksTypes[0]},
  text: {type: String, required: true},
  notes: {type: String, default: ''},
  tags: [{
    type: String,
    validate: [validator.isUUID, 'Invalid uuid.'],
  }],
  value: {type: Number, default: 0, required: true}, // redness or cost for rewards Required because it must be settable (for rewards)
  priority: {type: Number, default: 1, required: true}, // TODO enum?
  attribute: {type: String, default: 'str', enum: ['str', 'con', 'int', 'per']},
  userId: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.']}, // When not set it belongs to a challenge

  challenge: {
    id: {type: String, ref: 'Challenge', validate: [validator.isUUID, 'Invalid uuid.']}, // When set (and userId not set) it's the original task
    taskId: {type: String, ref: 'Task', validate: [validator.isUUID, 'Invalid uuid.']}, // When not set but challenge.id defined it's the original task TODO unique index?
    broken: {type: String, enum: ['CHALLENGE_DELETED', 'TASK_DELETED', 'UNSUBSCRIBED', 'CHALLENGE_CLOSED']},
    winner: String, // user.profile.name TODO necessary?
  },

  reminders: [{
    _id: {type: String, validate: [validator.isUUID, 'Invalid uuid.'], default: shared.uuid, required: true},
    startDate: {type: Date, required: true},
    time: {type: Date, required: true},
  }],
}, _.defaults({
  minimize: true, // So empty objects are returned
  strict: true,
}, discriminatorOptions));

TaskSchema.plugin(baseModel, {
   // TODO checklist fields editable?
   // TODO value should be settable only for rewards
  noSet: ['challenge', 'userId', 'completed', 'history', 'streak', 'dateCompleted'],
  private: [],
  timestamps: true,
});

// A list of additional fields that cannot be set on creation (but can be set on updare)
let noCreate = ['completed']; // TODO completed should be removed for updates too?
TaskSchema.statics.sanitizeCreate = function sanitizeCreate (createObj) {
  return this.sanitize(createObj, noCreate);
};

// Sanitize checklist objects (disallowing _id)
TaskSchema.statics.sanitizeChecklist = function sanitizeChecklist (checklistObj) {
  delete checklistObj._id;
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
  toJSON.id = toJSON._id;

  let v3Tags = this.tags;

  toJSON.tags = {};
  v3Tags.forEach(tag => {
    toJSON.tags[tag] = true;
  });

  return toJSON;
};

TaskSchema.statics.fromJSONV2 = function toJSONV2 (taskObj) {
  taskObj._id = taskObj.id;

  let v2Tags = taskObj.tags || {};

  taskObj.tags = [];
  taskObj.tags = _.map(v2Tags, (tag, key) => key);

  return taskObj;
};


// END of API v2 methods

export let Task = mongoose.model('Task', TaskSchema);

// habits and dailies shared fields
let habitDailySchema = () => {
  return {history: Array}; // [{date:Date, value:Number}], // this causes major performance problems TODO revisit
};

// dailys and todos shared fields
let dailyTodoSchema = () => {
  return {
    completed: {type: Boolean, default: false},
    // Checklist fields (dailies and todos)
    collapseChecklist: {type: Boolean, default: false},
    checklist: [{
      completed: {type: Boolean, default: false},
      text: {type: String, required: true},
      _id: {type: String, default: shared.uuid, validate: [validator.isUUID, 'Invalid uuid.']},
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
  // FIXME we're getting parse errors, people have stored as "today" and "3/13". Need to run a migration & put this back to type: Date
  // TODO change field name
  date: String, // due date for todos
}, dailyTodoSchema()), subDiscriminatorOptions);
export let todo = Task.discriminator('todo', TodoSchema);

export let RewardSchema = new Schema({}, subDiscriminatorOptions);
export let reward = Task.discriminator('reward', RewardSchema);
