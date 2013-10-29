var nconf = require('nconf');
var express = require('express');
var router = new express.Router();
var _ = require('lodash');

// -------- App --------
router.get('/', function(req, res) {
  return res.render('index', {
    title: 'HabitRPG | Your Life, The Role Playing Game',
    env: res.locals.habitrpg
  });
});

// -------- Marketing --------

router.get('/splash.html', function(req, res) {
  res.redirect('/static/front');
});

router.get('/static/front', function(req, res) {
  res.render('static/front', {env: res.locals.habitrpg, isFrontPage: true});
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

router.get('/static/privacy', function(req, res) {
  res.render('static/privacy', {env: res.locals.habitrpg});
});

router.get('/static/terms', function(req, res) {
  res.render('static/terms', {env: res.locals.habitrpg});
});


module.exports = router;