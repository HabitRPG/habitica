import mongoose from 'mongoose';
import shared from '../../common';
import validator from 'validator';
import moment from 'moment';
import baseModel from '../libs/baseModel';
import { InternalServerError } from '../libs/errors';
import _ from 'lodash';
import { preenHistory } from '../libs/preening';

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
  type: {type: String, enum: tasksTypes, required: true, default: tasksTypes[0]},
  text: {type: String, required: true},
  notes: {type: String, default: ''},
  alias: {
    type: String,
    match: [/^[a-zA-Z0-9-_]+$/, 'Task short names can only contain alphanumeric characters, underscores and dashes.'],
    validate: [{
      validator () {
        return Boolean(this.userId);
      },
      msg: 'Task short names can only be applied to tasks in a user\'s own task list.',
    }, {
      validator (val) {
        return !validator.isUUID(val);
      },
      msg: 'Task short names cannot be uuids.',
    }],
  },
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

  group: {
    id: {type: String, ref: 'Group', validate: [validator.isUUID, 'Invalid uuid.']},
    broken: {type: String, enum: ['GROUP_DELETED', 'TASK_DELETED', 'UNSUBSCRIBED']},
    assignedUsers: [{type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.']}],
    taskId: {type: String, ref: 'Task', validate: [validator.isUUID, 'Invalid uuid.']},
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
  noSet: ['challenge', 'userId', 'completed', 'history', 'dateCompleted', '_legacyId', 'group'],
  sanitizeTransform (taskObj) {
    if (taskObj.type && taskObj.type !== 'reward') { // value should be settable directly only for rewards
      delete taskObj.value;
    }

    return taskObj;
  },
  private: [],
  timestamps: true,
});

TaskSchema.statics.findByIdOrAlias = async function findByIdOrAlias (identifier, userId, additionalQueries = {}) {
  // not using i18n strings because these errors are meant for devs who forgot to pass some parameters
  if (!identifier) throw new InternalServerError('Task identifier is a required argument');
  if (!userId) throw new InternalServerError('User identifier is a required argument');

  let query = _.cloneDeep(additionalQueries);

  if (validator.isUUID(identifier)) {
    query._id = identifier;
  } else {
    query.userId = userId;
    query.alias = identifier;
  }

  let task = await this.findOne(query).exec();

  return task;
};

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

export let Task = mongoose.model('Task', TaskSchema);

Task.schema.path('alias').validate(function valiateAliasNotTaken (alias, respond) {
  Task.findOne({
    _id: { $ne: this._id },
    userId: this.userId,
    alias,
  }).exec().then((task) => {
    let aliasAvailable = !task;

    respond(aliasAvailable);
  }).catch(() => {
    respond(false);
  });
}, 'Task alias already used on another task.');

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
