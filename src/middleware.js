var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var User = require('./models/user').model
var limiter = require('connect-ratelimit');
var logging = require('./logging');
var domainMiddleware = require('domain-middleware');
var cluster = require('cluster');
var i18n = require('./i18n.js');
var shared = require('habitrpg-shared');

module.exports.apiThrottle = function(app) {
  if (nconf.get('NODE_ENV') !== 'production') return;
  app.use(limiter({
    end:false,
    catagories:{
      normal: {
        // 2 req/s, but split as minutes
        totalRequests: 80,
        every:         60000
      }
    }
  })).use(function(req,res,next){
    //logging.info(res.ratelimit);
    if (res.ratelimit.exceeded) return res.json(429,{err:'Rate limit exceeded'});
    next();
  });
}

module.exports.domainMiddleware = function(server,mongoose) {
  return domainMiddleware({
    server: {
      close:function(){
        server.close();
        mongoose.connection.close();
      }
    },
    killTimeout: 10000
  });
}

module.exports.errorHandler = function(err, req, res, next) {
  //res.locals.domain.emit('error', err);
  // when we hit an error, send it to admin as an email. If no ADMIN_EMAIL is present, just send it to yourself (SMTP_USER)
  var stack = (err.stack ? err.stack : err.message ? err.message : err) +
    "\n ----------------------------\n" +
    "\n\noriginalUrl: " + req.originalUrl +
    "\n\nauth: " + req.headers['x-api-user'] + ' | ' + req.headers['x-api-key'] +
    "\n\nheaders: " + JSON.stringify(req.headers) +
    "\n\nbody: " + JSON.stringify(req.body) +
    (res.locals.ops ? "\n\ncompleted ops: " + JSON.stringify(res.locals.ops) : "");
  logging.error(stack);
  var message = err.message ? err.message : err;
  message =  (message.length < 200) ? message : message.substring(0,100) + message.substring(message.length-100,message.length);
  res.json(500,{err:message}); //res.end(err.message);
}


module.exports.forceSSL = function(req, res, next){
  var baseUrl = nconf.get("BASE_URL");
  // Note x-forwarded-proto is used by Heroku & nginx, you'll have to do something different if you're not using those
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https'
    && nconf.get('NODE_ENV') === 'production'
    && baseUrl.indexOf('https') === 0) {
    return res.redirect(baseUrl + req.url);
  }
  next()
}

module.exports.cors = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,HEAD,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key");
  if (req.method === 'OPTIONS') return res.send(200);
  return next();
};

var siteVersion = 1;

module.exports.forceRefresh = function(req, res, next){
  if(req.query.siteVersion && req.query.siteVersion != siteVersion){
    return res.json(400, {needRefresh: true});
  }

  return next();
};

var buildFiles = [];

var walk = function(folder){
  var res = fs.readdirSync(folder);

  res.forEach(function(fileName){
    file = folder + '/' + fileName;
    if(fs.statSync(file).isDirectory()){
      walk(file);
    }else{
      var relFolder = path.relative(path.join(__dirname, "/../build"), folder);
      var old = fileName.replace(/-.{8}(\.[\d\w]+)$/, '$1');

      if(relFolder){
        old = relFolder + '/' + old;
        fileName = relFolder + '/' + fileName;
      }

      buildFiles[old] = fileName
    }
  });
}

walk(path.join(__dirname, "/../build"));

var getBuildUrl = function(url){
  if(buildFiles[url]) return '/' + buildFiles[url];

  return '/' + url;
}

var manifestFiles = require("../public/manifest.json");

var getManifestFiles = function(page){
  var files = manifestFiles[page];

  if(!files) throw new Error("Page not found!");

  var code = '';

  if(nconf.get('NODE_ENV') === 'production'){
    code += '<link rel="stylesheet" type="text/css" href="' + getBuildUrl(page + '.css') + '">';
    code += '<script type="text/javascript" src="' + getBuildUrl(page + '.js') + '"></script>';
  }else{
    _.each(files.css, function(file){
      code += '<link rel="stylesheet" type="text/css" href="' + getBuildUrl(file) + '">';
    });
    _.each(files.js, function(file){
      code += '<script type="text/javascript" src="' + getBuildUrl(file) + '"></script>';
    });
  }
  
  return code;
}

module.exports.locals = function(req, res, next) {
  var language = _.find(i18n.avalaibleLanguages, {code: req.language});
  var isStaticPage = req.url.split('/')[1] === 'static'; // If url contains '/static/'

  // Load moment.js language file only when not on static pages
  language.momentLang = ((!isStaticPage && i18n.momentLangs[language.code]) || undefined);

  res.locals.habitrpg = {
    NODE_ENV: nconf.get('NODE_ENV'),
    BASE_URL: nconf.get('BASE_URL'),
    GA_ID: nconf.get("GA_ID"),
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    STRIPE_PUB_KEY: nconf.get('STRIPE_PUB_KEY'),
    getManifestFiles: getManifestFiles,
    getBuildUrl: getBuildUrl,
    avalaibleLanguages: i18n.avalaibleLanguages,
    language: language,
    isStaticPage: isStaticPage,
    translations: i18n.translations[language.code],
    t: function(){ // stringName and vars are the allowed parameters
      var args = Array.prototype.slice.call(arguments, 0); 
      args.push(language.code);
      return shared.i18n.t.apply(null, args);
    },
    siteVersion: siteVersion
  }

  next();
}
