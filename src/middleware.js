var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var User = require('./models/user').model
var limiter = require('connect-ratelimit');
var logging = require('./logging');
var domainMiddleware = require('domain-middleware');
var cluster = require('cluster');

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

// Translations

var translations = {};

var loadTranslations = function(locale){
  var files = fs.readdirSync(path.join(__dirname, "/../node_modules/habitrpg-shared/locales/", locale));
  translations[locale] = {};
  _.each(files, function(file){
    _.merge(translations[locale], require(path.join(__dirname, "/../node_modules/habitrpg-shared/locales/", locale, file)));
  });
};

// First fetch english so we can merge with missing strings in other languages
loadTranslations('en');

fs.readdirSync(path.join(__dirname, "/../node_modules/habitrpg-shared/locales/")).forEach(function(file) {
  if(file === 'en') return;
  loadTranslations(file);
  // Merge missing strings from english
  _.defaults(translations[file], translations.en);
});

var langCodes = Object.keys(translations);

var avalaibleLanguages = _.map(langCodes, function(langCode){
  return {
    code: langCode,
    name: translations[langCode].languageName
  }
});

// Load MomentJS localization files
var momentLangs = {};

// Handle different language codes from MomentJS and /locales
var momentLangsMapping = {
  'en': 'en-gb',
  'no': 'nn'
};

var momentLangs = {};

_.each(langCodes, function(code){
  var lang = _.find(avalaibleLanguages, {code: code});
  lang.momentLangCode = (momentLangsMapping[code] || code);
  try{
    // MomentJS lang files are JS files that has to be executed in the browser so we load them as plain text files
    var f = fs.readFileSync(path.join(__dirname, '/../node_modules/moment/lang/' + lang.momentLangCode + '.js'), 'utf8');
    momentLangs[code] = f;
  }catch (e){}
});

var getUserLanguage = function(req, callback){
  var getFromBrowser = function(){
    var acceptable = _(req.acceptedLanguages).map(function(lang){
      return lang.slice(0, 2);
    }).uniq().value();
    var matches = _.intersection(acceptable, langCodes);
    return matches.length > 0 ? matches[0] : 'en';
  };

  if(req.session && req.session.userId){
    User.findOne({_id: req.session.userId}, function(err, user){
      if(err) return callback(err);
      if(user && user.preferences.language && translations[user.preferences.language]){
        return callback(null, _.find(avalaibleLanguages, {code: user.preferences.language}));
      }else{
        var langCode = getFromBrowser();
        // Because english is usually always avalaible as an acceptable language for the browser,
        // if the user visit the page when his own language is not avalaible yet
        // he'll have english set in his preferences, which is not good. 
        //if(user && translations[langCode]){
          //user.preferences.language = langCode;
          //user.save(); //callback?
        //}
        return callback(null, _.find(avalaibleLanguages, {code: langCode}))
      }
    });
  }else{
    return callback(null, _.find(avalaibleLanguages, {code: getFromBrowser()}));
  }
}

module.exports.locals = function(req, res, next) {
  getUserLanguage(req, function(err, language){
    if(err) return res.json(500, {err: err});

    var isStaticPage = req.url.split('/')[1] === 'static'; // If url contains '/static/'

    // Load moment.js language file only when not on static pages
    language.momentLang = ((!isStaticPage && momentLangs[language.code])|| undefined);

    res.locals.habitrpg = {
      NODE_ENV: nconf.get('NODE_ENV'),
      BASE_URL: nconf.get('BASE_URL'),
      PAYPAL_MERCHANT: nconf.get('PAYPAL_MERCHANT'),
      GA_ID: nconf.get("GA_ID"),
      IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
      STRIPE_PUB_KEY: nconf.get('STRIPE_PUB_KEY'),
      getManifestFiles: getManifestFiles,
      getBuildUrl: getBuildUrl,
      avalaibleLanguages: avalaibleLanguages,
      language: language,
      isStaticPage: isStaticPage,
      translations: translations[language.code],
      t: function(stringName, vars){
        var string = translations[language.code][stringName];
        if(!string) return _.template(translations[language.code].stringNotFound, {string: stringName});

        return vars === undefined ? string : _.template(string, vars);
      },
      siteVersion: siteVersion
    }

    next();
  });
}
