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
var shared = require('../../common');
var request = require('request');
var os = require('os');
var moment = require('moment');
var utils = require('./utils');

var IS_PROD = nconf.get('NODE_ENV') === 'production';
var BASE_URL = nconf.get("BASE_URL");

module.exports.apiThrottle = function(app) {
  if (!IS_PROD) return;
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
  if (IS_PROD) {
    var mins = 3, // how often to run this check
      useAvg = false, // use average over 3 minutes, or simply the last minute's report
      url = 'https://api.newrelic.com/v2/applications/'+nconf.get('NEW_RELIC_APPLICATION_ID')+'/metrics/data.json?names[]=Apdex&values[]=score';
    setInterval(function(){
      // see https://docs.newrelic.com/docs/apm/apis/api-v2-examples/average-response-time-examples-api-v2, https://rpm.newrelic.com/api/explore/applications/data
      request({
        url: useAvg ? url+'&from='+moment().subtract({minutes:mins}).utc().format()+'&to='+moment().utc().format()+'&summarize=true' : url,
        headers: {'X-Api-Key': nconf.get('NEW_RELIC_API_KEY')}
      }, function(err, response, body){
        var ts = JSON.parse(body).metric_data.metrics[0].timeslices,
          score = ts[ts.length-1].values.score,
          apdexBad = score < .75 || score == 1,
          memory = os.freemem() / os.totalmem(),
          memoryHigh = memory < 0.1;
        if (/*apdexBad || */memoryHigh) throw "[Memory Leak] Apdex="+score+" Memory="+parseFloat(memory).toFixed(3)+" Time="+moment().format();
      })
    }, mins*60*1000);
  }

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
  /*logging.loggly({
    error: "Uncaught error",
    stack: (err.stack || err.message || err),
    body: req.body, headers: req.header,
    auth: req.headers['x-api-user'],
    originalUrl: req.originalUrl
  });*/
  var message = err.message ? err.message : err;
  message =  (message.length < 200) ? message : message.substring(0,100) + message.substring(message.length-100,message.length);
  res.json(500,{err:message}); //res.end(err.message);
}

function isHTTP(req) {
  return (
    req.headers['x-forwarded-proto']              &&
    req.headers['x-forwarded-proto'] !== 'https'  &&
    IS_PROD                                       &&
    BASE_URL.indexOf('https') === 0
  );
}

function isProxied(req) {
  return (
    req.headers['x-habitica-lb'] &&
    req.headers['x-habitica-lb'] === 'Yes'
  );
}

module.exports.forceSSL = function(req, res, next){
  if(isHTTP(req) && !isProxied(req)) {
    return res.redirect(BASE_URL + req.url);
  }

  next();
}

// Redirect to habitica for non-api urls
// NOTE: Currently using a static 'habitica.com' string, rather than BASE_URL,
// to make rollback easy. Eventually, BASE_URL should be migrated.

function nonApiUrl(req) {
  return req.url.search(/\/api\//) === -1;
}

module.exports.forceHabitica = function(req, res, next) {
  var ignoreRedirect = nconf.get('IGNORE_REDIRECT');

  if (IS_PROD && !ignoreRedirect && !isProxied(req) && nonApiUrl(req)) {
    return res.redirect('https://habitica.com' + req.url);
  }
  next();
};

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

  if(IS_PROD){
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

  var tavern = require('./models/group').tavern;
  var envVars = _.pick(nconf.get(), 'NODE_ENV BASE_URL GA_ID STRIPE_PUB_KEY FACEBOOK_KEY AMPLITUDE_KEY'.split(' '));
  res.locals.habitrpg = _.merge(envVars, {
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
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
    siteVersion: siteVersion,
    Content: shared.content,
    mods: require('./models/user').mods,
    tavern: tavern, // for world boss
    worldDmg: (tavern && tavern.quest && tavern.quest.extra && tavern.quest.extra.worldDmg) || {},
    _: _,
    MP_ID: nconf.get('MP_ID'),
    AMAZON_PAYMENTS: {
      SELLER_ID: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
      CLIENT_ID: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
    }
  });

  // Put query-string party (& guild but use partyInvite for backward compatibility)
  // invitations into session to be handled later
  try{
    req.session.partyInvite = JSON.parse(utils.decrypt(req.query.partyInvite))
  } catch(e){}

  next();
}
