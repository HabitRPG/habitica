var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var middleware = require('../middleware');
var user = require('../controllers/user');
var auth = require('../controllers/auth');

// -------- App --------
router.get('/', middleware.locals, function(req, res) {
  if (!req.headers['x-api-user'] && !req.headers['x-api-key'] && !(req.session && req.session.userId))
    return res.redirect('/static/front')

  return res.render('index', {
    title: 'HabitRPG | Your Life, The Role Playing Game',
    env: res.locals.habitrpg
  });
});

// -------- Marketing --------

router.get('/static/front', middleware.locals, function(req, res) {
  res.render('static/front', {env: res.locals.habitrpg});
});

router.get('/static/privacy', middleware.locals, function(req, res) {
  res.render('static/privacy', {env: res.locals.habitrpg});
});

router.get('/static/terms', middleware.locals, function(req, res) {
  res.render('static/terms', {env: res.locals.habitrpg});
});

router.get('/static/api', middleware.locals, function(req, res) {
  res.render('static/api', {env: res.locals.habitrpg});
});

router.get('/static/features', middleware.locals, function(req, res) {
  res.render('static/features', {env: res.locals.habitrpg});
});

router.get('/static/videos', middleware.locals, function(req, res) {
  res.render('static/videos', {env: res.locals.habitrpg});
});

router.get('/static/contact', middleware.locals, function(req, res) {
  res.render('static/contact', {env: res.locals.habitrpg});
});

router.get('/static/plans', middleware.locals, function(req, res) {
  res.render('static/plans', {env: res.locals.habitrpg});
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitrpg.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;