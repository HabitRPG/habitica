// User.js
// =======
// Defines the user data model (schema) for use via the API.

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');

// Task Schema
// -----------

var TaskSchema = new Schema({
  history: [{date:Date, value:Number}],
  _id:{type: String,'default': helpers.uuid},
  text: String,
  notes: {type: String, 'default': ''},
  tags: Schema.Types.Mixed, //{ "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true },
  type: {type:String, 'default': 'habit'}, // habit, daily
  up: {type: Boolean, 'default': true},
  down: {type: Boolean, 'default': true},
  value: {type: Number, 'default': 0},
  completed: {type: Boolean, 'default': false},
  priority: {type: String, 'default': '!'}, //'!!' // FIXME this should be a number or something
  repeat: {type: Schema.Types.Mixed, 'default': {m:1, t:1, w:1, th:1, f:1, s:1, su:1} },
  streak: {type: Number, 'default': 0},
  challenge: {
    id: {type: 'String', ref:'Challenge'},
    broken: String // CHALLENGE_DELETED, TASK_DELETED, UNSUBSCRIBED, etc
    // group: {type: 'Strign', ref: 'Group'} // if we restore this, rename `id` above to `challenge`
  }
});

TaskSchema.methods.toJSON = function() {
  var doc = this.toObject();
  doc.id = doc._id;
  return doc;
}
TaskSchema.virtual('id').get(function(){
  return this._id;
})

module.exports.schema = TaskSchema;
module.exports.model = mongoose.model("Task", TaskSchema);