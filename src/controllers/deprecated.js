var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var icalendar = require('icalendar');
var api = require('./user');
var auth = require('./auth');

/* ---------- Deprecated Paths ------------*/


var deprecatedMessage = 'This API is no longer supported, see https://github.com/lefnire/habitrpg/wiki/API for new protocol';

router.get('/:uid/up/:score?', function(req, res) {
  return res.send(500, deprecatedMessage);
});

router.get('/:uid/down/:score?', function(req, res) {
  return res.send(500, deprecatedMessage);
});

router.post('/users/:uid/tasks/:taskId/:direction', function(req, res) {
  return res.send(500, deprecatedMessage);
});

/* Redirect to new API*/


var initDeprecated = function(req, res, next) {
  req.headers['x-api-user'] = req.params.uid;
  req.headers['x-api-key'] = req.body.apiToken;
  return next();
};

router.post('/v1/users/:uid/tasks/:taskId/:direction', initDeprecated, auth.auth, api.score);

router.get('/v1/users/:uid/calendar.ics', function(req, res, next) {
  return next() //disable for now

  var apiToken, model, query, uid;
  uid = req.params.uid;
  apiToken = req.query.apiToken;
  model = req.getModel();
  query = model.query('users').withIdAndToken(uid, apiToken);
  return query.fetch(function(err, result) {
    var formattedIcal, ical, tasks, tasksWithDates;
    if (err) {
      return res.send(500, err);
    }
    tasks = result.get('tasks');
    /*      tasks = result[0].tasks*/

    tasksWithDates = _.filter(tasks, function(task) {
      return !!task.date;
    });
    if (_.isEmpty(tasksWithDates)) {
      return res.send(500, "No events found");
    }
    ical = new icalendar.iCalendar();
    ical.addProperty('NAME', 'HabitRPG');
    _.each(tasksWithDates, function(task) {
      var d, event;
      event = new icalendar.VEvent(task.id);
      event.setSummary(task.text);
      d = new Date(task.date);
      d.date_only = true;
      event.setDate(d);
      ical.addComponent(event);
      return true;
    });
    res.type('text/calendar');
    formattedIcal = ical.toString().replace(/DTSTART\:/g, 'DTSTART;VALUE=DATE:');
    return res.send(200, formattedIcal);
  });
});

module.exports = router;