var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');

router.get('/', function(req, res) {
  return res.render('index', {
    title: 'HabitRPG | Your Life, The Role Playing Game',
    env: res.locals.habitrpg
  });
});

router.get('/partials/tasks', function(req, res) {
  return res.render('tasks/index');
});

router.get('/partials/options', function(req, res) {
  return res.render('options');
});

module.exports = router;