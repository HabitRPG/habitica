var _ = require('lodash');
var csv = require('express-csv');
var nconf = require('nconf');
var moment = require('moment');
var dataexport = module.exports;


/*
  ------------------------------------------------------------------------
  Data export
  ------------------------------------------------------------------------
*/

dataexport.history = function(req, res) {
  var user = res.locals.user;
  var output = [
    ["Task Name", "Task ID", "Task Type", "Date", "Value"]
  ];
  _.each(user.tasks, function(task) {
    _.each(task.history, function(history) {
      output.push(
        [task.text, task.id, task.type, moment(history.date).format("MM-DD-YYYY HH:mm:ss"), history.value]
      );
    });
  });
  return res.csv(output);
}
