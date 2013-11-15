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
  var env = res.locals.habitrpg;
  env.isFrontPage = true;
  res.render('static/front', {env: env});
});

router.get('/static/privacy', middleware.locals, function(req, res) {
  res.render('static/privacy', {env: res.locals.habitrpg});
});

router.get('/static/terms', middleware.locals, function(req, res) {
  res.render('static/terms', {env: res.locals.habitrpg});
});

// --------- Redirects --------

router.get('/splash.html', function(req, res) {
  res.redirect('/static/front');
});

router.get('/static/about', function(req, res) {
  res.redirect('http://community.habitrpg.com/node/97');
});

router.get('/static/team', function(req, res) {
  res.redirect('http://community.habitrpg.com/node/96');
});

router.get('/static/extensions', function(req, res) {
  res.redirect('http://community.habitrpg.com/extensions');
});

router.get('/static/faq', function(req, res) {
  res.redirect('http://community.habitrpg.com/faq-page');
});

module.exports = router;