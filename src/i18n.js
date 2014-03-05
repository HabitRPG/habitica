var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    User = require('./models/user').model,
    shared = require('habitrpg-shared'),
    translations = {};

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
  if(file === 'en' || file === 'README.md') return;
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
};

shared.i18n.translations = translations;

module.exports = {
  translations: translations,
  avalaibleLanguages: avalaibleLanguages,
  langCodes: langCodes,
  getUserLanguage: getUserLanguage,
  momentLangs: momentLangs
};