var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');
var middleware = require('../middleware')

// -------- App --------
router.get('/', function(req, res) {
  return res.render('index', {
    title: 'HabitRPG | Your Life, The Role Playing Game',
    env: middleware.locals(req)
  });
});

// -------- Marketing --------

router.get('/static/front', function(req, res) {
  var env = middleware.locals(req);
  env.isFrontPage = true;
  res.render('static/front', {env: env});
});

router.get('/static/privacy', function(req, res) {
  res.render('static/privacy', {env: middleware.locals(req)});
});

router.get('/static/terms', function(req, res) {
  res.render('static/terms', {env: middleware.locals(req)});
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