var _ = require('lodash');
var csv = require('express-csv');
var User = require('../models/user').model;
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

dataexport.auth = function(req, res, next) { //[todo] there is probably a more elegant way of doing this...
  var uid;
  uid = req.session.userId;
  if (!(req.session && req.session.userId)) {
    return res.json(401, "You must be logged in.");
  }
  return User.findOne({
    _id: uid,
  }, function(err, user) {
    if (err) {
      return res.json(500, {
        err: err
      });
    }
    if (_.isEmpty(user)) {
      return res.json(401, "No user found.");
    }

    res.locals.user = user;
    return next();
  });
};
