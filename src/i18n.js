var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    User = require('./models/user').model,
    shared = require('habitrpg-shared'),
    translations = {};

var localePath = path.join(__dirname, "/../node_modules/habitrpg-shared/locales/")

var loadTranslations = function(locale){
  var files = fs.readdirSync(path.join(localePath, locale));
  translations[locale] = {};
  _.each(files, function(file){
    if(path.extname(file) !== '.json') return;
    _.merge(translations[locale], require(path.join(localePath, locale, file)));
  });
};

// First fetch english so we can merge with missing strings in other languages
loadTranslations('en');

fs.readdirSync(localePath).forEach(function(file) {
  if(file === 'en' || fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
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
  'en_GB': 'en-gb',
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

// Remove en_GB from langCodes checked by browser to avaoi it being 
// used in place of plain original 'en'
var defaultLangCodes = _.without(langCodes, 'en_GB');

var getUserLanguage = function(req, res, next){
  var getFromBrowser = function(){
    var acceptable = _(req.acceptedLanguages).map(function(lang){
      return lang.slice(0, 2);
    }).uniq().value();
    var matches = _.intersection(acceptable, defaultLangCodes);
    return matches.length > 0 ? matches[0] : 'en';
  };

  var getFromUser = function(user){
    var lang;
    if(user && user.preferences.language && translations[user.preferences.language]){
      lang = user.preferences.language;
    }else{
      var preferred = getFromBrowser();
      lang = translations[preferred] ? preferred : 'en';
    }
    req.language = lang;
    next();
  };

  if(req.query.lang){
    req.language = translations[req.query.lang] ? (req.query.lang) : 'en';
    next();
  }else if(req.locals && req.locals.user){
    getFromUser(req.locals.user);
  }else if(req.session && req.session.userId){
    User.findOne({_id: req.session.userId}, function(err, user){
      if(err) return next(err);
      getFromUser(user);
    });
  }else{
    getFromUser(null);
  }
};

shared.i18n.translations = translations;

module.exports = {
  translations: translations,
  avalaibleLanguages: avalaibleLanguages,
  langCodes: langCodes,
  getUserLanguage: getUserLanguage,
  momentLangs: momentLangs
};


// Export en strings only, temporary solution for mobile
// This is copied from middleware.js#module.exports.locals#t()
module.exports.enTranslations = function(){ // stringName and vars are the allowed parameters
  var language = _.find(avalaibleLanguages, {code: 'en'});
  //language.momentLang = ((!isStaticPage && i18n.momentLangs[language.code]) || undefined);
  var args = Array.prototype.slice.call(arguments, 0);
  args.push(language.code);
  return shared.i18n.t.apply(null, args);
};
