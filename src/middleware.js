var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var User = require('./models/user').model

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

  var css = '';

  _.each(files.css, function(file){
    css += '<link rel="stylesheet" type="text/css" href="' + getBuildUrl(file) + '">'; 
  });

  if(nconf.get('NODE_ENV') === 'production'){
    return css + '<script type="text/javascript" src="' + getBuildUrl(page + '.js') + '"></script>'; 
  }else{
    var results = css;
    _.each(files.js, function(file){
      results += '<script type="text/javascript" src="' + getBuildUrl(file) + '"></script>'; 
    });
    return results;
  }

}

// Translations

var translations = {};

var setUpTranslations = function(locale){
  var t = translations[locale] = {};
  t.server = require(path.join(__dirname, "/../locales/", locale, 'app.json'));
  t.client = t.server.clientSideStrings;
  delete t.server.clientSideStrings;
  _.merge(t.server, t.client);
}

// First fetch english so we can merge with missing strings in other languages
setUpTranslations('en');

fs.readdirSync(path.join(__dirname, "/../locales")).forEach(function(file) {
  if(file === 'en') return;
  setUpTranslations(file);
  // Merge missing strings from english
  _.defaults(translations[file].server, translations.en.server);
  _.defaults(translations[file].client, translations.en.client);
});

var langCodes = Object.keys(translations);

var avalaibleLanguages = _.map(langCodes, function(langCode){
  return {
    code: langCode,
    name: translations[langCode].server.languageName
  }
});

var getTranslatedString = function(locale, string){
  if(!locale || !string) throw new Error("Missing locale and/or string argument.");
  // Should never be called
  //if(!translations[locale]) throw new Error("Missing locale '" + locale + "'");

  // TODO support nested, dot-separated, strings
  return (translations[locale].server[string] || 'String not found.');
}

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
        if(user && translations[langCode]){
          user.preferences.language = langCode;
          user.save(); //callback?
        }
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

    res.locals.habitrpg = {
      NODE_ENV: nconf.get('NODE_ENV'),
      BASE_URL: nconf.get('BASE_URL'),
      PAYPAL_MERCHANT: nconf.get('PAYPAL_MERCHANT'),
      IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
      STRIPE_PUB_KEY: nconf.get('STRIPE_PUB_KEY'),
      getManifestFiles: getManifestFiles,
      getBuildUrl: getBuildUrl,
      avalaibleLanguages: avalaibleLanguages,
      language: language,
      translations: translations[language.code].client,
      t: function(string){
        return getTranslatedString(language.code, string);
      }
    }

    next(); 
  });
}