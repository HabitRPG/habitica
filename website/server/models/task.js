import mongoose from 'mongoose';
import validator from 'validator';
import moment from 'moment';
import _ from 'lodash';
import shared from '../../common';
import baseModel from '../libs/baseModel';
import { InternalServerError } from '../libs/errors';
import { preenHistory } from '../libs/preening';
import { SHARED_COMPLETION } from '../libs/groupTasks'; // eslint-disable-line import/no-cycle

const { Schema } = mongoose;

const discriminatorOptions = {
  discriminatorKey: 'type', // the key that distinguishes task types
};
const subDiscriminatorOptions = _.defaults(_.cloneDeep(discriminatorOptions), {
  _id: false,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

export const tasksTypes = ['habit', 'daily', 'todo', 'reward'];
export const taskIsGroupOrChallengeQuery = {
  $and: [ // exclude challenge and group tasks
    {
      $or: [
        { 'challenge.id': { $exists: false } },
        { 'challenge.broken': { $exists: true } },
      ],
    },
    {
      $or: [
        { 'group.id': { $exists: false } },
        { 'group.broken': { $exists: true } },
      ],
    },
  ],
};

const reminderSchema = new Schema({
  _id: false,
  id: {
    $type: String, validate: [v => validator.isUUID(v), 'Invalid uuid for task reminder.'], default: shared.uuid, required: true,
  },
  startDate: { $type: Date },
  time: { $type: Date, required: true },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
  typeKey: '$type', // So that we can use a field named `type`
});

reminderSchema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  _id: false,
});

