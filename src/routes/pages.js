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

var pages = ['front', 'privacy', 'terms', 'api', 'features', 'videos', 'contact', 'plans', 'new-stuff', 'community-guidelines', 'old-news', 'press-kit'];

_.each(pages, function(name){
  router.get('/static/' + name, i18n.getUserLanguage, middleware.locals, function(req, res) {
    res.render('static/' + name, {env: res.locals.habitrpg});
  });
})

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitrpg.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;
