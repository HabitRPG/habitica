var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var async = require('async');
var icalendar = require('icalendar');
var api = require('./../controllers/user');
var auth = require('./../controllers/auth');
var logging = require('./../logging');
var i18n = require('./../i18n');
var forceRefresh = require('../middlewares/forceRefresh').middleware;

/* ---------- Deprecated API ------------*/

var initDeprecated = function(req, res, next) {
  req.headers['x-api-user'] = req.params.uid;
  req.headers['x-api-key'] = req.body.apiToken;
  return next();
};

router.post('/v1/users/:uid/tasks/:taskId/:direction', initDeprecated, auth.auth, i18n.getUserLanguage, api.score);

// FIXME add this back in
router.get('/v1/users/:uid/calendar.ics', i18n.getUserLanguage, function(req, res, next) {
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

/*
 ------------------------------------------------------------------------
 Batch Update
 This is super-deprecated, and will be removed once apiv2 is running against mobile for a while
 ------------------------------------------------------------------------
 */
var batchUpdate = function(req, res, next) {
  var user = res.locals.user;
  var oldSend = res.send;
  var oldJson = res.json;
  var performAction = function(action, cb) {

    // req.body=action.data; delete action.data; _.defaults(req.params, action)
    // Would require changing action.dir on mobile app
    req.params.id = action.data && action.data.id;
    req.params.direction = action.dir;
    req.params.type = action.type;
    req.body = action.data;
    res.send = res.json = function(code, data) {
      if (_.isNumber(code) && code >= 400) {
        logging.error({
          code: code,
          data: data
        });
      }
      //FIXME send error messages down
      return cb();
    };
    switch (action.op) {
      case "score":
        api.score(req, res);
        break;
      case "addTask":
        api.addTask(req, res);
        break;
      case "delTask":
        api.deleteTask(req, res);
        break;
      case "revive":
        api.revive(req, res);
        break;
      default:
        cb();
        break;
    }
  };

  // Setup the array of functions we're going to call in parallel with async
  var actions = _.transform(req.body || [], function(result, action) {
    if (!_.isEmpty(action)) {
      result.push(function(cb) {
        performAction(action, cb);
      });
    }
  });

  // call all the operations, then return the user object to the requester
  async.series(actions, function(err) {
    res.json = oldJson;
    res.send = oldSend;
    if (err) return res.json(500, {err: err});
    var response = user.toJSON();
    response.wasModified = res.locals.wasModified;
    if (response._tmp && response._tmp.drop){
      res.json(200, {_tmp: {drop: response._tmp.drop}, _v: response._v});
    }else if(response.wasModified){
      res.json(200, response);
    }else{
      res.json(200, {_v: response._v});
    }
  });
};

/*
 ------------------------------------------------------------------------
 API v1 Routes
 ------------------------------------------------------------------------
 */


var cron = api.cron;

router.get('/status', i18n.getUserLanguage, function(req, res) {
  return res.json({
    status: 'up'
  });
});

// Scoring
router.post('/user/task/:id/:direction', auth.auth, i18n.getUserLanguage, cron, api.score);
router.post('/user/tasks/:id/:direction', auth.auth, i18n.getUserLanguage, cron, api.score);

// Tasks
router.get('/user/tasks', auth.auth, i18n.getUserLanguage, cron, api.getTasks);
router.get('/user/task/:id', auth.auth, i18n.getUserLanguage, cron, api.getTask);
router.delete('/user/task/:id', auth.auth, i18n.getUserLanguage, cron, api.deleteTask);
router.post('/user/task', auth.auth, i18n.getUserLanguage, cron, api.addTask);

// User
router.get('/user', auth.auth, i18n.getUserLanguage, cron, api.getUser);
router.post('/user/revive', auth.auth, i18n.getUserLanguage, cron, api.revive);
router.post('/user/batch-update', forceRefresh, auth.auth, i18n.getUserLanguage, cron, batchUpdate);

function deprecated(req, res) {
  res.json(404, {err:'API v1 is no longer supported, please use API v2 instead (https://github.com/HabitRPG/habitrpg/blob/develop/API.md)'});
}
router.get('*', i18n.getUserLanguage, deprecated);
router.post('*', i18n.getUserLanguage, deprecated);
router.put('*', i18n.getUserLanguage, deprecated);

module.exports = router;
