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

var pages = ['front', 'privacy', 'terms', 'api', 'features', 'videos', 'contact', 'plans', 'new-stuff', 'community-guidelines'];

_.each(pages, function(name){
  router.get('/static/' + name, i18n.getUserLanguage, middleware.locals, function(req, res) {
    res.render('static/' + name, {env: res.locals.habitrpg});
  });
})

var mongoose = require('mongoose');
router.get('/static/avatar-:uuid.html', i18n.getUserLanguage, middleware.locals, function(req, res) {
  mongoose.model('User').findById(req.params.uuid).select('stats profile items achievements preferences backer contributor').exec(function(err, user){
    res.render('avatar-static', {
      title: user.profile.name,
      env: _.defaults({user:user},res.locals.habitrpg)
    });
  })
});
var Pageres = require('pageres'); //https://github.com/sindresorhus/pageres
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: nconf.get("S3").accessKeyId, secretAccessKey: nconf.get("S3").secretAccessKey});
var s3Stream = require('s3-upload-stream')(new AWS.S3()); //https://github.com/nathanpeck/s3-upload-stream
var bucket = 'habitrpg-dev';

router.get('/static/avatar-:uuid.png', i18n.getUserLanguage, middleware.locals, function(req, res, next) {
  var filename = 'avatar-'+req.params.uuid+'.png';
  new Pageres()//{delay:1}
    .src(nconf.get('BASE_URL')+'/static/avatar-'+req.params.uuid+'.html', ['140x147'], {crop: true, filename: filename.replace('.png','')})
    .run(function (err, file) {
      if (err) return next(err);
      var upload = s3Stream.upload({
        Bucket: bucket,
        Key: filename,
        ACL: "public-read",
        StorageClass: "REDUCED_REDUNDANCY",
        ContentType: "binary/octet-stream"
      });
      file[0].pipe(upload);

      upload.on('uploaded', function (details) {
        res.redirect(details.Location);
      });
    });
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitrpg.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;
