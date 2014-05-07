var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var middleware = require('../middleware');
var user = require('../controllers/user');
var auth = require('../controllers/auth');
var i18n = require('../i18n');

// -------- App --------
router.get('/', i18n.getUserLanguage, middleware.locals, function(req, res) {
  if (!req.headers['x-api-user'] && !req.headers['x-api-key'] && !(req.session && req.session.userId))
    return res.redirect('/static/front')

  return res.render('index', {
    title: 'HabitRPG | Your Life, The Role Playing Game',
    env: res.locals.habitrpg
  });
});

// -------- Marketing --------

router.get('/static/front', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/front', {env: res.locals.habitrpg});
});

router.get('/static/privacy', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/privacy', {env: res.locals.habitrpg});
});

router.get('/static/terms', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/terms', {env: res.locals.habitrpg});
});

router.get('/static/api', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/api', {env: res.locals.habitrpg});
});

router.get('/static/features', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/features', {env: res.locals.habitrpg});
});

router.get('/static/videos', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/videos', {env: res.locals.habitrpg});
});

router.get('/static/contact', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/contact', {env: res.locals.habitrpg});
});

router.get('/static/plans', i18n.getUserLanguage, middleware.locals, function(req, res) {
  res.render('static/plans', {env: res.locals.habitrpg});
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitrpg.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;