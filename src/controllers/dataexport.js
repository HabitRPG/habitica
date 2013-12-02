var _ = require('lodash');
var csv = require('express-csv');
var express = require('express');
var nconf = require('nconf');
var moment = require('moment');
var dataexport = module.exports;
var js2xmlparser = require("js2xmlparser");
var pd = require('pretty-data').pd;
var User = require('../models/user').model;


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

var userdata = function(user) {
  if(user.auth && user.auth.local) {
    delete user.auth.local.salt;
    delete user.auth.local.hashed_password;
  }
  return user;
}

dataexport.leanuser = function(req, res, next) {
  var user = res.locals.user;
  User.findOne({_id: user._id,}).lean().exec(function(err, user) {
    if (err) return res.json(500, {err: err});
    if (_.isEmpty(user)) return res.json(401, NO_USER_FOUND);
    res.locals.user = user;
    return next();
  });
};

dataexport.userdata = {
  xml: function(req, res) {
      var user = userdata(res.locals.user);
      return res.xml({data: JSON.stringify(user), rootname: 'user'});
    },
  json: function(req, res) {
      var user = userdata(res.locals.user);
      return res.jsonstring(user);
    },
}

/*
  ------------------------------------------------------------------------
  Express Extensions (should be refactored into a module)
  ------------------------------------------------------------------------
*/

var expressres = express.response || http.ServerResponse.prototype;

expressres.xml = function(obj, headers, status) {
  var body = '';
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/xml');
  this.header('Content-Disposition', 'attachment');
  body = pd.xml(js2xmlparser(obj.rootname,obj.data));
  return this.send(body, headers, status);
};

expressres.jsonstring = function(obj, headers, status) {
  var body = '';
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'application/json');
  this.header('Content-Disposition', 'attachment');
  body = pd.json(JSON.stringify(obj));
  return this.send(body, headers, status);
};
