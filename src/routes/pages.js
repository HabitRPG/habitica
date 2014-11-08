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
var s3 = require('s3'); //https://github.com/andrewrk/node-s3-client
var bucket = 'habitrpg-dev';
var client = s3.createClient({
  s3Options: {
    accessKeyId: nconf.get("S3").accessKeyId,
    secretAccessKey: nconf.get("S3").secretAccessKey
  }
});
router.get('/static/avatar-:uuid.png', i18n.getUserLanguage, middleware.locals, function(req, res, next) {
  var filename = 'avatar-'+req.params.uuid+'.png';
  new Pageres({delay: 1})
    .src(nconf.get('BASE_URL')+'/static/avatar-'+req.params.uuid+'.html', ['140x147'], {crop: true, filename: filename.replace('.png','')})
    .dest(__dirname)//TODO Delete this aftewards, or stream directly to s3 instead
    .run(function (err, file) {
      if (err) return next(err);
      var params = {
        localFile: __dirname + "/" + filename,
        s3Params: { Bucket: bucket, Key: filename }
      };
      var uploader = client.uploadFile(params);
      uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
      });
      //uploader.on('progress', function() {
      //  console.log("progress", uploader.progressMd5Amount,
      //    uploader.progressAmount, uploader.progressTotal);
      //});
      uploader.on('end', function() {
        res.json(200,{file: s3.getPublicUrlHttp(bucket,filename)});
        console.log("done uploading");
      });
    });
});

// --------- Redirects --------

router.get('/static/extensions', function(req, res) {
  res.redirect('http://habitrpg.wikia.com/wiki/App_and_Extension_Integrations');
});

module.exports = router;
