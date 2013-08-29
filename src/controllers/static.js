var beforeEach, derby, express, path, router, staticPages;
express = require('express');
router = new express.Router();
path = require('path');
derby = require('derby');

/* ---------- Static Pages ------------*/


staticPages = derby.createStatic(path.dirname(path.dirname(__dirname)));

beforeEach = function(req, res, next) {
  /* we don't want cheat buttons on static pages*/

  req.getModel().set('_nodeEnv', 'production');
  return next();
};

router.get('/splash.html', function(req, res) {
  return res.redirect('/static/front');
});

router.get('/static/front', beforeEach, function(req, res) {
  return staticPages.render('static/front', res);
});

router.get('/static/about', function(req, res) {
  return res.redirect('http://community.habitrpg.com/node/97');
});

router.get('/static/team', function(req, res) {
  return res.redirect('http://community.habitrpg.com/node/96');
});

router.get('/static/extensions', function(req, res) {
  return res.redirect('http://community.habitrpg.com/extensions');
});

router.get('/static/faq', function(req, res) {
  return res.redirect('http://community.habitrpg.com/faq-page');
});

router.get('/static/privacy', beforeEach, function(req, res) {
  return staticPages.render('static/privacy', res);
});

router.get('/static/terms', beforeEach, function(req, res) {
  return staticPages.render('static/terms', res);
});

module.exports = router;