// NOTE IMPORTANTE
// When something changes here remember to update the client side model
// at common/script/libs/taskDefaults
export const TaskSchema = new Schema({
  type: {
    $type: String, enum: tasksTypes, required: true, default: tasksTypes[0],
  },
  text: { $type: String, required: true },
  notes: { $type: String, default: '' },
  alias: {
    $type: String,
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
    }, {
      async validator (alias) {
        const taskDuplicated = await Task.findOne({ // eslint-disable-line no-use-before-define
          _id: { $ne: this._id },
          userId: this.userId,
          alias,
        }).exec();

        return !taskDuplicated;
      },
      msg: 'Task alias already used on another task.',
    }],
  },
  tags: [{
    $type: String,
    validate: [v => validator.isUUID(v), 'Invalid uuid for task tags.'],
  }],
  // redness or cost for rewards Required because it must be settable (for rewards)
  value: {
    $type: Number,
    default: 0,
    required: true,
    validate: {
      validator (value) {
        return this.type === 'reward' ? value >= 0 : true;
      },
      msg: 'Reward cost should be a positive number or 0.',
    },
  },
  priority: {
    $type: Number,
    default: 1,
    required: true,
    validate: [
      val => [0.1, 1, 1.5, 2].indexOf(val) !== -1,
      'Valid priority values are 0.1, 1, 1.5, 2.',
    ],
  },
  attribute: { $type: String, default: 'str', enum: ['str', 'con', 'int', 'per'] },
  userId: { $type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid for task owner.'] }, // When not set it belongs to a challenge

  challenge: {
    shortName: { $type: String },
    id: { $type: String, ref: 'Challenge', validate: [v => validator.isUUID(v), 'Invalid uuid for task challenge.'] }, // When set (and userId not set) it's the original task
    taskId: { $type: String, ref: 'Task', validate: [v => validator.isUUID(v), 'Invalid uuid for task challenge task.'] }, // When not set but challenge.id defined it's the original task
    broken: { $type: String, enum: ['CHALLENGE_DELETED', 'TASK_DELETED', 'UNSUBSCRIBED', 'CHALLENGE_CLOSED', 'CHALLENGE_TASK_NOT_FOUND'] }, // CHALLENGE_TASK_NOT_FOUND comes from v3 migration
    winner: String, // user.profile.name of the winner
  },

  group: {
    id: { $type: String, ref: 'Group', validate: [v => validator.isUUID(v), 'Invalid uuid for group task.'] },
    broken: { $type: String, enum: ['GROUP_DELETED', 'TASK_DELETED', 'UNSUBSCRIBED'] },
    assignedUsers: [{ $type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid for group assigned user.'] }],
    assignedDate: { $type: Date },
    assigningUsername: { $type: String },
    taskId: { $type: String, ref: 'Task', validate: [v => validator.isUUID(v), 'Invalid uuid for group task.'] },
    approval: {
      required: { $type: Boolean, default: false },
      approved: { $type: Boolean, default: false },
      dateApproved: { $type: Date },
      approvingUser: { $type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid for group approving user.'] },
      requested: { $type: Boolean, default: false },
      requestedDate: { $type: Date },
    },
    sharedCompletion: {
      $type: String,
      enum: _.values(SHARED_COMPLETION),
      default: SHARED_COMPLETION.single,
    },
    managerNotes: { $type: String },
  },

  reminders: [reminderSchema],

  byHabitica: { $type: Boolean, default: false }, // Flag of Tasks that were created by Habitica
}, _.defaults({
  minimize: false, // So empty objects are returned
  strict: true,
  typeKey: '$type', // So that we can use fields named `type`
}, discriminatorOptions));

TaskSchema.plugin(baseModel, {
  noSet: ['challenge', 'userId', 'completed', 'history', 'dateCompleted', '_legacyId', 'group', 'isDue', 'nextDue'],
  sanitizeTransform (taskObj) {
    if (taskObj.type && taskObj.type !== 'reward') { // value should be settable directly only for rewards
      delete taskObj.value;
    }

    if (taskObj.priority) {
      const parsedFloat = Number.parseFloat(taskObj.priority);

      if (!Number.isNaN(parsedFloat)) {
        taskObj.priority = parsedFloat.toFixed(1);
      }
    }

    // Fix issue where iOS was sending null as the value of the attribute field
    // See https://github.com/HabitRPG/habitica-ios/commit/4cd05f80363502eb7652e057aa564c85546f7806
    if (taskObj.attribute === null) {
      taskObj.attribute = 'str';
    }

    return taskObj;
  },
  private: [],
  timestamps: true,
});

TaskSchema.statics.findByIdOrAlias = async function findByIdOrAlias (
  identifier,
  userId,
  additionalQueries = {},
) {
  // not using i18n strings because these errors
  // are meant for devs who forgot to pass some parameters
  if (!identifier) throw new InternalServerError('Task identifier is a required argument');
  if (!userId) throw new InternalServerError('User identifier is a required argument');

  const query = _.cloneDeep(additionalQueries);

  if (validator.isUUID(String(identifier))) {
    query._id = identifier;
  } else {
    query.userId = userId;
    query.alias = identifier;
  }

  const task = await this.findOne(query).exec();

  return task;
};

// Sanitize user tasks linked to a challenge
// See http://habitica.fandom.com/wiki/Challenges#Challenge_Participant.27s_Permissions for more info
TaskSchema.statics.sanitizeUserChallengeTask = function sanitizeUserChallengeTask (taskObj) {
  const initialSanitization = this.sanitize(taskObj);

  return _.pick(initialSanitization, [
    'streak', 'checklist', 'attribute', 'reminders',
    'tags', 'notes', 'collapseChecklist',
    'alias', 'yesterDaily', 'counterDown', 'counterUp',
  ]);
};

TaskSchema.statics.sanitizeUserGroupTask = function sanitizeUserGroupTask (taskObj) {
  const initialSanitization = this.sanitize(taskObj);

  return _.pick(initialSanitization, [
    'streak', 'attribute', 'reminders',
    'tags', 'notes', 'collapseChecklist',
    'alias', 'yesterDaily', 'counterDown', 'counterUp',
  ]);
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

TaskSchema.methods.scoreChallengeTask = async function scoreChallengeTask (delta, direction) {
  const chalTask = this;

  chalTask.value += delta;

  if (chalTask.type === 'habit' || chalTask.type === 'daily') {
    // Add only one history entry per day
    const { history } = chalTask;
    const lastChallengeHistoryIndex = history.length - 1;
    const lastHistoryEntry = history[lastChallengeHistoryIndex];

    if (
      lastHistoryEntry && lastHistoryEntry.date
      && moment().isSame(lastHistoryEntry.date, 'day')
    ) {
      lastHistoryEntry.value = chalTask.value;
      lastHistoryEntry.date = Number(new Date());

      if (chalTask.type === 'habit') {
        // @TODO remove this extra check after migration has run to set scoredUp and scoredDown
        // in every task
        lastHistoryEntry.scoredUp = lastHistoryEntry.scoredUp || 0;
        lastHistoryEntry.scoredDown = lastHistoryEntry.scoredDown || 0;

        if (direction === 'up') {
          lastHistoryEntry.scoredUp += 1;
        } else {
          lastHistoryEntry.scoredDown += 1;
        }
      }

      chalTask.markModified(`history.${lastChallengeHistoryIndex}`);
    } else {
      const historyEntry = {
        date: Number(new Date()),
        value: chalTask.value,
      };

      if (chalTask.type === 'habit') {
        historyEntry.scoredUp = direction === 'up' ? 1 : 0;
        historyEntry.scoredDown = direction === 'down' ? 1 : 0;
      }

      history.push(historyEntry);

      // Only preen task history once a day when the task is scored first
      if (chalTask.history.length > 365) {
        // true means the challenge will retain as many entries as a subscribed user
        chalTask.history = preenHistory(chalTask.history, true);
      }
    }
  }

  await chalTask.save();
};

export const Task = mongoose.model('Task', TaskSchema);

// habits and dailies shared fields
// Schema for history not defined because it causes serious perf problems
// date is a date stored as a Number value
// value is a Number
// scoredUp and scoredDown only exist for habits and are numbers

const habitDailySchema = () => ({ history: Array });

// dailys and todos shared fields
const dailyTodoSchema = () => ({
  completed: { $type: Boolean, default: false },
  // Checklist fields (dailies and todos)
  collapseChecklist: { $type: Boolean, default: false },
  checklist: [{
    completed: { $type: Boolean, default: false },
    text: { $type: String, required: false, default: '' }, // required:false because it can be empty on creation
    _id: false,
    id: {
      $type: String, default: shared.uuid, required: true, validate: [v => validator.isUUID(v), 'Invalid uuid for task checklist item.'],
    },
    linkId: { $type: String },
  }],
});

export const HabitSchema = new Schema(_.defaults({
  up: { $type: Boolean, default: true },
  down: { $type: Boolean, default: true },
  counterUp: { $type: Number, default: 0 },
  counterDown: { $type: Number, default: 0 },
  frequency: { $type: String, default: 'daily', enum: ['daily', 'weekly', 'monthly'] },
}, habitDailySchema()), subDiscriminatorOptions);
export const habit = Task.discriminator('habit', HabitSchema);

export const DailySchema = new Schema(_.defaults({
  frequency: { $type: String, default: 'weekly', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  everyX: {
    $type: Number,
    default: 1,
    validate: [
      val => val % 1 === 0 && val >= 0 && val <= 9999,
      'Valid everyX values are integers from 0 to 9999',
    ],
  },
  startDate: {
    $type: Date,
    default () {
      return moment().startOf('day').toDate();
    },
    required: true,
  },
  repeat: { // used only for 'weekly' frequency,
    m: { $type: Boolean, default: true },
    t: { $type: Boolean, default: true },
    w: { $type: Boolean, default: true },
    th: { $type: Boolean, default: true },
    f: { $type: Boolean, default: true },
    s: { $type: Boolean, default: true },
    su: { $type: Boolean, default: true },
  },
  streak: { $type: Number, default: 0 },
  // Days of the month that the daily should repeat on
  daysOfMonth: { $type: [Number], default: [] },
  // Weeks of the month that the daily should repeat on
  weeksOfMonth: { $type: [Number], default: [] },
  isDue: { $type: Boolean },
  nextDue: [{ $type: String }],
  yesterDaily: { $type: Boolean, default: true, required: true },
}, habitDailySchema(), dailyTodoSchema()), subDiscriminatorOptions);
export const daily = Task.discriminator('daily', DailySchema);

export const TodoSchema = new Schema(_.defaults({
  dateCompleted: Date,
  // TODO we're getting parse errors, people have stored as "today" and "3/13". Need to run a migration & put this back to $type: Date see http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
  date: String, // due date for todos
}, dailyTodoSchema()), subDiscriminatorOptions);
export const todo = Task.discriminator('todo', TodoSchema);

export const RewardSchema = new Schema({}, subDiscriminatorOptions);
export const reward = Task.discriminator('reward', RewardSchema);
