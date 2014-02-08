var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var middleware = require('../middleware')

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
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/privacy', {env: env});
});

router.get('/static/terms', middleware.locals, function(req, res) {
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/terms', {env: env});
});

router.get('/static/api', middleware.locals, function(req, res) {
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/api', {env: env});
});

router.get('/static/about', middleware.locals, function(req, res) {
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/about', {env: env});
});

router.get('/static/contact', middleware.locals, function(req, res) {
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/contact', {env: env});
});

router.get('/static/plans', middleware.locals, function(req, res) {
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/plans', {env: env});
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://community.habitrpg.com/extensions');
});

module.exports = router;