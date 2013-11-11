var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

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

module.exports.splash = function(req, res, next) {
  if (req.url == '/' && !req.headers['x-api-user'] && !req.headers['x-api-key'] && !(req.session && req.session.userId))
    return res.redirect('/static/front')
  next()
};

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

fs.readdirSync(path.join(__dirname, "/../locales")).forEach(function(file) {
  translations[file] = require(path.join(__dirname, "/../locales/", file, 'app.json'))
});

var getTranslatedString = function(locale, string){
  if(!locale || !string) throw new Error("Missing locale and/or string argument.");
  if(!translations[locale]) throw new Error("Missing locale '" + locale + "'");

  // TODO support nested dot-separated strings
  if(translations[locale][string]) return translations[locale][string];
  if(translations['en'][string]) return translations['en'][string];
  return 'String not found!';
}

module.exports.locals = function(req, res, next) {
  res.locals.habitrpg  = res.locals.habitrpg || {}
  _.defaults(res.locals.habitrpg, {
    NODE_ENV: nconf.get('NODE_ENV'),
    BASE_URL: nconf.get('BASE_URL'),
    PAYPAL_MERCHANT: nconf.get('PAYPAL_MERCHANT'),
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    STRIPE_PUB_KEY: nconf.get('STRIPE_PUB_KEY'),
    getManifestFiles: getManifestFiles,
    getBuildUrl: getBuildUrl,
    getTranslatedString: getTranslatedString
  });
  next()
}
/*
 //  translate = (req, res, next) ->
 //    model = req.getModel()
 //    # Set locale to bg on dev
 //    #model.set '_i18n.locale', 'bg' if process.env.NODE_ENV is "development"
 //    next()
 */
