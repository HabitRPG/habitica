// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');
var _ = require('lodash');
var moment = require('moment');

// Task Schema
// -----------

var TaskSchema = {
  //_id:{type: String,'default': helpers.uuid},
  id: {type: String,'default': shared.uuid},
  dateCreated: {type:Date, 'default':Date.now},
  text: String,
  notes: {type: String, 'default': ''},
  tags: {type: Schema.Types.Mixed, 'default': {}}, //{ "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true },
  value: {type: Number, 'default': 0}, // redness
  priority: {type: Number, 'default': '1'},
  attribute: {type: String, 'default': "str", enum: ['str','con','int','per']},
  challenge: {
    id: {type: 'String', ref:'Challenge'},
    broken: String, // CHALLENGE_DELETED, TASK_DELETED, UNSUBSCRIBED, CHALLENGE_CLOSED
    winner: String // user.profile.name
    // group: {type: 'Strign', ref: 'Group'} // if we restore this, rename `id` above to `challenge`
  },
  reminders: [{
    id: {type:String,'default':shared.uuid},
    startDate: Date,
    time: Date
  }]
};

var HabitSchema = new Schema(
  _.defaults({
    type: {type:String, 'default': 'habit'},
    history: Array, // [{date:Date, value:Number}], // this causes major performance problems
    up: {type: Boolean, 'default': true},
    down: {type: Boolean, 'default': true}
  }, TaskSchema)
  , { _id: false, minimize:false }
);

var collapseChecklist = {type:Boolean, 'default':false};
var checklist = [{
  completed:{type:Boolean,'default':false},
  text: String,
  _id:false,
  id: {type:String,'default':shared.uuid}
}];

var DailySchema = new Schema(
  _.defaults({
    type: {type: String, 'default': 'daily'},
    frequency: {type: String, 'default': 'weekly', enum: ['daily', 'weekly']},
    everyX: {type: Number, 'default': 1}, // e.g. once every X weeks
    startDate: {type: Date, 'default': moment().startOf('day').toDate()},
    history: Array,
    completed: {type: Boolean, 'default': false},
    repeat: { // used only for 'weekly' frequency,
      m:  {type: Boolean, 'default': true},
      t:  {type: Boolean, 'default': true},
      w:  {type: Boolean, 'default': true},
      th: {type: Boolean, 'default': true},
      f:  {type: Boolean, 'default': true},
      s:  {type: Boolean, 'default': true},
      su: {type: Boolean, 'default': true}
    },
    collapseChecklist:collapseChecklist,
    checklist:checklist,
    streak: {type: Number, 'default': 0}
  }, TaskSchema)
  , { _id: false, minimize:false }
)

var TodoSchema = new Schema(
  _.defaults({
    type: {type:String, 'default': 'todo'},
    completed: {type: Boolean, 'default': false},
    dateCompleted: Date,
    date: String, // due date for todos // FIXME we're getting parse errors, people have stored as "today" and "3/13". Need to run a migration & put this back to type: Date
    collapseChecklist:collapseChecklist,
    checklist:checklist
  }, TaskSchema)
  , { _id: false, minimize:false }
);

var RewardSchema = new Schema(
  _.defaults({
    type: {type:String, 'default': 'reward'}
  }, TaskSchema)
  , { _id: false, minimize:false }
);

/**
 * Workaround for bug when _id & id were out of sync, we can remove this after challenges has been running for a while
 */
//_.each([HabitSchema, DailySchema, TodoSchema, RewardSchema], function(schema){
//  schema.post('init', function(doc){
//    if (!doc.id && doc._id) doc.id = doc._id;
//  })
//})

module.exports.TaskSchema = TaskSchema;
module.exports.HabitSchema = HabitSchema;
module.exports.DailySchema = DailySchema;
module.exports.TodoSchema = TodoSchema;
module.exports.RewardSchema = RewardSchema;
