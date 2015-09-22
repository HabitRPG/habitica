var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');

// Task History Schema
// -----------
// Each entry 

var TaskHistorySchema = new Schema({
  _id: {type: String, default: shared.uuid},
  taskId: {type: String},
  date: Date,
  value: Number
}, {minimize: false});

module.exports.schema = TaskHistorySchema;
module.exports.model = mongoose.model('TaskHistory', TaskHistorySchema);
