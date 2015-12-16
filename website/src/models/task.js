import mongoose from 'mongoose';
import shared from '../../../common';
import validator from 'validator';
import moment from 'moment';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';

let Schema = mongoose.Schema;
let discriminatorOptions = {
  discriminatorKey: 'type', // the key that distinguishes task types
};
let subDiscriminatorOptions = _.defaults(_.cloneDeep(discriminatorOptions), {_id: false});

export let tasksTypes = ['habit', 'daily', 'todo', 'reward'];

export let TaskSchema = new Schema({
  type: {type: String, enum: tasksTypes, required: true, default: tasksTypes[0]},
  text: {type: String, required: true},
  notes: {type: String, default: ''},
  tags: [{
    type: String,
    validate: [validator.isUUID, 'Invalid uuid.'],
  }],
  value: {type: Number, default: 0}, // redness or cost for rewards
  priority: {type: Number, default: 1, required: true}, // TODO enum?
  attribute: {type: String, default: 'str', enum: ['str', 'con', 'int', 'per']},
  userId: {type: String, ref: 'User'}, // When null it belongs to a challenge

  challenge: {
    id: {type: String, ref: 'Challenge'},
    taskId: {type: String, ref: 'Task'}, // When null but challenge.id defined it's the original task
    broken: String, // CHALLENGE_DELETED, TASK_DELETED, UNSUBSCRIBED, CHALLENGE_CLOSED TODO enum
    winner: String, // user.profile.name TODO necessary?
  },
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
  return Task.sanitize(createObj, noCreate); // eslint-disable-line no-use-before-define
};

// A list of additional fields that cannot be updated (but can be set on creation)
let noUpdate = ['_id', 'type'];
TaskSchema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return Task.sanitize(updateObj, noUpdate); // eslint-disable-line no-use-before-define
};

// Sanitize checklist objects (disallowing _id)
TaskSchema.statics.sanitizeChecklist = function sanitizeChecklist (checklistObj) {
  delete checklistObj._id;
  return checklistObj;
};

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
