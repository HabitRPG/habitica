var nconf = require('nconf');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var locals = require('../middlewares/locals');
var i18n = require('../libs/i18n');
var Remarkable = require('remarkable');
var md = new Remarkable({
  html: true,
});

const TOTAL_USER_COUNT = '1,100,000';

// -------- App --------
router.get('/', i18n.getUserLanguage, locals, function(req, res) {
  if (!req.headers['x-api-user'] && !req.headers['x-api-key'] && !(req.session && req.session.userId))
    return res.redirect('/static/front');

  return res.render('index', {
    title: 'Habitica | Your Life The Role Playing Game',
    env: res.locals.habitrpg
  });
});

// -------- Static Pages --------

var pages = ['front', 'privacy', 'terms', 'api', 'features', 'videos', 'contact', 'plans', 'new-stuff', 'community-guidelines', 'old-news', 'press-kit', 'faq', 'overview', 'apps', 'clear-browser-data', 'merch'];

_.each(pages, function(name){
  router.get('/static/' + name, i18n.getUserLanguage, locals, function(req, res) {
    res.render( 'static/' + name, {
      env: res.locals.habitrpg,
      md: md,
      userCount: TOTAL_USER_COUNT
    });
  });
});

// -------- Social Media Sharing --------

var shareables = ['level-up','hatch-pet','raise-pet','unlock-quest','won-challenge','achievement'];

_.each(shareables, function(name){
  router.get('/social/' + name, i18n.getUserLanguage, locals, function(req, res) {
    res.render( 'social/' + name, {
      env: res.locals.habitrpg,
      md: md,
      userCount: TOTAL_USER_COUNT
    });
  });
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitica.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;
