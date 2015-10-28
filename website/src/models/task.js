var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');
var moment = require('moment');

// Task Schema
// -----------

// TODO make sure a task can only update the fields belonging to its type

var TaskSchema = new Schema({
  _id: {type: String, default: shared.uuid},
  // Old id stored in user model, to keep API v2 compatibility, should not modified
  // if new task, it'll match _id
  legacyId: {type: String},
  type: {type: String, enum: ['habit', 'todo', 'daily', 'reward'], required: true, default: 'habit'},
  dateCreated: {type: Date, default: Date.now},
  text: String,
  notes: {type: String, default: ''},
  // TODO dictionary?
  tags: {type: Schema.Types.Mixed, default: {}}, //{ "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true },
  value: {type: Number, default: 0}, // redness or price for rewards
  priority: {type: Number, default: 1},
  attribute: {type: String, default: 'str', enum: ['str','con','int','per']},

  userId: {type: String, ref: 'User'},

  challenge: {
    id: {type: String, ref: 'Challenge'},
    taskId: {type: String, ref: 'Task'},
    broken: String, // CHALLENGE_DELETED, TASK_DELETED, UNSUBSCRIBED, CHALLENGE_CLOSED todo enum
    winner: String // user.profile.name TODO necessary?
  },

  // Habits' fields
  up: {type: Boolean, default: true},
  down: {type: Boolean, default: true},
  history: Array, // [{date:Date, value:Number}], // this causes major performance problems TODO revisit

  // Checklist fields (dailies and todos)
  collapseChecklist: {type: Boolean, default: false},
  checklist: [{
    completed: {type: Boolean, default: false},
    text: String,
    _id: {type: String, default: shared.uuid}
  }],

  // Dailies' fields
  frequency: {type: String, default: 'weekly', enum: ['daily', 'weekly']},
  everyX: {type: Number, default: 1}, // e.g. once every X weeks
  startDate: {
    type: Date,
    default: function() {
      return moment().startOf('day').toDate();
    }
  }, 
  completed: {type: Boolean, default: false},
  repeat: { // used only for 'weekly' frequency,
    m:  {type: Boolean, default: true},
    t:  {type: Boolean, default: true},
    w:  {type: Boolean, default: true},
    th: {type: Boolean, default: true},
    f:  {type: Boolean, default: true},
    s:  {type: Boolean, default: true},
    su: {type: Boolean, default: true}
  },
  streak: {type: Number, default: 0},

  // Todos' fields
  completed: {type: Boolean, default: false},
  dateCompleted: Date,
  date: String // due date for todos // FIXME we're getting parse errors, people have stored as "today" and "3/13". Need to run a migration & put this back to type: Date
}, {minimize: false});

TaskSchema.pre('save', function(next){
  // Should be removed when legacyId is removed
  // If the task is a new, post migration task, make sure it legacyId matched _id
  if(!this.legacyId){
    this.legacyId = this._id;
  }

  next();
});

// Make sure `ìd` is always avalaible for backward compatibility (TODO remove in api v3)
//TaskSchema.set('toObject', { getters: true });
//TaskSchema.set('toJSON', { getters: true });
// TODO toJSON seems to break everything!

TaskSchema.methods.toJSON = function() {
  var doc = this.toObject();
  doc.id = doc._id;
  return doc;
};

module.exports.schema = TaskSchema;
module.exports.model = mongoose.model('Task', TaskSchema);